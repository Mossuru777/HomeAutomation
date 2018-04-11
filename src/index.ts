import "colors";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as os from "os";
import { isConfig } from "./model/config";
import { Server } from "./server";

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
    server = (() => {
        const config_path = process.env["HOMEAUTOMATION_CONFIG_PATH"] || "/usr/local/etc/homeautomation/config.yml";
        const config = yaml.safeLoad(
            fs.readFileSync(config_path, "utf-8")
        );

        if (isConfig(config)) {
            return new Server(config);
        }
        throw Error("invalid config: " + config_path);
    })();
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
