"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const sprintf_js_1 = require("sprintf-js");
const config_1 = require("./model/config");
const server_1 = require("./server");
if (process === undefined || require === undefined) {
    throw Error("Node.js environment required.");
}
const server = (() => {
    const config_path = "/usr/local/homeautomation/config.yml";
    const config = yaml.safeLoad(fs.readFileSync(config_path, "utf-8"));
    if (config_1.isConfig(config)) {
        return new server_1.Server(config);
    }
    throw Error(sprintf_js_1.sprintf("invalid config: %s", config_path));
})();
server.start();
//# sourceMappingURL=index.js.map