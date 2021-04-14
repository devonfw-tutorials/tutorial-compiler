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

    runNpmInstall(runCommand: RunCommand): RunResult {
        let projectPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let npmCommand = {
            "name": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].name) ? runCommand.command.parameters[1].name : undefined,
            "global": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].global) ? runCommand.command.parameters[1].global : false, 
            "args": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].args) ? runCommand.command.parameters[1].args.join(" ") : undefined
        };

        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "npmInstall.asciidoc"), { projectPath: projectPath, npmCommand: npmCommand });
        return null;
    }
  
    runCloneRepository(runCommand: RunCommand): RunResult {
        let directoryPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"), { directoryPath: directoryPath, url: runCommand.command.parameters[1] });
        return null;
    }
}