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
        result.returnCode = 1;

        let settingsDir = this.createFolder(path.join(this.getWorkingDirectory(), "devonfw-settings"), true);
        child_process.execSync("cd " + settingsDir + " && git clone https://github.com/devonfw/ide-settings.git settings");
        
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ").trim();
        let tools = "DEVON_IDE_TOOLS=(" + params + ")"
        fs.writeFileSync(path.join(settingsDir, "settings", "devon.properties"), tools);
        fs.renameSync(path.join(settingsDir, "settings"), path.join(settingsDir, "settings.git"));
        child_process.execSync("cd " + path.join(settingsDir, "settings.git") + " && git add -A && git config user.email \"devonfw\" && git config user.name \"devonfw\" && git commit -m \"devonfw\"");

        let installDir = path.join(this.getWorkingDirectory(), "devonfw");
        this.createFolder(installDir, false);

        child_process.execSync("cd " + installDir + " && curl -L -o devonfw.tar.gz https://bit.ly/2BCkFa9");
        child_process.execSync("cd " + installDir + " && tar -xf devonfw.tar.gz");
        child_process.execSync(path.join(installDir, "setup") + " " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"));
        
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
}