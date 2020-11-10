import * as fs from "fs";

export class FileExist {
    public static run(filepath: string): void {
        if(!fs.existsSync(filepath)) {
            throw new Error("file " + filepath + " does not exist");
        }
    }
}