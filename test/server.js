const express = require('express');
var app = express();
var bodyParser = require('body-parser');
const net = require('net');
const fs = require('fs');
const FireEye = require('../index.js');
const zlib = require('zlib');

var socket = new FireEye()

//////////////////
/// PARAMETERS ///
//////////////////

const PORT = process.env.PORT || 5000

var server = app.listen(PORT, function() { console.log("Listening on port " + PORT)});
var io = require('socket.io').listen(server);

///////////////////////
/// EXPRESS HEADERS ///
///////////////////////

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

///////////////////////////
/// FRONT-END ENDPOINTS ///
///////////////////////////

app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/client'));
app.use('/', express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.render('./index.html');
});

socket.on('image', (data) => {
	// console.log("Here's what I have")
	// zlib.createUnzip(data, (err, result) => {
	// 	if(err) {throw err}
	// 	else {console.log(result); io.emit('image', result)}
	// })
	
	// zlib.unzip(data, function(err, dezipped) {
	// 	if(err) {
	// 		throw err
	// 	}
	// 	else {
	// 		console.log(dezipped.toString())
	// 		console.log('From server')
 //        	io.emit('image', dezipped.toString());
	// 	}
 //    });
 	io.emit('image', data);
})
