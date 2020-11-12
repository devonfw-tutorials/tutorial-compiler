import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { execSync } from "child_process";
import { readdir, readdirSync } from "fs";
import { KatacodaTools } from "../../engine/katacodaTools";
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

export class Katacoda extends Runner {

    private outputPathTutorial: string;
    private tempPath: string;
    private tempPathTutorial: string;
    private stepsCount = 1;
    private description: string;
    private steps: object[];
    private assets: object[];
    private assetPathsToCopySource: string[];
    private assetPathsToCopyTarget: string[];
    private setupScripts: object[];
    private setupDir: string;

    init(playbook: Playbook): void {
        // create directory for katacoda tutorials if not exist
        if(!fs.existsSync(path.join(this.getOutputDirectory(), "katacoda/"))) {
            fs.mkdirSync(path.join(this.getOutputDirectory(), "katacoda/"));
        }

        // delete and rebuild directory for tutorial
        this.outputPathTutorial = path.join(this.getOutputDirectory(), "katacoda/", playbook.name);
        if (fs.existsSync(this.outputPathTutorial)) {
            fs.rmdirSync(this.outputPathTutorial, { recursive: true });
        }
        fs.mkdirSync(this.outputPathTutorial);

        // if general temp directory does not exist create it
        this.tempPath = path.join(this.getTempDirectory(), "katacoda/");
        if (!fs.existsSync(this.tempPath)) {
            fs.mkdirSync(this.tempPath, { recursive: true });
        }

        // delete and rebuild temp directory for this tutorial
        this.tempPathTutorial = path.join(this.tempPath, playbook.name);
        if (fs.existsSync(this.tempPathTutorial)) {
            fs.rmdirSync(this.tempPathTutorial, { recursive: true });
        }
        fs.mkdirSync(this.tempPathTutorial, { recursive: true });

        // create folder for setup scripts inside the temp directory
        this.setupDir = path.join(this.tempPathTutorial, "setup");
        fs.mkdirSync(this.setupDir, { recursive: true })

        // initialize private variables
        this.description = playbook.description;
        this.steps = [];
        this.assets = [];
        this.assetPathsToCopySource = [];
        this.assetPathsToCopyTarget = [];
        this.setupScripts = [];
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', this.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // create assets folder for the tutorial
        if (fs.existsSync(path.join(this.outputPathTutorial, "assets", "setup"))) {
            fs.rmdirSync(path.join(this.outputPathTutorial, "assets", "setup"), { recursive: true });
        }
        fs.mkdirSync(path.join(this.outputPathTutorial, "assets", "setup"), { recursive: true });

        // create and configure required files for the setup process
        this.renderTemplate(path.join("scripts", "intro_foreground.sh"), path.join(this.outputPathTutorial, "intro_foreground.sh"), { });
        this.renderTemplate(path.join("scripts", "intro_background.sh"), path.join(this.outputPathTutorial, "intro_background.sh"), { });
        this.renderTemplate(path.join("scripts", "setup.sh"), path.join(this.tempPathTutorial, "setup", "setup.sh"), {});
        let setupFile = path.join(this.outputPathTutorial, "assets", "setup", "setup.txt");
        fs.writeFileSync(setupFile, this.setupScripts.length + "\n\n");
        for(let i = 0; i < this.setupScripts.length; i++) {
            fs.appendFileSync(setupFile, this.setupScripts[i]["name"] + "\n");
            fs.appendFileSync(setupFile, this.setupScripts[i]["script"] + "\n");
            fs.appendFileSync(setupFile, "##########\n");
        }
        this.assets.push({
            "file": "setup/setup.txt",
            "target": "/root/setup"
        });

        // copy all assets from temp in assets folder
        for(let i = 0; i < this.assetPathsToCopySource.length; i++) {
            this.copyAssets(this.assetPathsToCopySource[i], (this.outputPathTutorial + "assets"), this.assetPathsToCopySource[i], this.assetPathsToCopyTarget[i]);
        }

        // write index file, required for katacoda to load the tutorial
        let indexJsonObject = KatacodaTools.generateIndexJson(this.getPlaybookTitle(), ((this.stepsCount - 1) * 5), this.steps, this.assets);
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonIde(step: Step, command: Command): RunResult {
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ").replace(/vscode/,"").replace(/eclipse/, "").trim();

        // create script to download devon ide settings
        this.renderTemplate(path.join("scripts", "cloneDevonIdeSettings.sh"), path.join(this.setupDir, "cloneDevonIdeSettings.sh"), { tools: params, cloneDir: "/root/devonfw-settings/"});
        this.assetPathsToCopySource.push(this.tempPathTutorial);
        this.assetPathsToCopyTarget.push("");
        // add the script to the setup scripts for executing it at the beginning of the tutorial
        this.setupScripts.push({
            "name": "Clone Devon IDE settings",
            "script": "cloneDevonIdeSettings.sh"
        });

        this.steps.push({
            "title": "Install Devon IDE",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("installDevonIde.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        return null;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        this.steps.push({
            "title": "Install CobiGen",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("installCobiGen.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
        return null;
    }

    private renderTemplate(name: string, targetPath: string, variables) {
        let template = fs.readFileSync(path.join(this.getRunnerDirectory(),"templates", name), 'utf8');
        let result = ejs.render(template, variables);
        fs.writeFileSync(targetPath, result);
    }

    private copyAssets(fromDirectory: string, toDirectory: string, source: string, katacodaFolder: string) {
        let dir = readdirSync(fromDirectory);
        dir.forEach(file => {
            if(fs.lstatSync(path.join(fromDirectory, file)).isDirectory()) {
                this.copyAssets(path.join(fromDirectory, file), toDirectory, source, katacodaFolder);
            } else {
                if (!fs.existsSync(path.join(toDirectory, fromDirectory.substr(source.length, fromDirectory.length - 1)))) {
                    fs.mkdirSync(path.join(toDirectory, fromDirectory.substr(source.length, fromDirectory.length - 1)), { recursive: true });
                }
                
                fs.copyFileSync(path.join(fromDirectory, file), path.join(toDirectory, fromDirectory.substr(source.length, fromDirectory.length - 1), file));
                this.assets.push({
                    "file": path.join(fromDirectory.substr(source.length, fromDirectory.length - 1), file).replace(/\\/g, "/"),
                    "target": path.join("/root", katacodaFolder, fromDirectory.substr(source.length, fromDirectory.length - 1)).replace(/\\/g, "/")
                });
            }
        });
    }
}