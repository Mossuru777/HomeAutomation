import * as bodyParser from "body-parser";
import * as express from "express";
import * as openapi from "express-openapi";
import * as fs from "fs";
import * as http from "http";
import * as yaml from "js-yaml";
import { Config } from "./model/config";

export class Server {
    readonly socket_path: string | undefined;
    readonly tcp_port: number | undefined;

    private readonly app = express();

    private http_servers: http.Server[] = [];

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
                http.createServer().listen(config.socket_path).close();
                this.socket_path = config.socket_path;
            } catch (e) {
                console.warn(e.message);
            }
        }

        if (config.tcp_port) {
            try {
                http.createServer().listen(config.tcp_port).close();
                this.tcp_port = config.tcp_port;
            } catch (e) {
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
            } catch (e) {
                console.warn(e.message);
            }
        }

        if (this.tcp_port) {
            try {
                const server = http.createServer(this.app).listen(this.tcp_port);
                this.http_servers.push(server);
            } catch (e) {
                console.warn(e.message);
            }
        }
    }

    stop() {
        let server: http.Server | undefined;
        while (server = this.http_servers.pop()) {
            server.close();
        }
    }
}
