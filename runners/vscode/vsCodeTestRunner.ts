import * as path from "path";
import * as fs from "fs";
import { VSRunner } from "./vsCodeRunner";
import { VsCodeUtils } from "./vscodeUtils";

async function main(args: string[]) {
    if(args && args.length > 2) {
        await cleanSettings();
        let testfile = args[2];
        let vsCodeExecutable = VsCodeUtils.getVsCodeExecutable();
        let vsCodeVersion = VsCodeUtils.getVsCodeVersion(path.join(path.dirname(vsCodeExecutable), "bin", "code"));
        return await runTest(vsCodeExecutable, testfile, vsCodeVersion);
    }
}

function runTest(vsCodeExecutable: string, testFile: string, vscodeVersion: string): Promise<number> {
    let downloadFolder = path.join(__dirname, "resources");

    //add chromedriver to process' path
    let env: NodeJS.ProcessEnv = {};
    Object.assign(env, process.env);
    const key = 'PATH';
    env[key] = [downloadFolder, process.env[key]].join(path.delimiter);

    process.env = env;
    process.env.TEST_RESOURCES = downloadFolder;

    let config = path.join(__dirname, ".mocharc.js");
    let runner = new VSRunner(vsCodeExecutable, vscodeVersion, {}, false, config);
    return runner.runTests(testFile, "info");
}

async function cleanSettings() {
    let deleteFolderRecursive = function (directory: string) {
        if(fs.existsSync(directory)) {
            let directories = fs.readdirSync(directory);
            for(let file of directories) {
                let currentPath = path.join(directory, file);
                if (fs.lstatSync(currentPath).isDirectory()) {
                    deleteFolderRecursive(currentPath);
                } else {
                    try {
                        fs.unlinkSync(currentPath);
                    } catch(e) {
                        console.error("error deleting file " + currentPath, e);
                    }
                }
            }
            fs.rmdirSync(directory);
        }
    };
    let settings = path.join(__dirname, "resources", "settings");
    deleteFolderRecursive(settings);
}

main(process.argv);