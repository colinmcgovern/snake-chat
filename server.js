var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8089;

const GRID_SIZE = 480;
const PLAYER_TIMEOUT = 300;

var id_to_ip = [];
var players = [];
var player_time_left = [];

app.use("/snake-game-1.1", express.static(__dirname + '/'));

app.get('/snake-game-1.1', function(req, res){
  res.sendFile(__dirname + '/');
});

io.on('connection', function(socket){

        //Assigning PLAYER_ID
        var player_id = -1;
        var ip_found = 0;
        var largest_id = -1;

        id_to_ip.foreach(function(ip, id) {

        	//Player already exists
            if(ip===socket.handshake.address.address){
            	io.emit('PLAYER_ID',id);
                ip_found = 1;
                if(largest_id < id){
                	largest_id = id;
                }
            }

        });

        //Player does not exist yet
        if(!ip_found){
        	id_to_ip[largest_id + 1] = socket.handshake.address.address;
        	io.emit('PLAYER_ID',id);
        	var new_player = {
        		pos_x: 64,
        		pos_y: 64,
			}
			players[id] = new_player;
        }

        io.emit('GRID_SIZE', GRID_SIZE);
        io.emit('players',players);

        //On Player Move 
        socket.on('player_message', function(data){

            var player_message = data;

            io.emit('message_to_players',player_message);
        });

        //On Player Move 
        socket.on('player_move', function(data){

            var player_move = data;
        
            console.log("player_move: "+player_move.id+" "+player_move.pos_x+", "+player_move.pos_y); //del

            players[player_move.id].pos_x = player_move.pos_x;
            players[player_move.id].pos_y = player_move.pos_y;

            io.emit('players',players);

        });

});

//TODO finish player_time_left here
//send out kill command when player's time is zero.
setInterval(() => {

},100);

http.listen(port, function(){
  console.log('listening on *:' + port);
});
