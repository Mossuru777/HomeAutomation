"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
require("colors");
const express = require("express");
const openapi = require("express-openapi");
const fs = require("fs");
const http = require("http");
const yaml = require("js-yaml");
const sprintf_js_1 = require("sprintf-js");
class Server {
    constructor(config) {
        this.app = express();
        const apiDefinition = (() => {
            const doc = yaml.safeLoad(fs.readFileSync("api.yml", "utf-8"));
            if (doc !== undefined && doc.hasOwnProperty("swagger") && doc.hasOwnProperty("info")
                && doc.hasOwnProperty("paths")) {
                return doc;
            }
            throw Error("api.yml can't cast to 'OpenAPI.ApiDefinition'.");
        })();
        this.app.use("/swagger-ui", express.static("node_modules/swagger-ui-dist"));
        this.app.get("/v1/docs", (_req, res) => res.redirect("/swagger-ui/?url=/v1/schema"));
        openapi.initialize({
            app: this.app,
            apiDoc: apiDefinition,
            consumesMiddleware: {
                "application/json": bodyParser.json(),
                "text/text": bodyParser.text()
            },
            docsPath: "/schema",
            errorMiddleware: (err, _req, res, _next) => {
                res.status(400);
                res.json(err);
            },
            errorTransformer: (openapiError, _jsonschemaError) => {
                return openapiError.message;
            },
            paths: "./dist/api"
        });
        if (config.socket_path) {
            try {
                fs.unlinkSync(config.socket_path);
            }
            catch (e) {
                if (e.code !== "ENOENT") {
                    throw e;
                }
            }
            try {
                this.socket_http_server = http.createServer(this.app).listen(config.socket_path);
                fs.chmodSync(config.socket_path, 0o777);
            }
            catch (e) {
                console.warn(e.message);
            }
        }
        const tcp_hostname = config.tcp_hostname || "127.0.0.1";
        if (config.tcp_port) {
            try {
                this.tcp_http_server = http.createServer(this.app).listen(config.tcp_port, tcp_hostname);
            }
            catch (e) {
                console.warn(e.message);
            }
        }
        if (this.socket_http_server === undefined && this.tcp_http_server === undefined) {
            throw Error("Can't start listening on any protocol. Check your configuration.");
        }
        let listen_info = `
HTTP Server started.
`;
        listen_info += "*** Listen ***\n".yellow;
        if (this.socket_http_server) {
            listen_info += sprintf_js_1.sprintf(`\
[Unix Domain Socket]
  - %s
  - http+unix://%s
  
`, config.socket_path, config.socket_path.replace(/\//g, "%2F")).yellow;
        }
        if (this.tcp_http_server) {
            listen_info += sprintf_js_1.sprintf(`\
[TCP]
  - http://%s:%d/

`, tcp_hostname, config.tcp_port).yellow;
        }
        console.info(listen_info);
    }
    stop() {
        let any_close = false;
        if (this.socket_http_server) {
            this.socket_http_server.close();
            any_close = true;
        }
        if (this.tcp_http_server) {
            this.tcp_http_server.close();
            any_close = true;
        }
        if (any_close) {
            console.info("\n\nHTTP Server stopped.");
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map