import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";

export class Console extends Runner {

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
        this.executeCommandSync("curl -L -o devonfw.tar.gz https://bit.ly/2BCkFa9", installDir, result);
        this.executeCommandSync("tar -xf devonfw.tar.gz", installDir, result);
        
        this.executeCommandSync(path.join(installDir, "setup") + " " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), "", result, "yes");
        
        return result;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        return null;
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
        console.log("assertInstallCobiGen");
    }

    async assertCobiGenJava(step: Step, command: Command, result: RunResult) {
        console.log("assertCobiGenJava");
    }

    private executeCommandSync(command: string, directory: string, result: RunResult, input?: string) {
        if(result.returnCode != 0) return;

        let process = child_process.spawnSync("cd " + path.join(directory) + " && " + command, { shell: true, input: input });
        if(process.status != 0) {
            console.log("Error executing command: " + command + " (exit code: " + process.status + ")");
            console.log(process.stderr.toString(), process.stdout.toString());
            result.returnCode = process.status;
        }
    }
}