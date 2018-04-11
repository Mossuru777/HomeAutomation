"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const fs = require("fs");
const yaml = require("js-yaml");
const os = require("os");
const config_1 = require("./model/config");
const server_1 = require("./server");
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
    server = (() => {
        const config_path = process.env["HOMEAUTOMATION_CONFIG_PATH"] || "/usr/local/etc/homeautomation/config.yml";
        const config = yaml.safeLoad(fs.readFileSync(config_path, "utf-8"));
        if (config_1.isConfig(config)) {
            return new server_1.Server(config);
        }
        throw Error("invalid config: " + config_path);
    })();
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