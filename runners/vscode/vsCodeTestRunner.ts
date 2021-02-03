import * as path from "path";
import { VSRunner } from "./vsCodeRunner";
import { VsCodeUtils } from "./vscodeUtils";

async function main() {
    let vsCodeExecutable = VsCodeUtils.getVsCodeInstallDirectory();
    let vsCodeVersion = VsCodeUtils.getVsCodeVersion();
    runTests(vsCodeExecutable, "build/runners/vscode/tests/*.js", vsCodeVersion);
    return 0;
}

async function runTests(exe: string, testFilesPattern: string, vscodeVersion: string = 'latest', settings: string = '', config?: string): Promise<number> {
    let downloadFolder = path.resolve("build/runners/vscode/resources");

    // add chromedriver to process' path
    const finalEnv: NodeJS.ProcessEnv = {};
    Object.assign(finalEnv, process.env);
    const key = 'PATH';
    finalEnv[key] = [downloadFolder, process.env[key]].join(path.delimiter);

    process.env = finalEnv;
    process.env.TEST_RESOURCES = downloadFolder;

    let cleanup = false;
    const runner = new VSRunner(exe, vscodeVersion, {}, cleanup, config);

    let logLevel = "info";
    return runner.runTests(testFilesPattern, logLevel);
}

main();