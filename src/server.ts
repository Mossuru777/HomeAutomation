import * as bodyParser from "body-parser";
import "colors";
import * as express from "express";
import * as openapi from "express-openapi";
import * as fs from "fs";
import * as http from "http";
import * as yaml from "js-yaml";
import { sprintf } from "sprintf-js";
import { Config } from "./model/config";

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

        // express-openapi 初期化
        openapi.initialize({
            app: this.app,
            apiDoc: apiDefinition,

            // エンドポイント実装ディレクトリー
            paths: "./dist/api",

            // Content-Type毎ハンドラーの指定
            consumesMiddleware: {
                "application/json": bodyParser.json(),
                "text/text": bodyParser.text()
            },

            // エラー処理
            errorMiddleware: (err, _req, res, _next) => {
                res.status(400);
                res.json(err);
            },
            errorTransformer: (openapiError, _jsonschemaError) => {
                return openapiError.message;
            },

            // exposeApiDocsをtrueにすることでGET /schemaで完全版のスキーマが取得できる
            docsPath: "/schema",
            exposeApiDocs: true
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
                (config.socket_path as string).replace(/\//g, "%2f")
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
