import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";
import { ChildProcess } from "child_process";

export class Console extends Runner {

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 1;

        let settingsDir = this.createFolder(path.join(this.getWorkingDirectory(), "devonfw-settings"), true);
        this.executeCommandSync("git clone https://github.com/devonfw/ide-settings.git settings", settingsDir);
        
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ").trim();
        let tools = "DEVON_IDE_TOOLS=(" + params + ")";
        fs.writeFileSync(path.join(settingsDir, "settings", "devon.properties"), tools);
        fs.renameSync(path.join(settingsDir, "settings"), path.join(settingsDir, "settings.git"));
        this.executeCommandSync("git add -A && git config user.email \"devonfw\" && git config user.name \"devonfw\" && git commit -m \"devonfw\"", path.join(settingsDir, "settings.git"));
        
        let installDir = path.join(this.getWorkingDirectory(), "devonfw");
        this.createFolder(installDir, false);
        this.executeCommandSync("curl -L -o devonfw.tar.gz https://bit.ly/2BCkFa9", installDir);
        this.executeCommandSync("tar -xf devonfw.tar.gz", installDir);
        
        child_process.spawnSync(path.join(installDir, "setup") + " " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), { shell: true, input: "yes"});
        
        result.returnCode = 0;
        return result;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        return null;
    }

    async assertInstallDevonfwIde(step: Step, command: Command, result: RunResult) {
        console.log("assertInstallDevonfwIde");
        console.log(result)
        new Assertions()
        .noErrorCode(result)
        .noException(result);
    }

    async assertInstallCobiGen(step: Step, command: Command, result: RunResult) {
        console.log("assertInstallCobiGen");
    }

    private executeCommandSync(command: string, directory: string) {
        child_process.execSync("cd " + path.join(directory) + " && " + command);
    }
}