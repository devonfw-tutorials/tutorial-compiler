import { RunResult } from "../engine/run_result";

export class NoException {
    public static run(result: RunResult): void {
        if(result.exceptions.length > 0) {
            throw new Error("Unexpected exception: " + result.exceptions.join());
        }
    }
}