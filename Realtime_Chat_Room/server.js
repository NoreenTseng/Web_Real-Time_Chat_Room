const express = require('express');
const appServer = express();
const http = require('http');
const url = require('url');
const path = require('path')
const server = http.createServer(appServer);
const socketio = require('socket.io');
const io = socketio(server);
const port = 4567;
var countPPL = -1;
chatRecordArray = [];
userInfosArray = [];

/***** Push home.html to browser *******/
/* When server is on and recieve a request, a response(push hme.html) will send to the browser(http://localhost:3456/) */
appServer.get('/', function(request, response){
	response.sendFile(__dirname + '/public/home.html');
});
appServer.get('/chatPage.html', function(request, response){
	response.sendFile(__dirname + '/public/chatPage.html');
});
appServer.get('/home.html', function(request, response){
	response.sendFile(__dirname + '/public/home.html');
});

/****** Define Package (Username, Time, Message) *********/
function chatPackage(index, username, message){
	const d = new Date();
	var day = d.getDate();
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var hour = d.getHours();
	var minute = d.getMinutes();
	var time = [day, month, year, hour, minute];
	var singleRcord = {index, username, message, time};
	dbRecord(singleRcord);
	return {
		username, 
		message,
		time
	};
}
function dbRecord(singleRcord){
	chatRecordArray.push(singleRcord);
}

/*
appServer.get('/chatPage.html', function(request, response){
    response.sendFile(__dirname + '/public/chatPage.html');
});
*/
/***** Port Listening *******/
server.listen(port, function(){
    console.log("Server starts to listen.");
});

/***** Using socket to connect and disconnect *******/
/* io: the identification of Server side. socket: the identification of current client. */
io.on('connection', function(socket){
	socket.emit("1stConnection", "Hi login page, welcome from server.");
	socket.on('newUser', function(msg){
		console.log(msg);
		console.log('1st Connection OK.');
		socket.emit("1stcheck", "Hi from server.");
		countPPL++;
	});
	/******* collect user's name and password from home.html ************/
	socket.on("userLoginInfo", function({username, password}){
/*		if(userInfosArray.length != 0){
		for(let ii = 0; ii < userInfosArray.length; ii++){
			if(userInfosArray[ii].username == username){
				var jj = 1;
				socket.emit("userCheck", 1);
				break;
			}
		}
		if(jj != 1){
			var newuser = {countPPL, username, password};
			userInfosArray.push(newuser);
			socket.emit("userCheck", 0);
		}
		}*/
		//else{
			var newuser = {countPPL, username, password};
			userInfosArray.push(newuser);
			//socket.emit("userCheck", 0);
		//}
	});
	var index = countPPL;
	socket.emit("2ndConnection", index);
    console.log('Connection OK.');
    socket.on("newM", function(msg){
    	console.log("A new client comes in the chat room.");
    	console.log("-----------------\n" + msg + "\n-----------------");
    	if(chatRecordArray)
    		socket.emit("recentMsgs", chatRecordArray);
    });
    /****Receive new Msg from client ****/
	socket.on("newMessage", function(newMsg){
		console.log(newMsg.userIndex);
		var i = newMsg.userIndex;
		io.emit("newMessageDispaly", chatPackage(newMsg.userIndex, userInfosArray[i].username, newMsg.msg));
	});   
	
	
	
    socket.on('disconnect', function(){
        console.log('Disconnection OK.\n');
    });
});

