"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
require("colors");
if (process.getuid() !== 0 || process.env["npm_config_global"] !== "true") {
    console.log("Please re-run like `sudo npm uninstall PACKAGE -g`.".bgYellow);
    process.exit(1);
}
child_process.execSync("pm2 stop pm2_process.json", {
    stdio: [
        null,
        process.stdout,
        process.stderr
    ]
});
child_process.execSync("pm2 delete pm2_process.json", {
    stdio: [
        null,
        process.stdout,
        process.stderr
    ]
});
//# sourceMappingURL=preuninstall.js.map