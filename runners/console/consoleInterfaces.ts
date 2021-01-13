export enum ConsolePlatform {
    WINDOWS,
    LINUX
}

export interface AsyncProcess {
    pid: number;
    name: string;
    port: number;
}