"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const config_1 = require("../model/config");
class ConfigStore {
    constructor() {
        const config_path = process.env["HOMEAUTOMATION_CONFIG_PATH"] || "/usr/local/etc/homeautomation/config.yml";
        const config = yaml.safeLoad(fs.readFileSync(config_path, "utf-8"));
        if (config_1.isConfig(config)) {
            this.config = config;
        }
        else {
            throw Error(`invalid config: ${config_path}`);
        }
    }
    static get config() {
        if (!this._instance) {
            this._instance = new ConfigStore();
        }
        return this._instance.config;
    }
}
exports.ConfigStore = ConfigStore;
//# sourceMappingURL=config_store.js.map