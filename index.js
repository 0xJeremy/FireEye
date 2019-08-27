'use strict'

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function Socket(addr='127.0.0.1', port=12346) {
    EventEmitter.call(this);
    this.net = require('net');
    this.socketpath = {
    	'port': port,
    	'family': 'IPv',
    	'address': addr
    };
    this.msgBuffer = '';
    this.listener = null;

    this.server = this.net.createServer((socket) => {
        this.listener = socket;
        this.emit('connected');

        /////////////////////
        /// SERVER EVENTS ///
        /////////////////////

        socket.on('data', (bytes) => {
            this.msgBuffer += bytes.toString();
            try {
            	if(this.msgBuffer == 'stop') {
            		this.listener.write(JSON.stringify({'stop': true}))
            	}
            	if(this.msgBuffer.includes('START_IMAGE')) {
            		this.msgBuffer = this.msgBuffer.replace('START_IMAGE', '')
            	}
            	else if(this.msgBuffer.includes('END_IMAGE')) {
            		this.msgBuffer = this.msgBuffer.replace('END_IMAGE', '')
            		this.emit('image', this.msgBuffer);
            		this.msgBuffer = '';
            	}
            }catch(err) {};
        });

        socket.on('end', () => {
            this.emit('disconnected');
        });

    });

    //////////////////////////
    /// SOCKET INFORMATION ///
    //////////////////////////

    this.getAddress = function() {
        return this.server.address();
    };

    this.openSocket = function() {
        this.server.listen(this.socketpath.port, this.socketpath.address);
    }

    this.write = function(dataType, data) {
        var msg = {
            'type': dataType,
            'data': data
        }
        this.listener.write(JSON.stringify(msg))
    }

    this.getSocket = function() {
        return this.listener;
    }

    this.openSocket();

}

inherits(Socket, EventEmitter);

module.exports = exports = Socket;
