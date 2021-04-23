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
        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));
        return null;
    }

    runChangeFile(runCommand: RunCommand): RunResult{
            let workspacePath = this.getVariable(this.workspaceDirectory).replace(/\\/g, "/");
            let filePath = path.join(workspacePath,runCommand.command.parameters[0]);
            let fileName = path.basename(runCommand.command.parameters[0]); 
            let contentPath, contentString;
            if(runCommand.command.parameters[1].fileConsole || runCommand.command.parameters[1].contentConsole){
                contentPath = runCommand.command.parameters[1].fileConsole;
                contentString = runCommand.command.parameters[1].contentConsole;
            }else{
                contentPath = runCommand.command.parameters[1].file;
                contentString = runCommand.command.parameters[1].content;
            }
            contentPath = contentPath 
            ? path.join(this.getPlaybookPath(), contentPath)
            : undefined;
            let contentFile = contentPath 
            ? path.basename(contentPath)
            : undefined;
            let placeholder = runCommand.command.parameters[1].placeholder;
            let lineNumber = runCommand.command.parameters[1].lineNumber;
    
            this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "changeFile.asciidoc"), {filePath : filePath,
                 contentPath: contentPath, contentString: contentString, placeholder: placeholder, lineNumber: lineNumber, fileName: fileName, contentFile: contentFile});
            return null;
    }

    runCloneRepository(runCommand: RunCommand): RunResult {
        let directoryPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"), { directoryPath: directoryPath, url: runCommand.command.parameters[1] });
        return null;
    }
}