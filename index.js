'use strict'

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function Socket(addr='127.0.0.1', port=12346) {
    EventEmitter.call(this);
    this.net = require('net');
    this.socketpath = {
    	'port': port,
    	'family': 'IPv6',
    	'address': addr
    };
    this.msgBuffer = '';
    this.imgBuffer = '';
    this.imgFlag = false;
    this.listener = null;

    this.server = this.net.createServer((socket) => {
        this.listener = socket;
        this.emit('connected');

        /////////////////////
        /// SERVER EVENTS ///
        /////////////////////

        socket.on('data', (bytes) => {
        	if(this.imgFlag) {
        		this.imgBuffer += bytes;
        	}
            this.msgBuffer += bytes.toString();
            try {
            	var msg = this.msgBuffer;
            	if(msg == 'stop') {
            		this.listener.write(JSON.stringify({'stop': true}))
            	}
            	if(msg == 'startImg') {
            		this.imgBuffer = '';
            		this.imgFlag = true;
            	}
            	else if(msg == 'endImg') {
            		this.imgFlag = false;
            		this.emit('image', this.imgBuffer);
            		this.imgBuffer = '';
            	}
                this.msgBuffer = '';
            }catch(err) {this.msgBuffer = ''};
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
        this.server.listen(this.socketpath);
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
