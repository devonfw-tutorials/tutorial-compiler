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

        // delete and rebuild scripts folder
        if (fs.existsSync(path.join(this.getTempDirectory(), "scripts/"))) {
            fs.rmdirSync(path.join(this.getTempDirectory(), "scripts/"), { recursive: true });
        }
        fs.mkdirSync(path.join(this.getTempDirectory(), "scripts/"));

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

        this.description = playbook.description;
        this.steps = [];
        this.assets = [];
        this.assetPathsToCopySource = [];
        this.assetPathsToCopyTarget = [];
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', this.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // copy all assets from temp in assets folder
        if (fs.existsSync(this.outputPathTutorial + "assets")) {
            fs.rmdirSync(this.outputPathTutorial + "assets", { recursive: true });
        }
        fs.mkdirSync(this.outputPathTutorial + "assets", { recursive: true });
        for(let i = 0; i < this.assetPathsToCopySource.length; i++) {
            this.copyAssets(this.assetPathsToCopySource[i], (this.outputPathTutorial + "assets"), this.assetPathsToCopySource[i], this.assetPathsToCopyTarget[i]);
        }

        // Write index file. Required for katacoda to load the tutorial.
        let indexJsonObject = KatacodaTools.generateIndexJson(this.getPlaybookTitle(), ((this.stepsCount - 1) * 5), this.steps, this.assets);
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonIde(step: Step, command: Command): RunResult {
        let params = command.parameters.replace(/\[/, "").replace("\]", "").replace(/,/, " ");

        // create and execute script to clone devon ide settings repo only if not already exist
        let settingsDir = path.join(this.tempPath, "devonIdeSettings_" + params.replace(" ", "_"));
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
            this.renderTemplate(path.join("scripts", "cloneDevonIdeSettings.sh"), path.join(this.getTempDirectory(), "scripts", "cloneDevonIdeSettings.sh"), { tools: params, tempdir: settingsDir.replace(/\\/g, "/")});
            execSync("bash " + this.getTempDirectory() + "/scripts/cloneDevonIdeSettings.sh");
        }
        this.assetPathsToCopySource.push(settingsDir);
        this.assetPathsToCopyTarget.push("devonfw-settings");

        // script to rename the git folder. Render direct in output of tutorial
        this.renderTemplate(path.join("scripts", "renameGitFolder.sh"), path.join(this.outputPathTutorial, "renameGitFolder.sh"), {});

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