"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorResponse {
    constructor(status, messages, error) {
        this.status = status;
        this.messages = messages;
        if (error) {
            messages.push(`[${error.name}] ${error.message}`);
        }
    }
}
exports.ErrorResponse = ErrorResponse;
//# sourceMappingURL=error_response.js.map