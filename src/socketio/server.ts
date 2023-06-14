import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import { readFileSync } from 'fs';
import getConfig from 'next/config';

const PORT = process.env.PORT || 3101

const httpServer = createServer({});

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket: Socket) => {
    console.log(`New socket connection: ${socket.id}`);

    socket.on("joinRoom", room => {
        socket.join(room)
        console.log(`${socket.id} has joined room ${room}`)
    })

    socket.on("leaveRoom", room => {
        socket.leave(room)
        console.log(`${socket.id} has left room ${room}`)
    })

    socket.on('roomMessage', ({ convo_id, content }) => {
        io.to(convo_id.toString()).emit("roomMessage", content)
        console.log(`${socket.id} sends message to room: ${convo_id.toString()}\n"${content}"`)
    })

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`)
        // Clean up any resources associated with the socket
    })
})

httpServer.listen(PORT, () => {
    console.log(`Socket.io Server running on port ${PORT}`)
})