import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { VsCodeUtils } from "./vscodeUtils";
import { ConsoleUtils } from "../console/consoleUtils";
import { Assertions } from "../../assertions";
import { RunCommand } from "../../engine/run_command";
import * as path from 'path';
import * as child_process from "child_process";
import * as ejs from 'ejs';
import * as fs from 'fs';

export class VsCode extends Runner {

    private installedExtensions: string[] = [];
    private env: any;
    private vsCodeSetup: boolean = false;

    init(playbook: Playbook): void {
        //this.setupVsCode();
        this.createFolder(path.join(__dirname, "tests"), true);
        this.createFolder(path.join(__dirname, "resources"), false);
        this.env = process.env;
    }

    setupVsCode() {
        this.vsCodeSetup = true;
        let vsCodeExecutable = VsCodeUtils.getVsCodeExecutable();
        if(!vsCodeExecutable || vsCodeExecutable == "") {
            console.error("Visual Studio Code seems not to be installed!");
            throw new Error("Visual Studio Code seems not to be installed!");
        }

        let vsCodeVersion = VsCodeUtils.getVsCodeVersion(path.join(path.dirname(vsCodeExecutable), "bin", "code"));
        if(!vsCodeVersion || vsCodeVersion == "") {
            console.error("Unable to get the VS Code version!");
            throw new Error("Unable to get the VS Code version!");
        }

        console.log("Setup vs code environment. Executable: " + vsCodeExecutable + ", Version: " + vsCodeVersion);
        let downloadDirectory = this.createFolder(path.join(__dirname, "resources"), false);
        let chromiumVersion = VsCodeUtils.getChromiumVersion(vsCodeVersion, downloadDirectory);
        VsCodeUtils.downloadChromeDriver(chromiumVersion, downloadDirectory);

        this.installExtension(VsCodeUtils.getVsCodeExecutable(), path.join("node_modules", "vscode-extension-tester", "resources", "api-handler.vsix"));
    }

    destroy(playbook: Playbook): void {
        this.uninstallExtensions(VsCodeUtils.getVsCodeExecutable());
    }

    runInstallCobiGen(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        ConsoleUtils.executeDevonCommandSync("cobigen", path.join(this.getWorkingDirectory(), "devonfw"), path.join(this.getWorkingDirectory(), "devonfw"), result, this.env);

        //Get latest release for cobigen plugin
        let url = "https://api.github.com/repos/devonfw-forge/cobigen-vscode-plugin/releases/latest";
        let cmd = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile cobigen_latestRelease.json\""
            : "wget -c \"" + url + "\" -O cobigen_latestRelease.json";
        let p = child_process.spawnSync(cmd, { shell: true, cwd: path.join(__dirname, "resources") });

        let cobigenRelease = require(path.join(__dirname, "resources", "cobigen_latestRelease.json"));
        let downloadUrl = cobigenRelease.assets[0].browser_download_url;

        cmd = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + downloadUrl + " -OutFile cobigen_plugin.vsix\""
            : "wget -c \"" + downloadUrl + "\" -O cobigen_plugin.vsix -";
        p = child_process.spawnSync(cmd, { shell: true, cwd: path.join(__dirname, "resources") });

        this.installExtension(VsCodeUtils.getVsCodeExecutable(), path.join(__dirname, "resources", "cobigen_plugin.vsix"))

        return result;
    }

    runCobiGenJava(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;
        
        let filepath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let directoryPath = path.dirname(filepath).replace(/\\/g, "\\\\").replace(/\//g, "//");
        let directoryName = filepath.split(path.sep)[filepath.split(path.sep).length - 2];
        let testfile = path.join(__dirname, "tests", "runCobiGenJava.js");
        this.createTestFromTemplate("runCobiGenJava.js", testfile, { directoryPath: directoryPath, directoryName: directoryName, filename: path.basename(filepath), cobigenTemplates: runCommand.command.parameters[1] });
        this.runTest(testfile, result);

        if(process.platform != "win32") {
            console.log(path.normalize(path.join(__dirname, "resources")));
            let cp = child_process.spawnSync("du -a", { shell: true, cwd: path.normalize(path.join(__dirname, "..", "resources")) });
            console.log(cp.output.toString());
        }
 
        return result;
    }

    async assertInstallCobiGen(runCommand: RunCommand, result: RunResult) {
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen.jar"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen"));
    }

    async assertCobiGenJava(runCommand: RunCommand, result: RunResult) {
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", runCommand.command.parameters[0]));
    }

    private runTest(testfile: string, result: RunResult) {
        if(result.returnCode != 0) return;

        if(!this.vsCodeSetup) {
            this.setupVsCode();
        }
        let testrunner = path.join(__dirname, "vsCodeTestRunner.js");
        let process = child_process.spawnSync("node " + testrunner + " " + testfile, { shell: true, cwd: __dirname });
        if(process.status != 0) {
            console.log("Error while running test: " + testfile + " (exit code: " + process.status + ")");
            console.log(process.stderr.toString(), process.stdout.toString());
            result.returnCode = process.status;
        }
    }

    private createTestFromTemplate(templateFile: string, targetFile: string, variables: any) {
        let template = fs.readFileSync(path.join(__dirname, "test-templates", templateFile), 'utf8');
        let result = ejs.render(template, variables);
        fs.writeFileSync(targetFile, result);
    }

    private installExtension(vsCodeExecutable: string, vsixPath: string) {
        console.log("Installing extension " + vsixPath);

        if(!this.vsCodeSetup) {
            this.setupVsCode();
        }
        let vsCodeBin = path.join(path.dirname(vsCodeExecutable), "bin", "code");
        let process = child_process.spawnSync(vsCodeBin + " --install-extension " + vsixPath, { shell: true });
        if(process.status != 0) {
            console.log("Error while installing extension: " + process.output.toString());
            throw new Error("Unable to install externsion " + vsixPath);
        }
        this.installedExtensions.push(vsixPath);
    }

    private uninstallExtensions(vsCodeExecutable: string) {
        this.installedExtensions.forEach(extension => {
            console.log("Uninstall extension " + extension);
            let vsCodeBin = path.join(path.dirname(vsCodeExecutable), "bin", "code");
            child_process.spawnSync(vsCodeBin + " --uninstall-extension " + extension, { shell: true });
        });
    }
}