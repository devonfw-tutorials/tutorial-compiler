import { Runner } from "./runner";
import { Playbook } from "./playbook";
import { RunCommand } from "./run_command";
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export abstract class WikiRunner extends Runner {

    public outputPathTutorial: string;
    protected fileTypeMap = new Map([ [".java", "java"],[".ts", "typescript"],
    [".js", "javascript"], [".html", "html"],
    [".scss", "css"], [".asciidoc", "asciidoc"], ]);
    protected readonly INSTALLED_TOOLS: string = "installedTools";
    public CommandCntMap = new Map();


    init(playbook: Playbook): void {
        let outputDirectory = this.createFolder(path.join(this.getOutputDirectory(), "wiki", this.environmentName), false)
        this.outputPathTutorial = this.createFolder(path.join(outputDirectory, playbook.name), true);
        this.setVariable(this.WORKSPACE_DIRECTORY, path.join(this.getWorkingDirectory()));
        this.setVariable(this.INSTALLED_TOOLS, "");
    }

    async destroy(playbook: Playbook): Promise<void> {

    }

    public renderWiki(templateFile: string, variables: any) {
        let template = fs.readFileSync(templateFile, 'utf8');
        let result = ejs.render(template, variables);
        let tempFile = path.join(this.outputPathTutorial, "wiki.asciidoc");
        fs.writeFileSync(tempFile, result, { flag: "a" });
    }

    protected checkForText(runCommand: RunCommand): string{    
        return runCommand.lineIndex == 0 
            ? runCommand.text
            : undefined; 
    }

    protected checkForTitle(runCommand: RunCommand): string{    
        return runCommand.lineIndex == 0 
            ? runCommand.stepTitle
            : undefined; 
    }

    protected checkForTextAfter(runCommand: RunCommand): string{
        return this.CommandCntMap.get(runCommand.stepIndex) == runCommand.lineIndex 
            ? runCommand.textAfter
            : undefined;
    }

}