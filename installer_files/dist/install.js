"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const semver = require("semver");
try {
    child_process.execSync("pm2 -v", { encoding: "utf8" });
}
catch (_a) {
    console.error("Please install pm2 as global like `sudo npm install -g pm2@2`.".bgRed.white);
    process.exit(1);
}
const pm2Version = child_process.execSync("pm2 -v", { encoding: "utf8" }).trim();
const pm2Expected = ">=2.4.0 <3.0.0";
if (semver.satisfies(pm2Version, pm2Expected)) {
    console.log("PM2 Version:", `${pm2Version}`.green, "[OK]".bgGreen);
}
else {
    console.error("PM2 Version:", `${pm2Version}`.red, "[NG]".bgRed, "Expected:", pm2Expected);
    process.exit(1);
}
//# sourceMappingURL=install.js.map