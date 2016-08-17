var socket  = require( 'socket.io' );
var http = require('https');
var fs = require('fs');
var Client = require('node-rest-client').Client; 
var client = new Client();
var express = require('express');
var app     = express(); 
var options = { key: fs.readFileSync('/home/mcbcourier/certs/www.mycourierbuddy.com.key'),cert: fs.readFileSync('/home/mcbcourier/certs/212d2ffba57898b0.crt')}; 
var server  = require('https').createServer(options);
var io      = socket.listen( server );
var port    = process.env.PORT || 3000;
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
