import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { readdirSync } from "fs";
import { KatacodaTools } from "./katacodaTools";
import { KatacodaAsset } from "./katacodaAsset";
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

export class Katacoda extends Runner {

    private outputPathTutorial: string;
    private tempPath: string;
    private tempPathTutorial: string;
    private stepsCount = 1;
    private steps: object[] = [];
    private assets: object[] = [];                  // used for index.json generation
    private katacodaAssets: KatacodaAsset[] = [];   // used for copying the assets from temp in assets folder
    private setupScripts: object[] = [];            // scripts which are executed at the beginning of the tutorial
    private setupDir: string;

    init(playbook: Playbook): void {
        // create directory for katacoda tutorials if not exist
        this.createFolder(path.join(this.getOutputDirectory(), "katacoda/"), false)

        // delete and rebuild directory for tutorial
        this.outputPathTutorial = path.join(this.getOutputDirectory(), "katacoda/", playbook.name);
        this.createFolder(this.outputPathTutorial, true);

        // if general temp directory does not exist create it
        this.tempPath = path.join(this.getTempDirectory(), "katacoda/");
        this.createFolder(this.tempPath, false);

        // delete and rebuild temp directory for this tutorial
        this.tempPathTutorial = path.join(this.tempPath, playbook.name);
        this.createFolder(this.tempPathTutorial, true);

        // create folder for setup scripts inside the temp directory
        this.setupDir = path.join(this.tempPathTutorial, "setup");
        this.createFolder(this.setupDir, false);
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', playbook.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // create assets folder for the tutorial
        this.createFolder(path.join(this.outputPathTutorial, "assets", "setup"), true);

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
        for(let i = 0; i < this.katacodaAssets.length; i++) {
            this.copyAssets(this.katacodaAssets[i].sourcePath, (this.outputPathTutorial + "assets"), this.katacodaAssets[i]);
        }

        // write index file, required for katacoda to load the tutorial
        let indexJsonObject = KatacodaTools.generateIndexJson(this.getPlaybookTitle(), ((this.stepsCount - 1) * 5), this.steps, this.assets);
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ").replace(/vscode/,"").replace(/eclipse/, "").trim();

        // create script to download devonfw ide settings
        this.renderTemplate(path.join("scripts", "cloneDevonfwIdeSettings.sh"), path.join(this.setupDir, "cloneDevonfwIdeSettings.sh"), { tools: params, cloneDir: "/root/devonfw-settings/"});
        this.katacodaAssets.push({
            sourcePath: this.tempPathTutorial,
            targetPath: ""
        });

        // add the script to the setup scripts for executing it at the beginning of the tutorial
        this.setupScripts.push({
            "name": "Clone devonfw IDE settings",
            "script": "cloneDevonfwIdeSettings.sh"
        });

        this.steps.push({
            "title": "Install devonfw IDE",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("installDevonfwIde.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter });
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

    private copyAssets(fromDirectory: string, toDirectory: string, asset: KatacodaAsset) {
        let dir = readdirSync(fromDirectory);
        dir.forEach(file => {
            if(fs.lstatSync(path.join(fromDirectory, file)).isDirectory()) {
                this.copyAssets(path.join(fromDirectory, file), toDirectory, asset);
            } else {
                this.createFolder(path.join(toDirectory, fromDirectory.substr(asset.sourcePath.length, fromDirectory.length - 1)), false);
                
                fs.copyFileSync(path.join(fromDirectory, file), path.join(toDirectory, fromDirectory.substr(asset.sourcePath.length, fromDirectory.length - 1), file));
                this.assets.push({
                    "file": path.join(fromDirectory.substr(asset.sourcePath.length, fromDirectory.length - 1), file).replace(/\\/g, "/"),
                    "target": path.join("/root", asset.targetPath, fromDirectory.substr(asset.sourcePath.length, fromDirectory.length - 1)).replace(/\\/g, "/")
                });
            }
        });
    }
}