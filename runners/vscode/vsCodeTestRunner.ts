import * as path from "path";
import { VSRunner } from "./vsCodeRunner";
import { VsCodeUtils } from "./vscodeUtils";

async function main(args: string[]) {
    if(args && args.length > 2) {
        let testfile = args[2];
        let vsCodeExecutable = VsCodeUtils.getVsCodeExecutable();
        let vsCodeVersion = VsCodeUtils.getVsCodeVersion();
        let res = await runTest(vsCodeExecutable, testfile, vsCodeVersion);
        console.log(res);
        return res;
    }
}

function runTest(vsCodeExecutable: string, testFile: string, vscodeVersion: string): Promise<number> {
    let downloadFolder = path.join(__dirname, "resources");

    // add chromedriver to process' path
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

main(process.argv);