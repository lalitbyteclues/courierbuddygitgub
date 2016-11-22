var socket  = require( 'socket.io' );
var http = require('http');
var fs = require('fs');
var Client = require('node-rest-client').Client; 
var client = new Client();
var express = require('express');
var app     = express(); 
var server  = require('http').createServer();
var io      = socket.listen( server );
var port    = process.env.PORT || 4000;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
io.on('connection', function (socket) {
  socket.on('new_count_message', function( data ) {
    io.sockets.emit( 'new_count_message', { 
    	new_count_message: data.new_count_message
    });
  });
  socket.on('update_count_message', function( data ) {
    io.sockets.emit( 'update_count_message', {
    	update_count_message: data.update_count_message 
    });
  });
  socket.on('new_message', function( data ) {
	  console.log('New Message %d', data.id);
      io.sockets.emit( 'new_message',data);
  });
  socket.on('get_history', function( channelid )
  {   
	  io.sockets.emit( 'history',channelid); 
  });
});
