"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
require("colors");
const fs = require("fs");
const path = require("path");
const CopyTemplateFiles = {
    config: { template_path: "template/config.yml", dest_dir: "/usr/local/etc/homeautomation" }
};
copyFileSyncIfNotExists(CopyTemplateFiles["config"]);
try {
    child_process.execSync("pm2 startup", {
        stdio: [
            null,
            process.stdout,
            process.stderr
        ]
    });
}
catch (e) {
    console.log("Caution: `pm2 startup` has failed. you can try fix yourself.".bgYellow.black);
}
child_process.execSync("pm2 start pm2_process.json", {
    stdio: [
        null,
        process.stdout,
        process.stderr
    ]
});
child_process.execSync("pm2 save", {
    stdio: [
        null,
        process.stdout,
        process.stderr
    ]
});
function copyFileSyncIfNotExists(info) {
    const filename = path.basename(info.template_path);
    const dest_path = path.join(info.dest_dir, filename);
    try {
        fs.mkdirSync(info.dest_dir, 0o0755);
    }
    catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
    try {
        fs.writeFileSync(dest_path, fs.readFileSync(info.template_path), { mode: 0o644, flag: "wx" });
    }
    catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
}
//# sourceMappingURL=postinstall.js.map