import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as fs from "fs";
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
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installDevonfwIde.asciidoc"), { tools: tools })
        return null;
    }

    runDownloadFile(runCommand: RunCommand): RunResult{
        let url = runCommand.command.parameters[0];
        let fileName = runCommand.command.parameters[1];
        let dir = runCommand.command.parameters[2];
        let newDir = dir ? 
        !fs.existsSync(path.join(this.getWorkingDirectory(), dir))
        : undefined;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "downloadFile.asciidoc"), {url: url, dir: dir, fileName: fileName, newDir: newDir});
        return null;
    }
    
}