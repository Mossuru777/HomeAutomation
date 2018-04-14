"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isConfig(o) {
    return o !== undefined &&
        o.hasOwnProperty("socket_path") &&
        o.hasOwnProperty("tcp_port") &&
        o.hasOwnProperty("tcp_hostname") &&
        o.hasOwnProperty("daikin_lirc_path");
}
exports.isConfig = isConfig;
//# sourceMappingURL=config.js.map