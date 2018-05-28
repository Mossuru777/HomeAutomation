"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const os = require("os");
const server_1 = require("./server");
const config_store_1 = require("./store/config_store");
if (process === undefined || require === undefined) {
    console.error("Node.js environment required.".bgRed.white);
    process.exit(1);
}
try {
    require("dotenv").config();
}
catch (_a) {
}
let server;
try {
    server = new server_1.Server(config_store_1.ConfigStore.config);
}
catch (e) {
    console.error(e.message.red);
    process.exit(1);
}
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
//# sourceMappingURL=index.js.map