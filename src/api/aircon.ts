import { Operation } from "express-openapi";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { controllAirCon } from "../controller/aircon";

// GET /aircon
export const get: Operation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await controllAirCon(req);
        res.status(204);
        res.end();
    } catch (e) {
        next(e);
    }
};

get.apiDoc = {
    summary: "エアコンを操作します",
    description: "運転内容をセットしてエアコンを操作します",
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
            maximum: 12
        }
    ],
    responses: {
        204: {
            description: "操作に成功"
        },
        400: {
            description: "クエリが不正",
            schema: {
                $ref: "#/definitions/Error"
            }
        },
        500: {
            description: "サーバーエラー",
            schema: {
                $ref: "#/definitions/Error"
            }
        },
        default: {
            description: "予期しないエラー",
            schema: {
                $ref: "#/definitions/Error"
            }
        }
    }
};
