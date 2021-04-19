import { Playbook } from "../../engine/playbook";
import { WikiRunner } from "../../engine/wikiRunner";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import * as path from "path";

export class WikiEclipse extends WikiRunner {

    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }

    runCreateFile(runCommand: RunCommand): RunResult{
        let filePathAndName = runCommand.command.parameters[0];
        let contentPathAndName = runCommand.command.parameters[1];
        let filePath = filePathAndName.substring(0,filePathAndName.lastIndexOf("/"));
        let fileName = filePathAndName.substring(filePathAndName.lastIndexOf("/")+1);
        let workspacePath = this.getVariable(this.workspaceDirectory).replace(/\\/g, "/");
        workspacePath = workspacePath.substr(0,workspacePath.lastIndexOf("/"));
        let parentFolder = filePath.lastIndexOf("/") == -1 
        ? workspacePath.substr(workspacePath.lastIndexOf("/")+1)
        : filePath.substring(filePath.lastIndexOf("/")+1);
        let contentPath = contentPathAndName 
        ? contentPathAndName.substring(0,contentPathAndName.lastIndexOf("/"))
        : undefined;
        let contentFile = contentPathAndName 
        ? contentPathAndName.substring(contentPathAndName.lastIndexOf("/")+1)
        : undefined;
        console.log(parentFolder);
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFile.asciidoc"), {filePath : filePath , contentPath : contentPath, fileName: fileName, contentFile : contentFile, parentFolder: parentFolder });
        return null;
    }
}