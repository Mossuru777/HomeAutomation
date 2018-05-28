export interface Config {
    readonly socket_path: string | null;
    readonly tcp_port: number | null;
    readonly tcp_hostname: string | null;
    readonly daikin_lirc_path: string;
}

export function isConfig(o: any): o is Config {
    return o !== undefined &&
        o.hasOwnProperty("socket_path") &&
        o.hasOwnProperty("tcp_port") &&
        o.hasOwnProperty("tcp_hostname") &&
        o.hasOwnProperty("daikin_lirc_path");
}
