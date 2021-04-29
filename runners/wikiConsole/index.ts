import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";
import * as fs from 'fs';

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

    runCloneRepository(runCommand: RunCommand): RunResult {
        let directoryPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"), { directoryPath: directoryPath, url: runCommand.command.parameters[1] });
        return null;
    }

    runCreateFile(runCommand: RunCommand): RunResult{
        let workspacePath = this.getVariable(this.workspaceDirectory).replace(/\\/g, "/");
        let fileName = path.basename(runCommand.command.parameters[0]);
        let filePath = path.join(workspacePath, runCommand.command.parameters[0].replace(fileName, ""));
        let contentFile = path.basename(runCommand.command.parameters[1]);
        let contentPath = path.join(workspacePath, runCommand.command.parameters[1].replace(contentFile, ""));
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFile.asciidoc"), {filePath : filePath , contentPath : contentPath, fileName: fileName, contentFile: contentFile});
        return null;
    }
}