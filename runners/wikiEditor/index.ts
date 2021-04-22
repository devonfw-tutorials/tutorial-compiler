import { Playbook } from "../../engine/playbook";
import { WikiRunner } from "../../engine/wikiRunner";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import * as path from "path";

export class WikiEditor extends WikiRunner {

    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }

    runChangeFile(runCommand: RunCommand): RunResult{
        let fileName = path.basename(runCommand.command.parameters[0]);
        let filePath = runCommand.command.parameters[0].replace(fileName, ""); // current workspace path hinzufügen oder irgendwie anders lösen. path alle nur mit / replaces reinhaun.
        let contentPath;
        let contentFile; 
        let contentString;
        //let workspacePath = this.getVariable(this.workspaceDirectory).replace(/\\/g, "/");
        if(runCommand.command.parameters[1].fileConsole || runCommand.command.parameters[1].contentConsole){
            contentPath = runCommand.command.parameters[1].fileConsole;
            contentString = runCommand.command.parameters[1].contentConsole;
        }else{
            contentPath = runCommand.command.parameters[1].file;
            contentString = runCommand.command.parameters[1].content;
            console.log(runCommand.command.parameters[1].content);
        }
        contentFile = contentPath ? 
        path.basename(contentPath)
        : undefined;
        contentPath = contentPath ?
        path.join(this.getPlaybookPath(), contentPath.replace(contentFile, ""))
        : undefined;
        let placeholder = runCommand.command.parameters[1].placeholder;
        let lineNumber = runCommand.command.parameters[1].lineNumber;

        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "changeFile.asciidoc"), {filePath : filePath,
             contentPath: contentPath, contentString: contentString, placeholder: placeholder, lineNumber: lineNumber,
            contentFile: contentFile, fileName: fileName});
        return null;
    }
}