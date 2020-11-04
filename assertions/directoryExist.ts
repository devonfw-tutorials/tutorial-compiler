import { RunResult } from "../engine/run_result";
import * as fs from "fs";

export class DirectoryExist {
    public static run(result: RunResult, directory: string): void {
        if(!fs.existsSync(directory)) {
            throw new Error("directory " + directory + " does not exist");
        }
    }
}