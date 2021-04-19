import { Playbook } from "../../engine/playbook";
import { RunCommand } from "../../engine/run_command";
import { RunResult } from "../../engine/run_result";
import { WikiRunner } from "../../engine/wikiRunner";
import * as path from "path";


export class WikiVsCode extends WikiRunner {

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
        let contentPath = contentPathAndName 
        ? contentPathAndName.substring(0,contentPathAndName.lastIndexOf("/"))
        : undefined;
        let contentFile = contentPathAndName 
        ? contentPathAndName.substring(contentPathAndName.lastIndexOf("/")+1)
        : undefined;
        this.renderWiki(path.join(this.getRunnerDirectory(), "templates", "createFile.asciidoc"), {filePath : filePath , contentPath : contentPath, fileName: fileName, contentFile : contentFile });
        return null;
    }
}