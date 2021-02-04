import * as path from "path";
import { VSRunner } from "./vsCodeRunner";
import { VsCodeUtils } from "./vscodeUtils";

function main(args: string[]) {
    if(args && args.length > 2) {
        let testfile = args[2];
        let vsCodeExecutable = VsCodeUtils.getVsCodeInstallDirectory();
        let vsCodeVersion = VsCodeUtils.getVsCodeVersion();
        runTest(vsCodeExecutable, testfile, vsCodeVersion);
    }
}

function runTest(vsCodeExecutable: string, testFile: string, vscodeVersion: string): Promise<number> {
    let downloadFolder = path.resolve("build/runners/vscode/resources");

    // add chromedriver to process' path
    let env: NodeJS.ProcessEnv = {};
    Object.assign(env, process.env);
    const key = 'PATH';
    env[key] = [downloadFolder, process.env[key]].join(path.delimiter);

    process.env = env;
    process.env.TEST_RESOURCES = downloadFolder;

    let runner = new VSRunner(vsCodeExecutable, vscodeVersion, {}, false, "");
    return runner.runTests(testFile, "info");
}

main(process.argv);