import { Runner } from "./runner";
import { Playbook } from "./playbook";
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export abstract class WikiRunner extends Runner {

    public outputPathTutorial: string;

    init(playbook: Playbook): void {
        let outputDirectory = this.createFolder(path.join(this.getOutputDirectory(), "wiki", this.environmentName), false)
        this.outputPathTutorial = this.createFolder(path.join(outputDirectory, playbook.name), true);
    }

    async destroy(playbook: Playbook): Promise<void> {

    }

    public renderWiki(templateFile: string, variables: any) {
        let template = fs.readFileSync(templateFile, 'utf8');
        let result = ejs.render(template, variables);
        let tempFile = path.join(this.outputPathTutorial, "wiki.asciidoc");
        fs.writeFileSync(tempFile, result, { flag: "a" });
    }
    
}