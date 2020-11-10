import * as fs from "fs";

export class DirectoryExist {
    public static run(directory: string): void {
        if(!fs.existsSync(directory)) {
            throw new Error("directory " + directory + " does not exist");
        }
    }
}