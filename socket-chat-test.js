var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);

users = [];
connections = [];


server.listen(process.env.PORT || 3000);
console.log('server running...');

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/index.html');
});

//io.sockets.on('connection', (socket) => {
io.on('connection', (socket) => {
    console.log(socket.id);
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', function(room, callback) {
        console.log(room);
        
        callback(true);
        socket.join(room);
    });
    
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Disconnect
    socket.on('disconnect', (data) =>{
        users.splice(users.indexOf(socket.user), 1);
        updateUserName();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    })
    //Send Message
    socket.on('send message', (data, to) =>{
        console.log(data);
        
        /////////// for one to one //////////
        //io.to(to).emit('new message', {msg: data, user: socket.user});
        
        //////////////// for room //////////////
        room = to;
        io.sockets.to(room).emit('new message', {msg: data, user: socket.user});
    });
    //New user
    socket.on('new user', (data, callback) =>{
        callback(true);
        var userData = {name: data, id: socket.id}
        socket.user = userData;
        users.push(userData);
        updateUserName();
    })

    

    function updateUserName(){
        io.sockets.emit('get users', users);
    }
})
