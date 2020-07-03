const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage,generateLocationMessage } = require('./utils/messages');
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users');

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public');

app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log("client connected");

    socket.on('join',({username,room},callback)=>{
        const {user,error} = addUser({id:socket.id,username,room});
        if(error)
            return callback(error);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined`));
        socket.emit('message',generateMessage(user.username,'Welcome to the chat room'));

        io.to(user.room).emit('userData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback();
    });

    socket.on('sendMessage',(message,callback) =>{
        const user = getUser(socket.id);
        if(user)
        {
            io.to(user.room).emit('message',generateMessage(user.username,message));
            callback();
        }    
    });
    socket.on('sendLocation',(location,callback)=>{
        const user = getUser(socket.id);
        if(user)
        {
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`));
            callback('Location Shared');
        }
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user)
        {
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} left the chat`));
            io.to(user.room).emit('userData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }      
    })
})

server.listen(port,()=> console.log('server is up at port '+port));