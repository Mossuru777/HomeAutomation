"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const aircon_1 = require("../controller/aircon");
exports.get = async (req, res, _next) => {
    try {
        aircon_1.controllAirCon(req);
        api_1.responseSuccessNoContents(res);
    }
    catch (e) {
        if (e instanceof Error) {
            const error = { status: 400, messages: [e.message] };
            api_1.responseError(res, error);
        }
        else if (api_1.isErrorResponse(e)) {
            api_1.responseError(res, e);
        }
        else {
            const error = { status: 400, messages: ["Unknown error occurred."] };
            api_1.responseError(res, error);
        }
    }
};
exports.get.apiDoc = {
    description: "エアコンを操作します",
    operationId: "aircon",
    parameters: [
        {
            name: "power",
            in: "query",
            description: "電源",
            required: true,
            type: "boolean"
        },
        {
            name: "mode",
            in: "query",
            required: false,
            description: "運転モード (デフォルト Auto)",
            type: "string",
            pattern: "^([Aa][Uu][Tt][Oo]|[Dd][Rr][Yy]|[Cc][Oo][Ll][Dd]|[Ww][Aa][Rr][Mm]|[Ff][Aa][Nn])$"
        },
        {
            name: "temp",
            in: "query",
            description: "温度 (デフォルト 25℃)",
            required: false,
            type: "integer"
        },
        {
            name: "fan",
            in: "query",
            description: "風量 (デフォルト Auto)",
            required: false,
            type: "string",
            pattern: "^([Aa][Uu][Tt][Oo]|[Ss][Ii][Ll][Ee][Nn][Tt]|[1-5])$"
        },
        {
            name: "swing",
            in: "query",
            description: "風向上下させるかどうか (デフォルト true)",
            required: false,
            type: "boolean"
        },
        {
            name: "powerful",
            in: "query",
            description: "パワフルモード (デフォルト false)",
            required: false,
            type: "boolean"
        },
        {
            name: "timer",
            in: "query",
            description: "タイマーモード (デフォルト None)",
            required: false,
            type: "string",
            pattern: "^([Nn][Oo][Nn][Ee]|[Oo][Nn]|[Oo][Ff]{2})$"
        },
        {
            name: "hour",
            in: "query",
            description: "タイマー時間",
            required: false,
            type: "integer",
            minimum: 1,
            maximum: 12,
        }
    ],
    responses: {
        204: {
            description: "操作に成功"
        },
        default: {
            description: "予期しないエラー",
            schema: {
                $ref: "#/definitions/Error"
            }
        }
    }
};
//# sourceMappingURL=aircon.js.map