"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_prcess = require("child_process");
const daikin_ir_1 = require("daikin-ir");
const fs = require("fs");
const lodash_1 = require("lodash");
const ps = require("ps-node");
const sprintf_js_1 = require("sprintf-js");
const error_response_1 = require("../model/error_response");
const config_store_1 = require("../store/config_store");
async function controllAirCon(req) {
    const command = parseDaikinIRRequest(req);
    try {
        fs.writeFileSync(config_store_1.ConfigStore.config.daikin_lirc_path, command.getLIRCConfig(), { encoding: "utf-8", mode: 0o666, flag: "w" });
    }
    catch (e) {
        throw new error_response_1.ErrorResponse(500, ["LIRC configuration file write failed."], e);
    }
    await (() => {
        return new Promise((resolve, reject) => {
            ps.lookup({ command: "lircd" }, (err, result) => {
                if (err) {
                    reject(new error_response_1.ErrorResponse(500, [err]));
                }
                else if (result.length === 0) {
                    reject(new error_response_1.ErrorResponse(500, ["LIRC daemon does not seem to be running. Please check the server."]));
                }
                for (let i = 0; i < result.length; i += 1) {
                    process.kill(result[i].pid, "SIGHUP");
                }
                resolve();
            });
        });
    })().catch((e) => {
        throw e;
    });
    try {
        child_prcess.execSync("irsend SEND_ONCE AirCon Control", { stdio: "ignore" });
    }
    catch (e) {
        const messages = ["LIRC IR send command failed. Please check the server."];
        if (lodash_1.isError(e)) {
            throw new error_response_1.ErrorResponse(500, messages, e);
        }
        else {
            throw new error_response_1.ErrorResponse(500, messages);
        }
    }
}
exports.controllAirCon = controllAirCon;
function parseDaikinIRRequest(req) {
    const ModeMiscs = new Map([
        [0, { str: "Auto", temp_min: -5, temp_max: 5, temp_default: 0 }],
        [2, { str: "Dry", temp_min: -2, temp_max: 2, temp_default: 0 }],
        [3, { str: "Cold", temp_min: 18, temp_max: 32, temp_default: 25 }],
        [4, { str: "Warm", temp_min: 14, temp_max: 30, temp_default: 25 }]
    ]);
    const errors = [];
    const power = req.query.power ? 1 : 0;
    const mode = (() => {
        const mode_str = (req.query.mode || "").toLowerCase();
        switch (mode_str) {
            case "auto":
                return 0;
            case "dry":
                return 2;
            case "cold":
                return 3;
            case "warm":
                return 4;
            case "fan":
                return 6;
            default:
                return 0;
        }
    })();
    const temperature = (() => {
        if (!req.query.hasOwnProperty("temp")) {
            if (mode === 0 || mode === 2) {
                return 0;
            }
            return 25;
        }
        if (mode === 6) {
            return 25;
        }
        const misc = ModeMiscs.get(mode);
        if (req.query.temp < misc.temp_min || req.query.temp > misc.temp_max) {
            errors.push(sprintf_js_1.sprintf("param 'temp' must be in the range from %d to %d in %s mode.", misc.temp_min, misc.temp_max, misc.str));
            return misc.temp_default;
        }
        return req.query.temp;
    })();
    const fan_speed = (() => {
        if (!req.query.hasOwnProperty("fan")) {
            return 10;
        }
        const fan = req.query.fan.toLowerCase();
        switch (fan) {
            case "auto":
                return 10;
            case "silent":
                return 11;
            case "1":
                return 3;
            case "2":
                return 4;
            case "3":
                return 5;
            case "4":
                return 6;
            case "5":
                return 7;
            default:
                errors.push("param 'fan' value is unknown.");
                return 10;
        }
    })();
    const swing = (() => {
        if (!req.query.hasOwnProperty("swing")) {
            return 15;
        }
        return req.query.swing ? 15 : 0;
    })();
    const powerful = req.query.hasOwnProperty("powerful") ? req.query.powerful : false;
    const timer_mode = (() => {
        const timer = (req.query.timer || "").toLowerCase();
        switch (timer) {
            case "none":
                return 0;
            case "on":
                return 2;
            case "off":
                return 1;
            default:
                return 0;
        }
    })();
    const hour = (() => {
        if (timer_mode === 0) {
            return 0;
        }
        if (!req.query.hasOwnProperty("hour")) {
            const timer_mode_str = timer_mode === 2 ? "On" : "Off";
            errors.push(sprintf_js_1.sprintf("param 'hour' is needs for '%s Timer' but missing.", timer_mode_str));
            return 1;
        }
        return req.query.hour;
    })();
    if (errors.length > 0) {
        throw new error_response_1.ErrorResponse(400, errors);
    }
    return new daikin_ir_1.DaikinIR(power, mode, temperature, fan_speed, swing, powerful, timer_mode, hour);
}
//# sourceMappingURL=aircon.js.map