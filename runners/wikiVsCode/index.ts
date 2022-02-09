import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";
import * as fs from "fs-extra";

export class WikiVsCode extends WikiRunner {


    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }


    runCreateFile(runCommand: RunCommand): RunResult{
        let title = this.checkForTitle(runCommand);
        let text = this.checkForText(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let fileName = path.basename(runCommand.command.parameters[0]);
        let filePath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0].replace(fileName, ""));
        filePath = path.relative(this.getWorkingDirectory(), filePath).replace(/\\/g, "/");
        let fileType = this.fileTypeMap.get(fileName.substr(fileName.indexOf(".")));
        let content = runCommand.command.parameters[1] 
            ? fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1]), { encoding: "utf-8" })
            : undefined;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFile.asciidoc"),
            {filePath : filePath , fileName: fileName, content : content, fileType: fileType, title: title, text: text, textAfter: textAfter});
        return null
    }

    runChangeFile(runCommand: RunCommand): RunResult{
        let title = this.checkForTitle(runCommand);
        let text = this.checkForText(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let fileName = path.basename(runCommand.command.parameters[0]);
        let filePath = path.join(this.getVariable(this.WORKSPACE_DIRECTORY), runCommand.command.parameters[0].replace(fileName, ""));
        filePath = path.relative(this.getWorkingDirectory(), filePath).replace(/\\/g, "/");
        let fileType = this.fileTypeMap.get(fileName.substr(fileName.indexOf(".")));
        let content = undefined;
        if(runCommand.command.parameters[1].content || runCommand.command.parameters[1].contentConsole){
            content = runCommand.command.parameters[1].content 
                ? runCommand.command.parameters[1].content
                : runCommand.command.parameters[1].contentConsole;
        }else if(runCommand.command.parameters[1].fileConsole || runCommand.command.parameters[1].file){
            content = runCommand.command.parameters[1].file 
                ? fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1].file), { encoding: "utf-8" })
                : fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1].fileConsole), { encoding: "utf-8" });
        }
        let placeholder = runCommand.command.parameters[1].placeholder;
        let lineNumber = runCommand.command.parameters[1].lineNumber;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "changeFile.asciidoc"),
            {filePath : filePath ,fileName: fileName, content : content, fileType: fileType, lineNumber: lineNumber, placeholder: placeholder, text: text, textAfter: textAfter, title: title });
        return null;
    }

    runInstallCobiGen(runCommand: RunCommand): RunResult{
        let title = this.checkForTitle(runCommand);
        let text = this.checkForText(runCommand);
        let textAfter = this.checkForTextAfter(runCommand);
        let dir = path.relative(this.getVariable(this.WORKSPACE_DIRECTORY), this.getWorkingDirectory()).replace(/\\/g, "/");
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "installCobiGen.asciidoc"),
            {dir: dir, text: text, textAfter: textAfter, title: title});
        return null;
    }

    supports(name: string, parameters: any[]): boolean {
        return this.getVariable(this.INSTALLED_TOOLS).includes("vscode")
            ? super.supports(name, parameters)
            : false;
    }

}
