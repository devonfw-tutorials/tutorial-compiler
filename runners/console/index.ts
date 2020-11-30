import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";
import { Playbook } from "../../engine/playbook";
import { ConsolePlatform } from "./consoleInterfaces";
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";

export class Console extends Runner {

    private platform: ConsolePlatform;

    init(playbook: Playbook): void {
        if(process.platform=="win32") {
            this.platform = ConsolePlatform.WINDOWS;
        } else {
            this.platform = ConsolePlatform.LINUX;
        }
    }

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let settingsDir = this.createFolder(path.join(this.getWorkingDirectory(), "devonfw-settings"), true);
        this.executeCommandSync("git clone https://github.com/devonfw/ide-settings.git settings", settingsDir, result);
        
        let tools = "DEVON_IDE_TOOLS=(" + command.parameters[0].join(" ") + ")";
        fs.writeFileSync(path.join(settingsDir, "settings", "devon.properties"), tools);
        fs.renameSync(path.join(settingsDir, "settings"), path.join(settingsDir, "settings.git"));
        this.executeCommandSync("git add -A && git config user.email \"devonfw\" && git config user.name \"devonfw\" && git commit -m \"devonfw\"", path.join(settingsDir, "settings.git"), result);
        
        let installDir = path.join(this.getWorkingDirectory(), "devonfw");
        this.createFolder(installDir, true);

        if(this.platform == ConsolePlatform.WINDOWS) {
            this.executeCommandSync("powershell.exe Invoke-WebRequest -OutFile devonfw.tar.gz https://bit.ly/2BCkFa9", installDir, result);
            this.executeCommandSync("powershell.exe tar -xvzf devonfw.tar.gz", installDir, result);
            this.executeCommandSync("powershell.exe ./setup " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, "yes");
        } else {
            this.executeCommandSync("wget -c https://bit.ly/2BCkFa9 -O - | tar -xz", installDir, result);
            this.executeCommandSync("bash setup " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, "yes");
        }

        return result;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(this.platform == ConsolePlatform.WINDOWS) {
            this.executeCommandSync("devon cobigen", path.join(this.getWorkingDirectory(), "devonfw"), result);
        } else {
            this.executeCommandSync("~/.devon/devon cobigen", path.join(this.getWorkingDirectory(), "devonfw"), result);
        }
        return result;
    }

    runCreateProject(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        return result;
    }

    runCobiGenJava(step: Step, command: Command): RunResult {
        return null;
    }

    async assertInstallDevonfwIde(step: Step, command: Command, result: RunResult) {
        let installedTools = command.parameters[0];

        let assert = new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software"))
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));

        for(let i = 0; i < installedTools.length; i++) {
            if(installedTools[i] == "mvn") installedTools[i] = "maven";
            assert.directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", installedTools[i]));
        }
    }

    async assertInstallCobiGen(step: Step, command: Command, result: RunResult) {
        let assert = new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen.jar"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen"));
    }

    async assertCobiGenJava(step: Step, command: Command, result: RunResult) {
        console.log("assertCobiGenJava");
    }

    async assertCreateProject(step: Step, command: Command, result: RunResult) {
        console.log("assertCreateProject");
    }

    private executeCommandSync(command: string, directory: string, result: RunResult, input?: string) {
        if(result.returnCode != 0) return;

        let process = child_process.spawnSync(command, { shell: true, cwd: directory, input: input });
        if(process.status != 0) {
            console.log("Error executing command: " + command + " (exit code: " + process.status + ")");
            console.log(process.stderr.toString(), process.stdout.toString());
            result.returnCode = process.status;
        }
    }
}