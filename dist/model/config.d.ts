export interface Config {
    readonly socket_path: string | null;
    readonly tcp_port: number | null;
}
export declare function isConfig(o: any): o is Config;
