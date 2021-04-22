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
        if(playbook.conclusion) {
            this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "conclusion.asciidoc"), { conclusion: playbook.conclusion});
        }
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

    runDownloadFile(runCommand: RunCommand): RunResult{
        let url = runCommand.command.parameters[0];
        let fileName = runCommand.command.parameters[1];
        let dir = runCommand.command.parameters[2];
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "downloadFile.asciidoc"), {url: url, dir: dir, fileName: fileName});
        
        return null;
    }
      
    runBuildNg(runCommand: RunCommand): RunResult {
        let angularPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let outputPath = runCommand.command.parameters.length < 1 ? runCommand.command.parameters[1] : "";
        this.renderWiki(path.join(this.getRunnerDirectory(), "template", "buildNg.asciidoc"), {angularPath: angularPath, outputPath: outputPath});
      
        return null;
    }

    runDockerCompose(runCommand: RunCommand): RunResult {
        let dir = runCommand.command.parameters[0];
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "dockerCompose.asciidoc"), { dir: dir, port: runCommand.command.parameters[1].port, app_path: runCommand.command.parameters[1].path })
        return null;
    }
  
    runCreateFolder(runCommand: RunCommand): RunResult {
        let folderPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFolder.asciidoc"), { folderPath: folderPath });
        return null;
    }
}