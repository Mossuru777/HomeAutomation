import * as child_process from "child_process";
import "colors";

if (process.getuid() !== 0 || process.env["npm_config_global"] !== "true") {
    console.error("Please re-run like `sudo npm uninstall PACKAGE -g`.".bgRed.white);
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
