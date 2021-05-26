export enum ConsolePlatform {
    WINDOWS,
    LINUX
}

export interface AsyncProcess {
    pid: number;
    port: number;
}