import * as child_process from "child_process";

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
