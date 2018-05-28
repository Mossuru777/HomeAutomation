export interface Config {
    readonly socket_path: string | null;
    readonly tcp_port: number | null;
    readonly tcp_hostname: string | null;
    readonly daikin_lirc_path: string;
}
export declare function isConfig(o: any): o is Config;
