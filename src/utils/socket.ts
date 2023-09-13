import { Socket, io } from "socket.io-client";
import getConfig from "next/config";

const { SOCKETIO } = getConfig().publicRuntimeConfig;
let socket: Socket;

const getSocket = () => {
    if (SOCKETIO.URI) {
        try {
            if (socket && socket.connected) return socket;
            if (!socket || socket.disconnected)
                socket = io(SOCKETIO.URI, { path: SOCKETIO.PATH });
            return socket;
        } catch (err) {
            console.error("Client failed to connect to Socketio Server");
            console.error(err);
            process.exit(1);
        }
    } else {
        console.error("Client failed to connect to Socketio: NO SOCKETIO URL");
        process.exit(1);
    }
};

export default getSocket;
