import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";
import * as fs from "fs-extra"

export class WikiConsole extends WikiRunner {

    

    init(playbook: Playbook): void {
        super.init(playbook);
        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory()));
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


    runRunServerJava(runCommand: RunCommand): RunResult {
        let server_path = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "runServerJava.asciidoc"), { server_path: server_path, port: runCommand.command.parameters[1].port, app_path: runCommand.command.parameters[1].path })
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

    runBuildJava(runCommand: RunCommand): RunResult {
        let directoryPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let skipTest = (runCommand.command.parameters.length == 2 && runCommand.command.parameters[1] == true) ? false : true;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "buildJava.asciidoc"), { directoryPath: directoryPath, skipTest: skipTest });
        return null;
    }
}

