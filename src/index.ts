import "colors";
import * as os from "os";
import { Server } from "./server";
import { ConfigStore } from "./store/config_store";

if (process === undefined || require === undefined) {
    console.error("Node.js environment required.".bgRed.white);
    process.exit(1);
}

// Injection environment variable
try {
    require("dotenv").config();
} catch {
}

// Start server
let server: Server;
try {
    server = new Server(ConfigStore.config);
} catch (e) {
    console.error(e.message.red);
    process.exit(1);
}

// Define signal handlers
process.on("SIGHUP", () => {
    server.stop();
    process.exit(128 + os.constants.signals.SIGHUP);
});
process.on("SIGINT", () => {
    server.stop();
    process.exit(128 + os.constants.signals.SIGINT);
});
process.on("SIGQUIT", () => {
    server.stop();
    process.exit(128 + os.constants.signals.SIGQUIT);
});
process.on("SIGTERM", () => {
    server.stop();
    process.exit(128 + os.constants.signals.SIGTERM);
});
