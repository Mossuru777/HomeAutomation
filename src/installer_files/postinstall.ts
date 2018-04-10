import * as child_process from "child_process";
import "colors";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";

interface FileCopyInfo {
    readonly template_path: string;
    readonly dest_dir: string;
}

const CopyTemplateFiles: { [key: string]: FileCopyInfo } = {
    config: { template_path: "template/config.yml", dest_dir: "/usr/local/etc/homeautomation" }
};

// install environment check
if (process.getuid() !== 0 || process.env["npm_config_global"] !== "true") {
    console.error("Please re-run like `sudo npm install PACKAGE -g --production --unsafe-perm`.".bgRed);
    process.exit(1);
}

// pm2 test flight
try {
    const testFlight = child_process.execSync("pm2 -v", { encoding: "utf8" });
    console.log(testFlight);
} catch {
    console.error("Please install pm2 as global like `sudo npm install -g pm2@2`.".bgRed);
    process.exit(1);
}

// pm2 version check
const pm2Version = child_process.execSync("pm2 -v", { encoding: "utf8" }).trim();
const pm2Expected = ">=2.4.0 <3.0.0";
if (semver.satisfies(pm2Version, pm2Expected)) {
    console.log("Version:", `pm2@${pm2Version}`.green, "[OK]".bgGreen);
} else {
    console.error("Version:", `pm2@${pm2Version}`.red, "[NG]".bgRed, "Expected:", pm2Expected);
    process.exit(1);
}

// copy template files
copyFileSyncIfNotExists(CopyTemplateFiles["config"]);

// pm2 startup register
try {
    child_process.execSync("pm2 startup", {
        stdio: [
            null,
            process.stdout,
            process.stderr
        ]
    });
} catch (e) {
    console.log("Caution: `pm2 startup` has failed. you can try fix yourself.".bgYellow);
}

// application register to pm2
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

function copyFileSyncIfNotExists(info: FileCopyInfo) {
    const filename = path.basename(info.template_path);
    const dest_path = path.join(info.dest_dir, filename);

    try {
        fs.mkdirSync(info.dest_dir, 0o0755);
    } catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }

    try {
        fs.writeFileSync(dest_path, fs.readFileSync(info.template_path), { mode: 0o644, flag: "wx" });
    } catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
}
