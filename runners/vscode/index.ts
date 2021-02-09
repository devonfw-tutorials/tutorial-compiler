import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Playbook } from "../../engine/playbook";
import { Console } from "../console/index";
import { VsCodeUtils } from "./vscodeUtils";
import * as path from 'path';
import * as child_process from "child_process";
import * as ejs from 'ejs';
import * as fs from 'fs';

export class VsCode extends Runner {

    private consoleRunner: Console;
    private variables: Map<string, any> = new Map<string, any>();
    private installedExtensions: string[] = [];

    init(playbook: Playbook): void {
        this.consoleRunner = new Console();
        let name = "vscode";
        this.consoleRunner.registerGetVariableCallback((name) => this.variables.get(name));
        this.consoleRunner.registerSetVariableCallback((name, value) => this.variables.set(name, value));
        this.consoleRunner.path = __dirname + "/../runners/" + name + "/";
        this.consoleRunner.name = name;
        this.consoleRunner.playbookName = playbook.name;
        this.consoleRunner.playbookPath = playbook.path;
        this.consoleRunner.playbookTitle = playbook.title;
        this.consoleRunner.init(playbook);

        this.setupVsCode();
        this.createFolder(path.join(__dirname, "tests"), true);
        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory()));
    }

    setupVsCode() {
        let vsCodeExecutable = VsCodeUtils.getVsCodeExecutable();
        if(!vsCodeExecutable) {
            throw new Error("Visual Studio Code seems not to be installed!");
        }

        let vsCodeVersion = VsCodeUtils.getVsCodeVersion();
        if(!vsCodeVersion) {
            throw new Error("Unable to get the VS Code version!");
        }

        console.log("Setup vs code environment. Executable: " + vsCodeExecutable + ", Version: " + vsCodeVersion);
        let downloadDirectory = this.createFolder(path.join(__dirname, "resources"), false);
        let chromiumVersion = VsCodeUtils.getChromiumVersion(vsCodeVersion, downloadDirectory);
        VsCodeUtils.downloadChromeDriver(chromiumVersion, downloadDirectory);

        this.installExtension(VsCodeUtils.getVsCodeExecutable(), path.join("node_modules", "vscode-extension-tester", "resources", "api-handler.vsix"));
    }

    destroy(playbook: Playbook): void {
        this.consoleRunner.destroy(playbook);
        this.uninstallExtensions(VsCodeUtils.getVsCodeExecutable());
    }

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let result = this.consoleRunner.runInstallDevonfwIde(step, command);
        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));
        this.setVariable(this.useDevonCommand, true);
        return result;
    }


    runRestoreDevonfwIde(step: Step, command: Command): RunResult {
        return this.runInstallDevonfwIde(step, command);
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        let result = this.consoleRunner.runInstallCobiGen(step, command);

        //Get latest release for cobigen plugin
        let url = "https://api.github.com/repos/devonfw-forge/cobigen-vscode-plugin/releases/latest";
        let cmd = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile cobigen_latestRelease.json\""
            : "wget -c \"" + url + "\" -O cobigen_latestRelease.json";
        child_process.spawnSync(cmd, { shell: true, cwd: path.join(__dirname, "resources") });

        let cobigenRelease = require(path.join(__dirname, "resources", "cobigen_latestRelease.json"));
        let downloadUrl = cobigenRelease.assets[0].browser_download_url;

        cmd = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + downloadUrl + " -OutFile cobigen_plugin.vsix\""
            : "wget -c \"" + downloadUrl + "\" -O cobigen_plugin.vsix -";
        child_process.spawnSync(cmd, { shell: true, cwd: path.join(__dirname, "resources") });

        this.installExtension(VsCodeUtils.getVsCodeExecutable(), path.join(__dirname, "resources", "cobigen_plugin.vsix"))

        return result;
    }

    runCreateDevon4jProject(step: Step, command: Command): RunResult {
        return this.consoleRunner.runCreateDevon4jProject(step, command);
    }

    runCreateFile(step: Step, command: Command): RunResult {
        return this.consoleRunner.runCreateFile(step, command);
    }
    
    runBuildJava(step: Step, command: Command): RunResult {
        return this.consoleRunner.runBuildJava(step, command);
    }

    runCobiGenJava(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;
        
        let filepath = path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]);
        let directoryPath = path.dirname(filepath).replace(/\\/g, "\\\\").replace(/\//g, "//");
        let directoryName = filepath.split(path.sep)[filepath.split(path.sep).length - 2];
        let testfile = path.join(__dirname, "tests", "runCobiGenJava.js");
        this.createTestFromTemplate("runCobiGenJava.js", testfile, { directoryPath: directoryPath, directoryName: directoryName, filename: path.basename(filepath), cobigenTemplates: command.parameters[1] });
        this.runTest(testfile, result);
 
        return result;
    }

    runChangeFile(step: Step, command: Command): RunResult {
        return this.consoleRunner.runChangeFile(step, command);
    }

    runRunServerJava(step: Step, command: Command): RunResult {
        return this.consoleRunner.runRunServerJava(step, command);
    }

    runCloneRepository(step: Step, command: Command): RunResult {
        return this.consoleRunner.runCloneRepository(step, command);
    }

    runNpmInstall(step: Step, command: Command): RunResult {
        return this.consoleRunner.runNpmInstall(step, command);
    }

    async assertInstallDevonfwIde(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertInstallDevonfwIde(step, command, result);
    }

    async assertRestoreDevonfwIde(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertRestoreDevonfwIde(step, command, result);
    }

    async assertInstallCobiGen(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertInstallCobiGen(step, command, result);
    }

    async assertBuildJava(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertBuildJava(step, command, result);
    }

    async assertCobiGenJava(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertCobiGenJava(step, command, result);
    }

    async assertCreateDevon4jProject(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertCreateDevon4jProject(step, command, result);
    }

    async assertCreateFile(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertCreateFile(step, command, result);
    }

    async assertChangeFile(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertChangeFile(step, command, result);
    }

    async assertRunServerJava(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertRunServerJava(step, command, result);
    }

    async assertCloneRepository(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertCloneRepository(step, command, result);
    }

    async assertNpmInstall(step: Step, command: Command, result: RunResult) {
        return this.consoleRunner.assertNpmInstall(step, command, result);
    }

    private runTest(testfile: string, result: RunResult) {
        if(result.returnCode != 0) return;

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