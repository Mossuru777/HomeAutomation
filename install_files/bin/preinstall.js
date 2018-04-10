"use strict";

// install environment check
if (process.getuid() !== 0 || process.env["npm_config_global"] !== "true") {
    console.error("Please re-run like `sudo npm install PACKAGE -g --production --unsafe-perm`.");
    process.exit(1);
}
