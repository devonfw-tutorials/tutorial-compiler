import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
const ejs = require('ejs');
const fs = require('fs');

export class Katacoda extends Runner {

    private outputPathTutorial: string;
    //private outputPathEnvironment: string;
    private stepsCount = 1;
    private description: string;
    private steps: object[];
    private assets: object[];

    init(playbook: Playbook): void {
        // create directory for katacoda tutorials if not exist
        if(!fs.existsSync(this.getOutputDirectory() + "katacoda/")) {
            fs.mkdirSync(this.getOutputDirectory() + "katacoda/");
        }

        // delete and rebuild directory for tutorial
        this.outputPathTutorial = this.getOutputDirectory() + "katacoda/" + playbook.name + "/";
        if (fs.existsSync(this.outputPathTutorial)) {
            fs.rmdirSync(this.outputPathTutorial, { recursive: true });
        }
        fs.mkdirSync(this.outputPathTutorial);

        // delete and rebuild directory for environment
        //this.outputPathEnvironment = this.outputPathTutorial + "../" + playbook.name.substr(0, playbook.name.length - 1) + "env/";
        //if(fs.existsSync(this.outputPathEnvironment)) {
        //    fs.rmdirSync(this.outputPathEnvironment, { recursive: true });
        //}
        //fs.mkdirSync(this.outputPathEnvironment + "build/", { recursive: true });
        //fs.writeFileSync(this.outputPathEnvironment + "katacoda.yaml", "base: 'ubuntu1604'");

        // delete and rebuild scripts folder
        if (fs.existsSync(this.getOutputDirectory() + "../scripts/")) {
            fs.rmdirSync(this.getOutputDirectory() + "../scripts/", { recursive: true });
        }
        fs.mkdirSync(this.getOutputDirectory() + "../scripts/");

        this.description = playbook.description;
        this.steps = [];
        this.assets = [];
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', this.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // Write index file. Required for katacoda to load the tutorial.
        let indexJsonObject = {
            "title": this.getPlaybookTitle(),
            "details": {
                "steps": this.steps,
                "intro": {
                    "text": "intro.md"
                },
                "finish": {
                    "text": "finish.md"
                },
                "assets": {
                    "client": this.assets
                }
            },
            "environment": {
                "uilayout": "terminal",
                "showide": true
            },
            "backend": {
                "imageid": "devonfw-" + playbook.name.substr(0, playbook.name.length - 1) + "env"
            }
        }
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonIde(step: Step, command: Command): RunResult {
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ");

        this.renderTemplate("scripts/" + "cloneDevonIdeSettings.sh", this.getOutputDirectory() + "../scripts/" + this.stepsCount + "_cloneDevonIdeSettings.sh", { tools: params });
        const { exec } = require('child_process');
        exec("bash " + this.getOutputDirectory() + "../scripts/1_cloneDevonIdeSettings.sh", (err, stdout, stderr) => {
            if (err) {
            //some err occurred
            console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        });

        this.renderTemplate("installDevonIde.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        this.steps.push({
            "title": "Install Devon IDE",
            "text": "step1.md"
        });
        return null;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        this.renderTemplate("installCobiGen.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        
        this.steps.push({
            "title": "Install CobiGen",
            "text": "step2.md"
        });
        return null;
    }

    private renderTemplate(name: string, targetName: string, variables) {
        let template = fs.readFileSync(this.getRunnerDirectory() + "/templates/" + name, 'utf8');
        let result = ejs.render(template, variables);
        fs.writeFileSync(targetName, result);
    }


}