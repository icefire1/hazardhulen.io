#!/usr/bin/env node

// socket.io

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");

port = 8889

http.listen(port, function(){
    console.log('Server listening on ' + port)
});

io.on('connection', function(socket){
    // TODO: generate token and update token on client.
    socket.emit("updateToken", generateToken(socket.handshake.address))
    socket.on('sendUrl', function(url){
        console.log(url);
    });
    socket.on('connect_error', function(e){
        console.error(e);
    });
    socket.on('disconnect', function(){
        // clean Cache
    });
});

function generateSalt(len) {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        setLen = set.length,
        salt = '';
    for (var i = 0; i < len; i++) {
        var p = Math.floor(Math.random() * setLen);
        salt += set[p];
    }
    return salt;
}

function generateToken(ip) {
    saltLength = 9
    salt = generateSalt(saltLength)
    token = SHA256(ip + salt) 
    console.log(token)
    return token
}

