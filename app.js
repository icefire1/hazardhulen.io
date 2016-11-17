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

var table = {
    'deck': _.shuffle(_.range(1, 52)),
    'turnHolder': 0,
    'activePlayers': [],
    'dealerHand': [],
    'state': 'idle'
};

function drawCard() {
    var deck = table.deck;
    var card = deck[deck.length-1];
    deck.pop;
    return card;
}

function nextPlayer() {
    log.info("Next player", table.turnHolder)

    var isNext = false;
    for (ply in table.activePlayers) {
        if (isNext) {
            table.turnHolder = ply.id;
            io.sockets.emit('updateTableState', table);
            return;
        }
        else if (table.turnHolder == ply.id) {
            isNext = true;
        }
    }

    //If we are outside the loop, then it's the dealers turn
    dealerTurn();
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
        // Value of image cards is 10
        var value = Math.min(card % 13, 10);
        if (value == 1) {
            value = 11;
            numAces += 1;
        }
        values.push(card % 13);
    }

    //var sum = values.reduce((a, b) = > a + b, 0)
    while (sum > 21 && numAces > 0) {
        numAces -= 1;
        sum -= 10;
    }

    return sum;
}

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', function (client) {
    var id = client.conn.id;
    var player = null;

    client.emit('setId', id);
    client.emit('updateTableState', table);

    client.on('joinTable', function () {
        player = {
            'id': id,
            'socket': client,
            'hand': [],
            'score': 0,
            'bet': 0,
            'balance': 15000
        };

        table.activePlayers[player.id] = player;
        io.sockets.emit('updateTableState', table);
        log.notice(player.id + " has joined the table.");
    });

    client.on('leaveTable', function () {
        if (table.state != "playing") {
            delete table.activePlayers[client.conn.id];
            io.sockets.emit('updateTableState', table);
        }
    });

    client.on('bet', function (amt) {
        // Don't allow player to bet twice
        var player = table.activePlayers[client.conn.id];
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
        io.sockets.emit('updateTableState', table);

        // Check whether all players have betted
        for (ply in table.activePlayers) {
            if (ply.bet == 0) return;
        }

        // Start game
        table.state = "playing";

        // Deal cards
        for (ply in table.activePlayers) {
            ply.hand = [drawCard(), drawCard()];
        }

        table.dealerHand = [drawCard(), drawCard()];

        io.sockets.emit('updateTableState', table);
    });

    client.on('hit', function () {
        // Make sure that game is in playing state
        if (table.state != "playing") {
            return;
        }

        // Make sure that hitter is current player
        if (client.conn.id != table.turnHolder) {
            log.notice("Non-current player sent hit");
            return;
        }

        // Draw a card
        player.hand.push(drawCard());

        // Check for bust/blackjack
        var score = calculateScore();
        player.score = score;
        if (score >= 21) {
            nextPlayer();
        }
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
