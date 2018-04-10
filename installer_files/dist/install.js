"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const semver = require("semver");
try {
    const testFlight = child_process.execSync("pm2 -v", { encoding: "utf8" });
    console.log(testFlight);
}
catch (_a) {
    console.error("Please install pm2 as global like `sudo npm install -g pm2@2`.".bgRed);
    process.exit(1);
}
const pm2Version = child_process.execSync("pm2 -v", { encoding: "utf8" }).trim();
const pm2Expected = ">=2.4.0 <3.0.0";
if (semver.satisfies(pm2Version, pm2Expected)) {
    console.log("Version:", `pm2@${pm2Version}`.green, "[OK]".bgGreen);
}
else {
    console.error("Version:", `pm2@${pm2Version}`.red, "[NG]".bgRed, "Expected:", pm2Expected);
    process.exit(1);
}
//# sourceMappingURL=install.js.map