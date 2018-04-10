"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const openapi = require("express-openapi");
const fs = require("fs");
const http = require("http");
const yaml = require("js-yaml");
class Server {
    constructor(config) {
        this.app = express();
        this.http_servers = [];
        const apiDefinition = (() => {
            const doc = yaml.safeLoad(fs.readFileSync("api.yml", "utf-8"));
            if (doc !== undefined && doc.hasOwnProperty("swagger") && doc.hasOwnProperty("info")
                && doc.hasOwnProperty("paths")) {
                return doc;
            }
            throw Error("api.yml can't cast to 'OpenAPI.ApiDefinition'.");
        })();
        openapi.initialize({
            app: this.app,
            apiDoc: apiDefinition,
            paths: "./dist/api",
            consumesMiddleware: {
                "application/json": bodyParser.json(),
                "text/text": bodyParser.text()
            },
            errorMiddleware: (err, _req, res, _next) => {
                res.status(400);
                res.json(err);
            },
            errorTransformer: (openapiError, _jsonschemaError) => {
                return openapiError.message;
            },
            docsPath: "/schema",
            exposeApiDocs: true
        });
        if (config.socket_path) {
            try {
                http.createServer().listen(config.socket_path).close();
                this.socket_path = config.socket_path;
            }
            catch (e) {
                console.warn(e.message);
            }
        }
        if (config.tcp_port) {
            try {
                http.createServer().listen(config.tcp_port).close();
                this.tcp_port = config.tcp_port;
            }
            catch (e) {
                console.warn(e.message);
            }
        }
        if (this.socket_path === undefined && this.tcp_port === undefined) {
            throw Error("Can't start listening on any protocol. Check your configuration.");
        }
    }
    start() {
        if (this.http_servers.length) {
            console.warn("Server already started.");
            return;
        }
        if (this.socket_path) {
            try {
                const server = http.createServer(this.app).listen(this.socket_path);
                this.http_servers.push(server);
            }
            catch (e) {
                console.warn(e.message);
            }
        }
        if (this.tcp_port) {
            try {
                const server = http.createServer(this.app).listen(this.tcp_port);
                this.http_servers.push(server);
            }
            catch (e) {
                console.warn(e.message);
            }
        }
    }
    stop() {
        let server;
        while (server = this.http_servers.pop()) {
            server.close();
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map