import * as fs from "fs";

export class FileContains {
    public static run(filepath: string, content: string): void {
        let fileContent = fs.readFileSync(filepath, { encoding: "utf-8" });
        if(fileContent.indexOf(content) == -1) {
            throw new Error("file " + filepath + " does not contain the specified content: " + content);
        }
    }
}