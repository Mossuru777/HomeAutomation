"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isConfig(o) {
    return o !== undefined && o.hasOwnProperty("socket_path") && o.hasOwnProperty("tcp_port");
}
exports.isConfig = isConfig;
//# sourceMappingURL=config.js.map