import * as child_process from "child_process";
import "colors";
import * as semver from "semver";

// pm2 install check
try {
    child_process.execSync("npm list -g pm2");
} catch {
    console.log("Please install pm2 as global like `sudo npm install -g pm2@2`.".bgRed);
    process.exit(1);
}

// pm2 test flight
const testFlight = child_process.execSync("pm2 -v", { encoding: "utf8" });
console.log(testFlight);

// pm2 version check
const pm2Version = child_process.execSync("pm2 -v", { encoding: "utf8" }).trim();
const pm2Expected = ">=2.4.0 <3.0.0";
if (semver.satisfies(pm2Version, pm2Expected)) {
    console.log("Version:", `pm2@${pm2Version}`.green, "[OK]".bgGreen);
} else {
    console.error("Version:", `pm2@${pm2Version}`.red, "[NG]".bgRed, "Expected:", pm2Expected);
    process.exit(1);
}
