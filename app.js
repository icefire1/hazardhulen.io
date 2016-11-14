var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var monolog = require('monolog')
var Logger = monolog.Logger
var ConsoleLogHandler = monolog.handler.ConsoleLogHandler
var range = require('lodash/range')

var log = new Logger('hazardhulen')
log.pushHandler(new ConsoleLogHandler())

var table = {
		'deck': range(1, 52),
		'turnHolder': 0,
		'activePlayers': [],
		'dealerHand': []
}

nextPlayer() {
	table.turnHolder = (table.turnHolder + 1) % table.activePlayers.length
	return table.activePlayers[table.turnHolder]
}

app.use(express.static(__dirname + '/bower_components'))
app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/client.html')
})

io.on('connection', function(client) {
	var id = client.conn.id
	var player = null

	client.emit('setId', id)
	client.emit('updateTableState', table)

	client.on('joinTable', function() {
		player = {
			'id': id,
			'socket': client,
			'hand': [],
			'bet': 0,
			'balance': 15000
		}

		// TODO: Fix hardcoded index
		table.activePlayers.push(player)
		client.emit('updateTableState', table)
		client.broadcast.emit('updateTableState', table)
	})

	client.on('bet', function(amt) {
		// Don't allow player to bet twice
		if(player.balance != 0) {
			client.emit('errorAlreadyPlacedBet')
			return
		}

		// Don't allow player to place bets he can't afford
		if(amt > player.balance) {
			client.emit('errorCantAffordBet')
			return
		}

		// Set bet and broadcast table state
		player.balance -= amt
		player.bet = amt
		client.emit('updateTableState', table)
		client.broadcast.emit('updateTableState')
	})

    client.on('hit', function() {

    })

    client.on('stand', function(){

    })
})

server.listen(13337)
log.info('Server listening on localhost:13337')
