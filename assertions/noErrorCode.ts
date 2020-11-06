import { RunResult } from "../engine/run_result";

export class NoErrorCode {
    public static run(result: RunResult): void {
        if(result.returnCode != 0) {
            throw new Error("returnCode is not 0");
        }
    }
}