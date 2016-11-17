var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var monolog = require('monolog');
var Logger = monolog.Logger;
var ConsoleLogHandler = monolog.handler.ConsoleLogHandler;
var _ = require('lodash');

var log = new Logger('hazardhulen');
log.pushHandler(new ConsoleLogHandler());

function table() {
    this.deck = _.shuffle(_.range(1, 52)),
    this.turnHolder = 0,
    this.activePlayers =[],
    this.dealerHand = [],
    this.state = 'idle'
};

function Player(id) {
            this.id = id,
            this.hand = [],
            this.score = 0,
            this.bet = 0,
            this.balance = 15000
};

var table = new table();

function drawCard() {
    var deck = table.deck;
    var card = deck[deck.length-1];
	deck.length = deck.length - 1;
    return card;
}

function nextPlayer() {
    log.info("Next player", table.turnHolder)
	
	table.turnHolder++;

    if(table.turnHolder > table.activePlayers.length){
	dealerTurn();	
	}
}

function dealerTurn() {
    //Draw cards (If more than 50% players are above dealer, draw card) - LorteLogic(TM)
    //Calculate Winners
    //Payout
}

function calculateScore(hand) {
    var values = [];
    var numAces = 0;

    for (var card in hand) {
		card = hand[card]
        // Value of image cards is 10
        var value = Math.min(card % 13, 10);
        if (value == 1) {
            value = 11;
            numAces += 1;
        } else if(value == 0) {
			value = 10;
		}
        values.push(value);
		log.debug(card + " = " + value)
    }

    var sum = _.sum(values)
    while (sum > 21 && numAces > 0) {
        numAces -= 1;
        sum -= 10;
    }

	log.debug("Score calculated", sum)
    return sum;
}

function updateTableState(){
	log.debug(table);
	io.sockets.emit('updateTableState', JSON.stringify(table));
}

function findPlayer(id){
		log.debug("Finding player - entering loop for id", id)
	     for (var ply in table.activePlayers) {
			 ply = table.activePlayers[ply];
			 log.debug("Finding player", ply.id)
            if (ply.id == id) return ply;
        }
}

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', function (client) {
    var id = client.conn.id;
	
    client.emit('setId', id);
    updateTableState();

    client.on('joinTable', function () {
		log.notice("Hej jeg bliver kaldt");
		var id = client.conn.id;
		player = new Player(id);
        table.activePlayers.push(player);
        updateTableState();
        log.notice(player.id + " has joined the table.");
    });

    client.on('leaveTable', function () {
        if (table.state != "playing") {
            delete table.activePlayers[client.conn.id];
            updateTableState();
        }
    });

    client.on('bet', function (amt) {
        // Don't allow player to bet twice
        var player = findPlayer(client.conn.id)//TODO: find player function
        if (player.bet != 0) {
            client.emit('errorAlreadyPlacedBet');
            return;
        }

        // Don't allow player to place bets he can't afford
        if (amt > player.balance) {
            client.emit('errorCantAffordBet');
            return;
        }

        // Set bet and broadcast table state
        player.balance -= amt;
        player.bet = amt;
        updateTableState();

        // Check whether all players have betted
        for (var ply in table.activePlayers) {
			 ply = table.activePlayers[ply];
            if (ply.bet == 0) return;
        }

        // Start game
        table.state = "playing";

        // Deal cards
        for (var ply in table.activePlayers) {
			 ply = table.activePlayers[ply];
            ply.hand = [drawCard(), drawCard()];
			log.notice("Player Hand: ", ply.hand);
        }

        table.dealerHand = [drawCard(), drawCard()];
log.notice("Dealer hand: ", table.dealerHand);
		
        updateTableState();
    });

    client.on('hit', function () {
        // Make sure that game is in playing state
        if (table.state != "playing") {
            return;
        }

		var player = findPlayer(client.conn.id);
        // Make sure that hitter is current player
		log.notice(table.activePlayers.indexOf(player));
        if (table.activePlayers.indexOf(player) != table.turnHolder) {
            log.notice("Non-current player sent hit");
            return;
        }

        // Draw a card
        player.hand.push(drawCard());

        // Check for bust/blackjack
        var score = calculateScore(player.hand);
        player.score = score;
        if (score >= 21) {
            nextPlayer();
        }
		updateTableState();
    });

    client.on('stand', function () {
        // Make sure that game is in playing state
        if (table.state != "playing") {
            return;
        }

        // Make sure that stander is current player
        if (client.conn.id != table.turnHolder) {
            log.notice("Non-current player sent stand");
            return;
        }

        nextPlayer();
    });

    client.on('disconnect', function () {
        delete table.activePlayers[client.conn.id];
    });
});

server.listen(13337);
log.info('Server listening on localhost:13337');
