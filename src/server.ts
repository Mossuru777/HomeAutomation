import * as bodyParser from "body-parser";
import "colors";
import * as express from "express";
import * as openapi from "express-openapi";
import { NextFunction, Request, Response } from "express-serve-static-core";
import * as fs from "fs";
import * as http from "http";
import * as yaml from "js-yaml";
import { isError } from "lodash";
import { sprintf } from "sprintf-js";
import { Config } from "./model/config";
import { ErrorResponse } from "./model/error_response";

export class Server {
    private readonly app = express();
    private readonly socket_http_server: http.Server | undefined;
    private readonly tcp_http_server: http.Server | undefined;

    constructor(config: Config) {
        // api.ymlを読み込んでOpenAPI.ApiDefinitionにキャスト
        const apiDefinition = ((): openapi.OpenApi.ApiDefinition => {
            const doc = yaml.safeLoad(fs.readFileSync("api.yml", "utf-8"));
            if (doc !== undefined && doc.hasOwnProperty("swagger") && doc.hasOwnProperty("info")
                && doc.hasOwnProperty("paths")) {
                return doc as openapi.OpenApi.ApiDefinition;
            }
            throw Error("api.yml can't cast to 'OpenAPI.ApiDefinition'.");
        })();

        // Swagger UI
        this.app.use("/api/swagger-ui", express.static("node_modules/swagger-ui-dist"));

        // /api/v1/docs に来たら、Swagger UIで /api/v1/schema を表示
        this.app.get("/api/v1/docs", (_req, res) => res.redirect("/api/swagger-ui/?url=/api/v1/schema"));

        // express-openapi 初期化
        openapi.initialize({
            app: this.app,
            apiDoc: apiDefinition,

            // Content-Type毎ハンドラの指定
            consumesMiddleware: {
                "application/json": bodyParser.json(),
                "text/text": bodyParser.text()
            },

            // API Schema
            docsPath: "/schema",

            // エラー処理
            errorMiddleware: (e: any, _req: Request, res: Response, _next: NextFunction): Response => {
                const error_response: ErrorResponse = (() => {
                    if (e instanceof ErrorResponse) {
                        return e;
                    }
                    if (isError(e)) {
                        return new ErrorResponse(500, [e.name, e.message]);
                    }
                    return new ErrorResponse(500, ["Unknown error occurred."]);
                })();

                res.status(error_response.status);
                res.json(error_response);
                res.end();

                return res;
            },

            errorTransformer: (openapiError, _jsonschemaError) => {
                return openapiError.message;
            },

            // エンドポイント実装ディレクトリ
            paths: "./dist/api"
        });

        // プロトコルごとにListenできるか試す
        if (config.socket_path) {
            try {
                fs.unlinkSync(config.socket_path);
            } catch (e) {
                if (e.code !== "ENOENT") {
                    throw e;
                }
            }
            try {
                this.socket_http_server = http.createServer(this.app).listen(config.socket_path);
                fs.chmodSync(config.socket_path, 0o777);
            } catch (e) {
                console.warn(e.message);
            }
        }

        const tcp_hostname = config.tcp_hostname || "127.0.0.1";
        if (config.tcp_port) {
            try {
                this.tcp_http_server = http.createServer(this.app).listen(config.tcp_port, tcp_hostname);
            } catch (e) {
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
            listen_info += sprintf(`\
[Unix Domain Socket]
  - %s
  - http+unix://%s
  
`,
                (config.socket_path as string),
                (config.socket_path as string).replace(/\//g, "%2F")
            ).yellow;
        }
        if (this.tcp_http_server) {
            listen_info += sprintf(`\
[TCP]
  - http://%s:%d/

`,
                tcp_hostname,
                config.tcp_port
            ).yellow;
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
