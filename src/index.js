const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//let count = 0;
 
//server (emit)  --> cleint (receives) -- countUpdated
//cleint (emit)  --> server (receives) -- increment

io.on('connection', (socket) => {
    console.log("New Connection");

    socket.on('join', ({ username, room }, callback ) => {
        const {error, user } = addUser({ id: socket.id, username, room})

        if(error) { 
           return callback(error)
        }

        //socket.join is used to join the room name similar given in that code
        socket.join(user.room)

        //socket.emit to send message to specific client
            socket.emit('message', generateMessage('Admin','Welcome!'))

        //socket.broadcast to send message to everyone joined except the user itself
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()

        //io.to.emit is used to send message to everyone in a particular room not outside the room.
        //socket.broadcast.to.emit is used to send message to everyone except the user itself in a particular room not outside the room.
    })

    //io.emit to send message to everyone connected
    socket.on('sendMessage',(message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',  (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))

            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
    
        }
    })
    // socket.emit('countUpdated',count)

    // socket.on('increment', () => {
    //     count++

        //for single user giving response data
           //socket.emit('countUpdated',count)

       //for giving updated data to every connected user
    //     io.emit('countUpdated',count)
    // })
})

server.listen(port , () => {
    console.log(`Server Started At PORT : ${port}`);
}) 