import { Config } from "./model/config";
export declare class Server {
    readonly socket_path: string | undefined;
    readonly tcp_port: number | undefined;
    private readonly app;
    private http_servers;
    constructor(config: Config);
    start(): void;
    stop(): void;
}
