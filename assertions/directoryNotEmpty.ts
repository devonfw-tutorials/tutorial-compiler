import * as fs from "fs";

export class DirectoryNotEmpty {
    public static run(directory: string): void {
        if(fs.readdirSync(directory).length == 0) {
            throw new Error("directory " + directory + " is empty");
        }
    }
}