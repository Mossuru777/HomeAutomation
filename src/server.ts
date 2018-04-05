import * as fs from "fs";
import * as yaml from "js-yaml";
import * as express from "express";
import * as openapi from "express-openapi";
import {OpenApi} from "express-openapi";
import * as bodyParser from "body-parser";

export class Server {
    readonly port: number;
    private readonly app = express();

    constructor(port?: number) {
        if (port && port >= 1 && port <= 65535) {
            this.port = port;
        } else {
            this.port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 10080;
        }

        // api.ymlを読み込んでOpenAPI.ApiDefinitionにキャスト
        const apiDefinition = ((): OpenApi.ApiDefinition => {
            const doc = yaml.safeLoad(fs.readFileSync("api.yml", "utf-8"));
            if (doc != undefined && doc.hasOwnProperty("swagger") && doc.hasOwnProperty("info")
                && doc.hasOwnProperty("paths")) {
                return doc as OpenApi.ApiDefinition;
            } else {
                throw Error("api.yml can't cast to 'OpenAPI.ApiDefinition'.");
            }
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
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`listening on ${this.port}`);
        });
    }
}
