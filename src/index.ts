import { Server } from "./server";

if (process === undefined || require === undefined) {
    throw Error("Node.js environment required.");
}

const server = new Server();
server.start();
