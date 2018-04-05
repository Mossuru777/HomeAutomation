import * as express from "express";

export interface ErrorResponse {
    readonly status: number;
    readonly message: string;
}

export function responseSuccessNoContents(res: express.Response): express.Response {
    res.status(204);
    return res;
}

export function responseError(res: express.Response, error: ErrorResponse): express.Response {
    res.writeHead(error.status, error.message, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(error));
    return res;
}
