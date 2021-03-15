import { Runner } from "../../engine/runner";
import { Playbook } from "../../engine/playbook";
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export abstract class WikiRunner extends Runner {

    public outputPathTutorial: string;
    public environment: string;

    init(playbook: Playbook): void {
        let outputDirectory = this.createFolder(path.join(this.getOutputDirectory(), "wiki", this.environment), false)
        this.outputPathTutorial = this.createFolder(path.join(outputDirectory, playbook.name), true);
    }

    destroy(playbook: Playbook): void {

    }

    public renderWiki(templateFile: string, variables: any) {
        let template = fs.readFileSync(templateFile, 'utf8');
        let result = ejs.render(template, variables);
        let tempFile = path.join(this.outputPathTutorial, "wiki.asciidoc");
        fs.writeFileSync(tempFile, result, {flag: "a"});
    }

}