'use strict'

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var ip = require('ip');

var STOP = 'STOP';
var ACK = 'ACK';
var IMAGE = 'image';
var NEWLINE = '\n';
var MAXSIZE = 1500000;
var TIMEOUT = 0;
var base64 = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');

function FireEye(addr=ip.address(), port=8080, maxSize=MAXSIZE, timeout=TIMEOUT) {
    EventEmitter.call(this);
    this.net = require('net');
    this.socketpath = {
        'port': port,
        'family': 'IPv4',
        'address': addr
    };
    this.maxSize = maxSize;
    this.timeout = timeout;
    this.lastData = new Date().getTime();
    this.msgBuffer = '';
    this.channels = {};
    this.listener = null;

    this.server = this.net.createServer((socket) => {
        this.listener = socket;
        this.emit('connected');

        /////////////////////
        /// SERVER EVENTS ///
        /////////////////////

        socket.on('data', (bytes) => {
            this.msgBuffer += bytes.toString();
            if(this.msgBuffer.length > this.maxSize) {
                this.reset();
                return;
            }
            try {
                var jsonData = JSON.parse(this.msgBuffer.split(NEWLINE)[0]);
                if(jsonData[STOP] != undefined) {
                    this.write(STOP, 'True');
                }
                if(jsonData['type'] == IMAGE) {
                    if(base64.test(jsonData['data'])) {
                        this.emit(jsonData['type'], jsonData['data']);
                    }
                } else {
                    this.emit(jsonData['type'], jsonData['data']);
                }
                this.channels[jsonData['type']] = jsonData['data'];
                this.reset();
            } catch(err) {};
        });

        socket.on('end', () => {
            this.emit('end');
        });

        socket.on('error', (err) => {
            this.emit('error', err);
        });

    });

    //////////////////////////
    /// SOCKET INFORMATION ///
    //////////////////////////

    this.reset = function() {
        this.msgBuffer = '';
        this.lastData = new Date().getTime();
        this.write(ACK, 'True');
    }

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
        return this.socketpath.address;
    }

    this.getPort = function() {
        return this.socketpath.port;
    }

    this.ack = function() {
        this.write('ack', 'True')
    } 

    this.openSocket();

    if(this.timeout > 0) {
        setInterval( () => {
            if(((new Date().getTime() - this.lastData) / 1000) > this.timeout) {
                if(this.msgBuffer == '') {
                    try { this.reset() }
                    catch(err) {}
                }
            }
        }, this.timeout);
    }

}

inherits(FireEye, EventEmitter);

module.exports = exports = FireEye;
