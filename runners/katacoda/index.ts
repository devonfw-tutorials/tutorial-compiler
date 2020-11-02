import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
const ejs = require('ejs');
const fs = require('fs');

export class Katacoda extends Runner {

    private outputPath: string;
    private stepsCount = 1;

    init(playbook: Playbook): void {
        this.outputPath = this.getOutputDirectory() + playbook.name + "/";
        if (fs.existsSync(this.outputPath)) {
            fs.rmdirSync(this.outputPath, { recursive: true });
        }
        fs.mkdirSync(this.outputPath);
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPath + 'index.json', ""); //TODO: inhalt
    }

    runInstallDevonIde(step: Step, command: Command): RunResult {
        this.renderTemplate("installDevonIde.md", "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        return null;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        this.renderTemplate("installCobiGen.md", "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        return null;
    }

    private renderTemplate(name: string, targetName: string, variables) {
        let template = fs.readFileSync(this.getRunnerDirectory() + "/templates/" + name, 'utf8');
        let result = ejs.render(template, variables);
        fs.writeFileSync(this.outputPath + "/" + targetName, result);
    }
}