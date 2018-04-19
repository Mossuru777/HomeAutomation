export declare class ErrorResponse {
    readonly status: number;
    readonly messages: string[];
    constructor(status: number, messages: string[], error?: Error);
}
