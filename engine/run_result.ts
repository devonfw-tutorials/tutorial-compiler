
export class RunResult{
    public returnCode: number;
    public exceptions: Error[] = [];
    public port?: number;
}