import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";
import * as fs from "fs-extra";


export class WikiConsole extends WikiRunner {


    init(playbook: Playbook): void {
        super.init(playbook);
        this.setVariable(this.WORKSPACE_DIRECTORY, path.join(this.getWorkingDirectory()));
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "intro.asciidoc"),
            {name: playbook.name, title: playbook.title, subtitle: playbook.subtitle, description: playbook.description});
    }

    async destroy(playbook: Playbook): Promise<void> {
        if(playbook.conclusion) {
            this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "conclusion.asciidoc"), { conclusion: playbook.conclusion});
        }
        super.destroy(playbook);
    }

    runInstallDevonfwIde(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let tools = runCommand.command.parameters[0].join(" ");
        let version = "";
        if(runCommand.command.parameters.length == 2) {
            version = runCommand.command.parameters[1];
        }
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installDevonfwIde.asciidoc"),
            { tools: tools, version:version, title: title, text: text, textAfter: textAfter })
        this.setVariable(this.WORKSPACE_DIRECTORY, path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));
        this.setVariable(this.INSTALLED_TOOLS, tools);
        return null;
    }

    runRestoreDevonfwIde(runCommand: RunCommand): RunResult {
        return this.runInstallDevonfwIde(runCommand);
    }

    runRunServerJava(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let server_path = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "runServerJava.asciidoc"), 
            { server_path: server_path, port: runCommand.command.parameters[1].port, app_path: runCommand.command.parameters[1].path, text: text, textAfter: textAfter, title: title })
        return null;
    }

    runNpmInstall(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let projectPath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        let npmCommand = {
            "name": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].name) ? runCommand.command.parameters[1].name : undefined,
            "global": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].global) ? runCommand.command.parameters[1].global : false, 
            "args": (runCommand.command.parameters.length > 1 && runCommand.command.parameters[1].args) ? runCommand.command.parameters[1].args.join(" ") : undefined
        };

        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "npmInstall.asciidoc"), 
            { projectPath: projectPath, npmCommand: npmCommand, text: text, textAfter: textAfter, title: title });
        return null;
    }
  
    runCloneRepository(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let directoryPath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "cloneRepository.asciidoc"),
            { directoryPath: directoryPath, url: runCommand.command.parameters[1], text: text, title: title, textAfter: textAfter });
        return null;
    }


    runDownloadFile(runCommand: RunCommand): RunResult{
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let url = runCommand.command.parameters[0];
        let fileName = runCommand.command.parameters[1];
        let dir = runCommand.command.parameters[2];
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "downloadFile.asciidoc"), 
            {url: url, dir: dir, fileName: fileName, title: title, textAfter: textAfter, text: text});
        
        return null;
    }
      
    runBuildNg(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let angularPath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        let outputPath = runCommand.command.parameters.length < 1 ? runCommand.command.parameters[1] : "";
        this.renderWiki(path.join(this.getRunnerDirectory(), "template", "buildNg.asciidoc"), 
            {angularPath: angularPath, outputPath: outputPath, title: title, text: text, textAfter: textAfter});
      
        return null;
    }


    runDockerCompose(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let dir = runCommand.command.parameters[0];
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "dockerCompose.asciidoc"), 
            { dir: dir, port: runCommand.command.parameters[1].port, app_path: runCommand.command.parameters[1].path, text: text, textAfter: textAfter, title: title })
        return null;
    }
  
    runCreateFolder(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let folderPath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFolder.asciidoc"), 
            { folderPath: folderPath, text: text, textAfter: textAfter, title: title });
        return null;
    }

    runBuildJava(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let directoryPath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0]);
        let skipTest = (runCommand.command.parameters.length == 2 && runCommand.command.parameters[1] == true) ? false : true;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "buildJava.asciidoc"), 
            { directoryPath: directoryPath, skipTest: skipTest, text: text, textAfter: textAfter, title: title });
        return null;
    }

    runInstallCobiGen(runCommand: RunCommand): RunResult{
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let devonPath = path.relative(this.getWorkingDirectory(), this.getVariable(this.WORKSPACE_DIRECTORY)).replace(/\\/g, "/");;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installCobiGen.asciidoc"),
            {devonPath: devonPath, text: text, textAfter: textAfter, title: title});
        return null;
    }

    runCreateDevon4jProject(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createDevon4jProject.asciidoc"),
            { name: runCommand.command.parameters[0], text: text, textAfter: textAfter, title: title });
        return null;
    }
    
    runCreateDevon4ngProject(runCommand: RunCommand): RunResult {
        let cdCommand = runCommand.command.parameters[1];
        let ngParams = runCommand.command.parameters.length > 2 && (runCommand.command.parameters[2] instanceof Array) ? runCommand.command.parameters[2].join(" ") : "";
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createDevon4ngProject.asciidoc"), {cdCommand: cdCommand, projectName: runCommand.command.parameters[0], ngParams: ngParams})

    runAddSetupScript(runCommand: RunCommand): RunResult{
        let text = this.checkForText(runCommand);
        let title = this.checkForTitle(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let scriptNameLinux = path.basename(runCommand.command.parameters[0]);
        let scriptNameWindows = path.basename(runCommand.command.parameters[1]);
        let windowsContent = fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1]), { encoding: "utf-8" });
        let linuxContent = fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[0]), { encoding: "utf-8" });
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "addSetupScript.asciidoc"), {scriptNameWindows: scriptNameWindows, windowsContent: windowsContent,
             scriptNameLinux: scriptNameLinux, linuxContent: linuxContent, text: text, textAfter: textAfter, title: title});
      return null;
    }

    runAdaptTemplatesCobiGen(runCommand: RunCommand): RunResult{
        let title = this.checkForTitle(runCommand);
        let text = this.checkForText(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let devonPath = path.relative(this.getWorkingDirectory(), this.getVariable(this.WORKSPACE_DIRECTORY)).replace(/\\/g, "/");
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "adaptTemplates.asciidoc"), {devonPath: devonPath, text: text, textAfter: textAfter, title: title});
              return null;
    }

    runDisplayContent(runCommand: RunCommand): RunResult {
        let text = this.checkForText(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let stepTitle = this.checkForTitle(runCommand);
        let tempFile = path.join(this.getTempDirectory(), runCommand.command.name + ".md");
        fs.writeFileSync(tempFile, "");
        let counter = 2;
        for(let i = 0; i < runCommand.command.parameters[1].length; i++) {
            let param = runCommand.command.parameters[1][i];
            if(param.content) {
                fs.appendFileSync(tempFile, param.content);
            } else if(param.file) {
                fs.appendFileSync(tempFile, fs.readFileSync(path.join(this.playbookPath, param.file), "utf-8"));
            } else if (param.image) {
                this.createFolder(path.join(this.outputPathTutorial, "images"), false);
                let imageName = path.join(this.outputPathTutorial, "images",path.basename(param.image));
                while(fs.existsSync(imageName)){
                    imageName = path.join(this.outputPathTutorial, "images",path.parse(param.image).name+"_"+counter+path.parse(param.image).ext);
                    counter++;
                }
                fs.copyFileSync(path.join(this.playbookPath, param.image),imageName);
                fs.appendFileSync(tempFile, "image::images/"+path.basename(imageName)+"[]");
            }
            fs.appendFileSync(tempFile, "\n\n");
        }

        let content = fs.readFileSync(tempFile, "utf-8");
      
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "displayContent.asciidoc"),
        { steptitle: stepTitle, text: text, textAfter: textAfter, title: runCommand.command.parameters[0], content: content, path: runCommand.command.parameters[2]});
        
        return null;
    }

}

