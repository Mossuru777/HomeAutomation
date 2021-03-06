import * as child_process from "child_process";
import { DaikinIR } from "daikin-ir";
import { Request } from "express-serve-static-core";
import * as fs from "fs";
import { isError } from "lodash";
import * as ps from "ps-node";
import { sprintf } from "sprintf-js";
import { ErrorResponse } from "../model/error_response";
import { ConfigStore } from "../store/config_store";

export async function controllAirCon(req: Request) {
    // Parse request
    const command = parseDaikinIRRequest(req);

    // Write LIRC configuration file
    try {
        fs.writeFileSync(
            ConfigStore.config.daikin_lirc_path,
            command.getLIRCConfig(),
            { encoding: "utf-8", mode: 0o666, flag: "w" }
        );
    } catch (e) {
        throw new ErrorResponse(500, ["LIRC configuration file write failed."], e);
    }

    // Reload the LIRC configuration file
    await (() => {
        // treat ps.lookup as complete async function
        // ref: https://github.com/neekey/ps/issues/19#issuecomment-254037626
        return new Promise((resolve, reject) => {
            ps.lookup({ command: "lircd" }, (err: string | null, result: any[]) => {
                if (err) {
                    reject(new ErrorResponse(500, [err]));
                } else if (result.length === 0) {
                    reject(new ErrorResponse(
                        500,
                        ["LIRC daemon does not seem to be running. Please check the server."]
                    ));
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

    // Send signal
    try {
        child_process.execSync("irsend SEND_ONCE AirCon Control", { stdio: "ignore" });
    } catch (e) {
        const messages = ["LIRC IR send command failed. Please check the server."];
        if (isError(e)) {
            throw new ErrorResponse(500, messages, e);
        } else {
            throw new ErrorResponse(500, messages);
        }
    }
}

function parseDaikinIRRequest(req: Request): DaikinIR {
    interface ModeMisc {
        str: string;
        temp_min: number;
        temp_max: number;
        temp_default: number;
    }

    const ModeMiscs = new Map<DaikinIR.Enums.Mode, ModeMisc>([
        [DaikinIR.Enums.Mode.Auto, { str: "Auto", temp_min: -5, temp_max: 5, temp_default: 0 }],
        [DaikinIR.Enums.Mode.Dry, { str: "Dry", temp_min: -2, temp_max: 2, temp_default: 0 }],
        [DaikinIR.Enums.Mode.Cold, { str: "Cold", temp_min: 18, temp_max: 32, temp_default: 25 }],
        [DaikinIR.Enums.Mode.Warm, { str: "Warm", temp_min: 14, temp_max: 30, temp_default: 25 }]
    ]);

    const errors: string[] = [];

    const power = req.query.power ? DaikinIR.Enums.Power.On : DaikinIR.Enums.Power.Off;

    const mode = ((): DaikinIR.Enums.Mode => {
        const mode_str = (req.query.mode || "").toLowerCase();
        switch (mode_str) {
        case "auto":
            return DaikinIR.Enums.Mode.Auto;
        case "dry":
            return DaikinIR.Enums.Mode.Dry;
        case "cold":
            return DaikinIR.Enums.Mode.Cold;
        case "warm":
            return DaikinIR.Enums.Mode.Warm;
        case "fan":
            return DaikinIR.Enums.Mode.Fan;
        default:
            return DaikinIR.Enums.Mode.Auto;
        }
    })();

    const temperature = ((): number => {
        if (!req.query.hasOwnProperty("temp")) {
            if (mode === DaikinIR.Enums.Mode.Auto || mode === DaikinIR.Enums.Mode.Dry) {
                return 0;
            }
            return 25;
        }

        if (mode === DaikinIR.Enums.Mode.Fan) {
            return 25;
        }

        const misc = ModeMiscs.get(mode) as ModeMisc;
        if (req.query.temp < misc.temp_min || req.query.temp > misc.temp_max) {
            errors.push(sprintf(
                "param 'temp' must be in the range from %d to %d in %s mode.",
                misc.temp_min,
                misc.temp_max,
                misc.str
            ));
            return misc.temp_default;
        }
        return req.query.temp;
    })();

    const fan_speed = ((): DaikinIR.Enums.FanSpeed => {
        if (!req.query.hasOwnProperty("fan")) {
            return DaikinIR.Enums.FanSpeed.Auto;
        }

        const fan = req.query.fan.toLowerCase();
        switch (fan) {
        case "auto":
            return DaikinIR.Enums.FanSpeed.Auto;
        case "silent":
            return DaikinIR.Enums.FanSpeed.Silent;
        case "1":
            return DaikinIR.Enums.FanSpeed.Level1;
        case "2":
            return DaikinIR.Enums.FanSpeed.Level2;
        case "3":
            return DaikinIR.Enums.FanSpeed.Level3;
        case "4":
            return DaikinIR.Enums.FanSpeed.Level4;
        case "5":
            return DaikinIR.Enums.FanSpeed.Level5;
        default:
            errors.push("param 'fan' value is unknown.");
            return DaikinIR.Enums.FanSpeed.Auto;
        }
    })();

    const swing = ((): DaikinIR.Enums.Swing => {
        if (!req.query.hasOwnProperty("swing")) {
            return DaikinIR.Enums.Swing.On;
        }
        return req.query.swing ? DaikinIR.Enums.Swing.On : DaikinIR.Enums.Swing.Off;
    })();

    const powerful = req.query.hasOwnProperty("powerful") ? req.query.powerful : false;

    const timer_mode = ((): DaikinIR.Enums.TimerMode => {
        const timer = (req.query.timer || "").toLowerCase();
        switch (timer) {
        case "none":
            return DaikinIR.Enums.TimerMode.None;
        case "on":
            return DaikinIR.Enums.TimerMode.On;
        case "off":
            return DaikinIR.Enums.TimerMode.Off;
        default:
            return DaikinIR.Enums.TimerMode.None;
        }
    })();

    const hour = ((): number => {
        if (timer_mode === DaikinIR.Enums.TimerMode.None) {
            return 0;
        }
        if (!req.query.hasOwnProperty("hour")) {
            const timer_mode_str = timer_mode === DaikinIR.Enums.TimerMode.On ? "On" : "Off";
            errors.push(sprintf("param 'hour' is needs for '%s Timer' but missing.", timer_mode_str));
            return 1;
        }

        return req.query.hour;
    })();

    if (errors.length > 0) {
        throw new ErrorResponse(400, errors);
    }
    return new DaikinIR(power, mode, temperature, fan_speed, swing, powerful, timer_mode, hour);
}
