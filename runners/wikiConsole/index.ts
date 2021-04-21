import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";
import * as fs from "fs";

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

    runDownloadFile(runCommand: RunCommand): RunResult{
        let url = runCommand.command.parameters[0];
        let fileName = runCommand.command.parameters[1];
        let dir = runCommand.command.parameters[2];
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "downloadFile.asciidoc"), {url: url, dir: dir, fileName: fileName});
        return null;
    }
}