import { Server, Socket } from "socket.io";
import { createServer } from "https";
import { readFileSync } from "fs";

const PORT = process.env.PORT || 3101;

const privateKey = readFileSync("/app/ssl/privkey1.pem");
const certificate = readFileSync("/app/ssl/fullchain1.pem");

const httpsServer = createServer({
    key: privateKey,
    cert: certificate,
});

const io = new Server(httpsServer, {
    path: "/socketio/socket.io",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket: Socket) => {
    console.log(`New socket connection: ${socket.id}`);

    socket.on("joinRoom", (room, callback) => {
        socket.join(room);
        console.log(`${socket.id} has joined room ${room}`);
        callback(true);
    });

    socket.on("leaveRoom", (room, callback) => {
        socket.leave(room);
        console.log(`${socket.id} has left room ${room}`);
        callback(true);
    });

    socket.on("roomMessage", ({ convo_id, content }, callback) => {
        io.to(convo_id.toString()).emit("roomMessage", content);
        console.log(`${socket.id} sends message to room: ${convo_id.toString()}\n"${content}"`);
        callback(true);
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Clean up any resources associated with the socket
    });
});

httpsServer.listen(PORT, () => {
    console.log(`Socket.io Server running on port ${PORT}`);
});
