import { Playbook } from "../../engine/playbook";
import { WikiRunner } from "../../engine/wikiRunner";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import * as path from "path";

export class WikiEclipse extends WikiRunner {

    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }

    runCreateFile(runCommand: RunCommand): RunResult{
        let workspacePath = this.getVariable(this.workspaceDirectory).replace(/\\/g, "/");
        let fileName = path.basename(runCommand.command.parameters[0]);
        let filePath = path.join(workspacePath, runCommand.command.parameters[0].replace(fileName, ""));
        let contentFile = runCommand.command.parameters[1] 
            ? path.basename(runCommand.command.parameters[1])
            : undefined;
        let contentPath = runCommand.command.parameters[1] 
            ? path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[1].replace(contentFile, ""))
            : undefined;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFile.asciidoc"), {filePath : filePath , contentPath : contentPath, fileName: fileName, contentFile : contentFile});
        return null;
    }
}