import * as child_process from "child_process";
import "colors";
import * as fs from "fs";
import * as path from "path";

interface FileCopyInfo {
    readonly template_path: string;
    readonly dest_dir: string;
}

const CopyTemplateFiles: { [key: string]: FileCopyInfo } = {
    config: { template_path: "template/config.yml", dest_dir: "/usr/local/etc/homeautomation" }
};

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
    console.log("Caution: `pm2 startup` has failed. you can try fix yourself.".bgYellow.black);
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
