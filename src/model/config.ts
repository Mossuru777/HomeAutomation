export interface Config {
    readonly socket_path: string | null;
    readonly tcp_port: number | null;
}

export function isConfig(o: any): o is Config {
    return o !== undefined && o.hasOwnProperty("socket_path") && o.hasOwnProperty("tcp_port");
}