export interface ServerIsReachableParameterInterface {
    port: string;
    path?: string;
    interval?: number;
    startupTime?: number;
    command?: string;
}