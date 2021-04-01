export interface ServerIsReachableParameterInterface {
    port: string;
    path?: string;
    interval?: number;
    startupTime?: number;
    requirePath?: boolean;
    command?: string;
}