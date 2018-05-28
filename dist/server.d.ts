import "colors";
import { Config } from "./model/config";
export declare class Server {
    private readonly app;
    private readonly socket_http_server;
    private readonly tcp_http_server;
    constructor(config: Config);
    stop(): void;
}
