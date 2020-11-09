import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { execSync } from "child_process";
import { readdir, readdirSync } from "fs";
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

export class Katacoda extends Runner {

    private outputPathTutorial: string;
    private tempPath: string;
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

        // delete and rebuild scripts folder
        if (fs.existsSync(this.getOutputDirectory() + "../scripts/")) {
            fs.rmdirSync(this.getOutputDirectory() + "../scripts/", { recursive: true });
        }
        fs.mkdirSync(this.getOutputDirectory() + "../scripts/");

        // delete and rebuild temp folder
        this.tempPath = this.getTempDirectory() + "katacoda/" + this.getPlaybookName();
        if (fs.existsSync(this.tempPath)) {
            fs.rmdirSync(this.tempPath, { recursive: true });
        }
        fs.mkdirSync(this.tempPath, { recursive: true });

        this.description = playbook.description;
        this.steps = [];
        this.assets = [];
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', this.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // copy all assets from temp in assets folder
        if (fs.existsSync(this.outputPathTutorial + "assets")) {
            fs.rmdirSync(this.outputPathTutorial + "assets", { recursive: true });
        }
        fs.mkdirSync(this.outputPathTutorial + "assets", { recursive: true });
        this.copyAssets(this.tempPath.replace(/\\/g, "/"), (this.outputPathTutorial + "assets").replace(/\\/g, "/"), this.tempPath.replace(/\\/g, "/"), "/devonfw");

        // Write index file. Required for katacoda to load the tutorial.
        let indexJsonObject = {
            "title": this.getPlaybookTitle(),
            "difficulty": "Beginner",
            "time": ((this.stepsCount - 1) * 5) + " Minutes",
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
                "imageid": "ubuntu:2004"
            }
        }
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonIde(step: Step, command: Command): RunResult {
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ");

        // create and execute script to clone devon ide settings repo
        this.renderTemplate("scripts/" + "cloneDevonIdeSettings.sh", this.getOutputDirectory() + "../scripts/" + this.stepsCount + "_cloneDevonIdeSettings.sh", { tools: params, tempdir: this.tempPath.replace(/\\/g, "/")});
        const { exec } = require('child_process');
        execSync("bash " + this.getTempDirectory() + "../scripts/1_cloneDevonIdeSettings.sh");

        // script to rename the git folder
        this.renderTemplate("scripts/" + "renameGitFolder.sh", this.outputPathTutorial + "renameGitFolder.sh", {});

        this.renderTemplate("installDevonIde.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        this.steps.push({
            "title": "Install Devon IDE",
            "text": "step1.md",
            "foreground": "renameGitFolder.sh"
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

    private copyAssets(fromDirectory: string, toDirectory: string, source: string, katacodaFolder: string) {
        let dir = readdirSync(fromDirectory);
        dir.forEach(file => {
            if(fs.lstatSync(fromDirectory + "/" + file).isDirectory()) {
                this.copyAssets(fromDirectory + "/" + file, toDirectory, source, katacodaFolder);
            } else {
                if (!fs.existsSync(toDirectory + "/" + fromDirectory.substr(source.length, fromDirectory.length - 1))) {
                    fs.mkdirSync(toDirectory + "/" + fromDirectory.substr(source.length, fromDirectory.length - 1), { recursive: true });
                }
                
                fs.copyFileSync(fromDirectory + "/" + file, toDirectory + "/" + fromDirectory.substr(source.length, fromDirectory.length - 1) + "/" + file);
                this.assets.push({
                    "file": fromDirectory.substr(source.length, fromDirectory.length - 1) + "/" + file,
                    "target": "/root" + katacodaFolder + fromDirectory.substr(source.length, fromDirectory.length - 1) + "/"
                });
            }
        });
    }

}