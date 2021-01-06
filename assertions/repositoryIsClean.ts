import * as child_process from "child_process";

export class RepositoryIsClean {
    public static run(directory: string): void {
        let process = child_process.spawnSync("git status -s", { shell: true, cwd: directory });
        if(process.status != 0) {
            throw new Error("'git status -s' execution in directory " + directory + " returned error.")
        } else if(process.stdout.toString()) {
            throw new Error("Repository in directory " + directory + " is not clean. Current Status: " + process.stdout.toString());
        }
    }
}
