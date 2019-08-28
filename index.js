'use strict'

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var ip = require('ip')

var RUN_IMG = 'BEGIN_IMAGE'
var END_IMG = 'END_IMAGE'
var STOP = 'STOP'

function FireEye(addr=ip.address(), port=8080) {
    EventEmitter.call(this);
    this.net = require('net');
    this.socketpath = {
        'port': port,
        'family': 'IPv4',
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
                if(this.msgBuffer == STOP) {
                    this.write(STOP, 'True')
                }
                else if(this.msgBuffer.includes(RUN_IMG)) {
                    this.msgBuffer = this.msgBuffer.replace(RUN_IMG, '')
                }
                else if(this.msgBuffer.includes(END_IMG)) {
                    this.msgBuffer = this.msgBuffer.replace(END_IMG, '')
                    this.emit('image', this.msgBuffer);
                    this.msgBuffer = '';
                }
                else {
                    var jsonData = JSON.parse(this.msgBuffer);
                    this.emit(jsonData['type'], jsonData['data']);
                    this.channels[jsonData['type']] = jsonData['data'];
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
        };
        this.listener.write(JSON.stringify(msg));
    }

    this.get = function(dataType) {
        return this.channels[dataType];
    }

    this.getSocket = function() {
        return this.listener;
    }

    this.getAddress = function() {
        return this.socketpath.address
    }

    this.getPort = function() {
        return this.socketpath.port
    }

    this.openSocket();

}

inherits(FireEye, EventEmitter);

module.exports = exports = FireEye;
