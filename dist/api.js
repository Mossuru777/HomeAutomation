"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isErrorResponse(e) {
    return e.hasOwnProperty("status") && Number.isInteger(e.status) && e.status >= 100 && e.status <= 500 &&
        e.hasOwnProperty("messages") && Array.isArray(e.messages);
}
exports.isErrorResponse = isErrorResponse;
function responseSuccessNoContents(res) {
    res.status(204);
    res.end();
    return res;
}
exports.responseSuccessNoContents = responseSuccessNoContents;
function responseError(res, error) {
    res.writeHead(error.status, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(error));
    return res;
}
exports.responseError = responseError;
//# sourceMappingURL=api.js.map