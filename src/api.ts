import * as express from "express";

export interface ErrorResponse {
    readonly status: number;
    readonly messages: string[];
}

export function isErrorResponse(e: any): e is ErrorResponse {
    return e.hasOwnProperty("status") && Number.isInteger(e.status) && e.status >= 100 && e.status <= 500 &&
            e.hasOwnProperty("messages") && Array.isArray(e.messages);
}

export function responseSuccessNoContents(res: express.Response): express.Response {
    res.status(204);
    return res;
}

export function responseError(res: express.Response, error: ErrorResponse): express.Response {
    res.writeHead(error.status, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(error));
    return res;
}
