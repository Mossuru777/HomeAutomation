import * as fs from "fs";
import * as yaml from "js-yaml";
import { sprintf } from "sprintf-js";
import { isConfig } from "./model/config";
import { Server } from "./server";

if (process === undefined || require === undefined) {
    throw Error("Node.js environment required.");
}

// Injection environment variable
try {
    require("dotenv").config();
} catch {}

// Start server
const server = (() => {
    const config_path = process.env["HOMEAUTOMATION_CONFIG_PATH"] || "/usr/local/etc/homeautomation/config.yml";

    const config = yaml.safeLoad(
        fs.readFileSync(config_path, "utf-8")
    );
    if (isConfig(config)) {
        return new Server(config);
    }
    throw Error(sprintf("invalid config: %s", config_path));
})();
server.start();
