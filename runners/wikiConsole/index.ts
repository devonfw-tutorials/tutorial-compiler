import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";

export class WikiConsole extends WikiRunner {

    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }

    runInstallDevonfwIde(runCommand: RunCommand): RunResult {
        let tools = runCommand.command.parameters[0].join(" ");
        let version = "";
        if(runCommand.command.parameters.length == 2) {
            version = runCommand.command.parameters[1];
        }
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installDevonfwIde.asciidoc"), { tools: tools, version:version })
        return null;
    }
    runCreateFile(runCommand: RunCommand): RunResult{
        console.log("HalloCOnsole");
        console.log(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]));
        return null
    }

    runChangeFile(runCommand: RunCommand): RunResult{
        let filePath = runCommand.command.parameters[0];
        console.log(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]));
        let contentPath = runCommand.command.parameters[1].file;
        let placeholder = runCommand.command.parameters[1].placeholder;
        let lineNumber = runCommand.command.parameters[1].lineNumber;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "changeFile.asciidoc"), {filePath : filePath});
        return null;
    }

    runCloneRepository(runCommand: RunCommand): RunResult {
        let directoryPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"), { directoryPath: directoryPath, url: runCommand.command.parameters[1] });
        return null;
    }
}