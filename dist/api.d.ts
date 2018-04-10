/// <reference types="express" />
import * as express from "express";
export interface ErrorResponse {
    readonly status: number;
    readonly messages: string[];
}
export declare function isErrorResponse(e: any): e is ErrorResponse;
export declare function responseSuccessNoContents(res: express.Response): express.Response;
export declare function responseError(res: express.Response, error: ErrorResponse): express.Response;
