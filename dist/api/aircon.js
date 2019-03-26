"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aircon_1 = require("../controller/aircon");
exports.get = async (req, res, next) => {
    try {
        await aircon_1.controllAirCon(req);
        res.status(204);
        res.end();
    }
    catch (e) {
        next(e);
    }
};
exports.get.apiDoc = {
    summary: "エアコンを操作します",
    description: "運転内容をセットしてエアコンを操作します",
    operationId: "aircon",
    parameters: [
        {
            name: "power",
            in: "query",
            description: "電源",
            required: true,
            schema: {
                type: "boolean"
            }
        },
        {
            name: "mode",
            in: "query",
            description: "運転モード (デフォルト Auto)",
            required: false,
            schema: {
                type: "string",
                pattern: "^([Aa][Uu][Tt][Oo]|[Dd][Rr][Yy]|[Cc][Oo][Ll][Dd]|[Ww][Aa][Rr][Mm]|[Ff][Aa][Nn])$"
            }
        },
        {
            name: "temp",
            in: "query",
            description: "温度 (デフォルト 25℃)",
            required: false,
            schema: {
                type: "integer"
            }
        },
        {
            name: "fan",
            in: "query",
            description: "風量 (デフォルト Auto)",
            required: false,
            schema: {
                type: "string",
                pattern: "^([Aa][Uu][Tt][Oo]|[Ss][Ii][Ll][Ee][Nn][Tt]|[1-5])$"
            }
        },
        {
            name: "swing",
            in: "query",
            description: "風向上下させるかどうか (デフォルト true)",
            required: false,
            schema: {
                type: "boolean"
            }
        },
        {
            name: "powerful",
            in: "query",
            description: "パワフルモード (デフォルト false)",
            required: false,
            schema: {
                type: "boolean"
            }
        },
        {
            name: "timer",
            in: "query",
            description: "タイマーモード (デフォルト None)",
            required: false,
            schema: {
                type: "string",
                pattern: "^([Nn][Oo][Nn][Ee]|[Oo][Nn]|[Oo][Ff]{2})$"
            }
        },
        {
            name: "hour",
            in: "query",
            description: "タイマー時間",
            required: false,
            schema: {
                type: "integer",
                minimum: 1,
                maximum: 12
            }
        }
    ],
    responses: {
        204: {
            description: "操作に成功"
        },
        400: {
            description: "クエリが不正",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/definitions/Error"
                    }
                }
            }
        },
        500: {
            description: "サーバーエラー",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/definitions/Error"
                    }
                }
            }
        },
        default: {
            description: "予期しないエラー",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/definitions/Error"
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=aircon.js.map