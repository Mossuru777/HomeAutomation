import { Config } from "../model/config";
export declare class ConfigStore {
    private static _instance;
    private readonly config;
    private constructor();
    static get config(): Config;
}
