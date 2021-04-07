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
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installDevonfwIde.asciidoc"), { tools: tools })
        return null;
    }

    runCloneRepository(runCommand: RunCommand): RunResult {
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"), { directoryPath: runCommand.command.parameters[0], url: runCommand.command.parameters[1] });
        return null;
    }
}