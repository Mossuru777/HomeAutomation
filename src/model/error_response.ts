export class ErrorResponse {
    constructor(readonly status: number, readonly messages: string[], error?: Error) {
        if (error) {
            messages.push(`[${error.name}] ${error.message}`);
        }
    }
}
