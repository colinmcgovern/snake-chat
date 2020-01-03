var socket = io();

var PLAYER_ID = -1;

var players = [];
var players_disp = [];
var messages = [];

var GRID_SIZE = -1;

const MESSAGE_TIMEOUT = 30;

socket.on('PLAYER_ID', function(data) {
    PLAYER_ID = data;
});

socket.on('GRID_SIZE', function (data) {
    GRID_SIZE = data; 
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Setting vars from html 
var canvas = document.getElementById('myCanvas');
var width = canvas.width;
var height = canvas.height;

var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.imageSmoothingEnabled= false;

//Snake Images
var left_img=document.getElementById("left");
var right_img=document.getElementById("right");
var up_img=document.getElementById("up");
var down_img=document.getElementById("down");

//Ground images
var map_img=document.getElementById("map");

//Messages from server
socket.on('message_to_players', function(data) {
    new_message = [];
    new_message[0] = data;
    new_message[1] = MESSAGE_TIMEOUT;
    messages.push(new_message);
});

//Player array update from server
socket.on('players', function(data) {

    players = data;

    for(var i=0;i<players.length;i++){

        //Creating display player if it is not yet defined
        if(players_disp[i]===undefined){
            players_disp[i] = {
                facing : "right",
                pos_x : players[i].pos_x,
                pos_y : players[i].pos_y,
                dest_x : players[i].pos_x,
                dest_y : players[i].pos_y
            };
        }else{
            img : "right",
            players_disp[i].dest_x = players[i].pos_x;
            players_disp[i].dest_y = players[i].pos_y;
        }
        
    }

});

//Updating 60 Times A Second
setInterval(() => {

    //Updating display array
    for(i=0; i<players_disp.length; i++){

        if( Math.abs(Math.floor(players_disp[i].dest_x)-Math.floor(players_disp[i].pos_x))>2
             || Math.abs(Math.floor(players_disp[i].dest_y)!=Math.floor(players_disp[i].pos_y))>2 ) {

            //Moving snake position
            speed = 1;

            var angle = Math.atan2( (players_disp[i].pos_y - players_disp[i].dest_y),
             (players_disp[i].pos_x - players_disp[i].dest_x) );

            players_disp[i].pos_x += -Math.cos(angle) * speed;
            players_disp[i].pos_y += -Math.sin(angle) * speed;

            //Changing image based off of movement
            if((-Math.cos(angle) > 0) && (Math.abs(Math.cos(angle)) > Math.abs(-Math.sin(angle))) ){
                players_disp[i].facing = "right";
            }
            if((-Math.cos(angle) < 0) && (Math.abs(Math.cos(angle)) > Math.abs(-Math.sin(angle))) ){
                players_disp[i].facing = "left";
            }
            if((-Math.sin(angle) > 0) && (Math.abs(Math.cos(angle)) < Math.abs(-Math.sin(angle))) ){
                players_disp[i].facing = "down";
            }
            if((-Math.sin(angle) < 0) && (Math.abs(Math.cos(angle)) < Math.abs(-Math.sin(angle))) ){
                players_disp[i].facing = "up";
            }
            
        }
    }

    if(GRID_SIZE!=-1){

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Drawing map
        ctx.drawImage(
            map_img,
            0,
            0,
            map_img.width * (width/GRID_SIZE),
            map_img.height * (height/GRID_SIZE)
        );

         for(var i=0;i<players_disp.length;i++){

            var img = right_img;
            if(players_disp[i].facing == "right")img = right_img;
            if(players_disp[i].facing == "left")img = left_img;
            if(players_disp[i].facing == "down")img = down_img;
            if(players_disp[i].facing == "up")img = up_img;

            ctx.drawImage(
                img,
                Math.floor(players_disp[i].pos_x) * (width/GRID_SIZE),
                Math.floor(players_disp[i].pos_y) * (height/GRID_SIZE),
                img.width * (width/GRID_SIZE),
                img.height * (height/GRID_SIZE)
            );
         }

         for(var i=0;i<messages.length;i++){

            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.globalAlpha = messages[i][1]/MESSAGE_TIMEOUT;
            ctx.fillStyle = "#000000";
            ctx.font = "20px Times New Roman";
            ctx.fillText(messages[i][0].message,
                players_disp[messages[i][0].id].pos_x * (width/GRID_SIZE),
                players_disp[messages[i][0].id].pos_y * (width/GRID_SIZE),
                128);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(messages[i][0].message,
                players_disp[messages[i][0].id].pos_x * (width/GRID_SIZE) - 1,
                players_disp[messages[i][0].id].pos_y * (width/GRID_SIZE) - 1,
                128);
            ctx.globalAlpha = 1;

            messages[i][1]--;
            if(messages[i][1]<=0){
                messages.splice(i, 1);
            }
         }

    }

}, 100);

//Sending messages
document.getElementById("send").addEventListener("click", function(){
    var player_message = {
        id: PLAYER_ID,
        message: document.getElementById("message").value
    }
    socket.emit('player_message',player_message);
});

//Player Movement
canvas.addEventListener('click', function(evt) {
    
    var pos = getMousePos(canvas, evt);
    
    if(PLAYER_ID!=-1){

        var player_move = {
            id: PLAYER_ID,
            pos_x: Math.floor(pos.x / (width/GRID_SIZE)),
            pos_y: Math.floor(pos.y / (width/GRID_SIZE))
        }

        socket.emit('player_move',player_move);
    }

} , false);




    

