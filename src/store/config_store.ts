import * as fs from "fs";
import * as yaml from "js-yaml";
import { Config, isConfig } from "../model/config";

export class ConfigStore {
    private static _instance: ConfigStore;
    private readonly config: Config;

    private constructor() {
        const config_path = process.env["HOMEAUTOMATION_CONFIG_PATH"] || "/usr/local/etc/homeautomation/config.yml";
        const config = yaml.safeLoad(
            fs.readFileSync(config_path, "utf-8")
        );

        if (isConfig(config)) {
            this.config = config;
        } else {
            throw Error("invalid config: " + config_path);
        }
    }

    public static get config(): Config {
        if (!this._instance) {
            this._instance = new ConfigStore();
        }
        return this._instance.config;
    }
}
