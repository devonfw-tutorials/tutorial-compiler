import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Playbook } from "../../engine/playbook";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { KatacodaTools } from "./katacodaTools";
import { KatacodaStep, KatacodaSetupScript, KatacodaTerminals } from "./katacodaInterfaces";
import { KatacodaAssetManager } from "./katacodaAssetManager";
import { DirUtils } from "./dirUtils";
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';

export class Katacoda extends Runner {

    private outputPathTutorial: string;
    private tempPath: string;
    private tempPathTutorial: string;
    private stepsCount = 1;
    private steps: KatacodaStep[] = [];
    private setupScripts: KatacodaSetupScript[] = [];
    private assetManager: KatacodaAssetManager;
    private setupDir: string;
    private currentDir: string = path.join("/root");
    private terminalCounter: number = 1;
    private terminals: KatacodaTerminals[] = [{function: "default", terminalId: 1}];
 
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

        //set working direktory
        this.setVariable(this.workspaceDirectory, path.join("/root"));

        this.assetManager = new KatacodaAssetManager(path.join(this.outputPathTutorial, "assets"));
    }

    destroy(playbook: Playbook): void {
        fs.writeFileSync(this.outputPathTutorial + 'intro.md', playbook.description);
        fs.writeFileSync(this.outputPathTutorial + 'finish.md', "");

        // create and configure required files for the setup process
        this.renderTemplate(path.join("scripts", "intro_foreground.sh"), path.join(this.outputPathTutorial, "intro_foreground.sh"), { });
        this.renderTemplate(path.join("scripts", "intro_background.sh"), path.join(this.outputPathTutorial, "intro_background.sh"), { });
        this.renderTemplate(path.join("scripts", "setup.sh"), path.join(this.tempPathTutorial, "setup", "setup.sh"), {});
        
        this.createFolder(path.join(this.outputPathTutorial, "assets", "setup"), true);
        this.writeSetupFile(path.join(this.outputPathTutorial, "assets", "setup", "setup.txt"))

        // copy all assets from temp/setup in assets folder
        this.assetManager.registerDirectory(path.join(this.tempPathTutorial, "setup"), "setup", "/root/setup", true);
        this.assetManager.copyAssets();

        // write index file, required for katacoda to load the tutorial
        let indexJsonObject = KatacodaTools.generateIndexJson(playbook.title, ((this.stepsCount - 1) * 5), this.steps, this.assetManager.getKatacodaAssets());
        fs.writeFileSync(this.outputPathTutorial + 'index.json', JSON.stringify(indexJsonObject, null, 2));
    }

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let cdCommand = this.changeCurrentDir(path.join("/root"));     
        let tools = command.parameters[0].join(" ").replace(/vscode/,"").replace(/eclipse/, "").trim();

        // create script to download devonfw ide settings
        this.renderTemplate(path.join("scripts", "cloneDevonfwIdeSettings.sh"), path.join(this.setupDir, "cloneDevonfwIdeSettings.sh"), { tools: tools, cloneDir: "/root/devonfw-settings/"});

        // add the script to the setup scripts for executing it at the beginning of the tutorial
        this.setupScripts.push({
            "name": "Clone devonfw IDE settings",
            "script": "cloneDevonfwIdeSettings.sh"
        });

        this.steps.push({
            "title": "Install devonfw IDE",
            "text": "step" + this.stepsCount + ".md",
        });
        this.renderTemplate("installDevonfwIde.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand});
        
        //update current and working directory
        this.currentDir = path.join(this.currentDir, "devonfw");
        this.setVariable(this.workspaceDirectory, path.join("/root", "devonfw", "workspaces", "main"));
        this.setVariable(this.useDevonCommand, true);

        fs.appendFileSync(path.join(this.getRunnerDirectory(),"templates","scripts", "intro_foreground.sh"), "\nexport NG_CLI_ANALYTICS=CI");
        fs.appendFileSync(path.join(this.getRunnerDirectory(),"templates","scripts", "intro_background.sh"), "\necho \'export NG_CLI_ANALYTICS=CI\' >> /root/.profile\n");

        return null;
    }

    runRestoreDevonfwIde(step: Step, command: Command): RunResult {
        let tools = command.parameters[0].join(" ").replace(/vscode/,"").replace(/eclipse/, "").trim();

        // create script to download devonfw ide settings.
        this.renderTemplate(path.join("scripts", "cloneDevonfwIdeSettings.sh"), path.join(this.setupDir, "cloneDevonfwIdeSettings.sh"), { tools: tools, cloneDir: "/root/devonfw-settings/"});
        this.renderTemplate(path.join("scripts", "restoreDevonfwIde.sh"), path.join(this.setupDir, "restoreDevonfwIde.sh"), {});

        // add the script to the setup scripts for executing it at the beginning of the tutorial
        this.setupScripts.push({
            "name": "Clone devonfw IDE settings",
            "script": "cloneDevonfwIdeSettings.sh"
        });
        this.setupScripts.push({
            "name": "Restore Devonfw IDE",
            "script": "restoreDevonfwIde.sh"
        });

        //update working directory
        this.setVariable(this.workspaceDirectory, path.join("/root", "devonfw", "workspaces", "main"));
        this.setVariable(this.useDevonCommand, true);

        fs.appendFileSync(path.join(this.getRunnerDirectory(),"templates","scripts", "intro_foreground.sh"), "\n. ~/.bashrc\nexport NG_CLI_ANALYTICS=CI");
        fs.appendFileSync(path.join(this.getRunnerDirectory(),"templates","scripts", "intro_background.sh"), "\necho \'export NG_CLI_ANALYTICS=CI\' >> /root/.profile\n");

        return null;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        this.steps.push({
            "title": "Install CobiGen",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("installCobiGen.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter});
        return null;
    }

    runCobiGenJava(step: Step, command: Command): RunResult {
        let params = command.parameters;
        let cobiGenTemplates = params[1].join(",");

        this.renderTemplate(path.join("scripts", "installCobiGenPlugin.sh"), path.join(this.setupDir, "installCobiGenPlugin.sh"), { });
        this.setupScripts.push({
            "name": "Install CobiGen plugin",
            "script": "installCobiGenPlugin.sh"
        });

        this.steps.push({
            "title": "CobiGen Java",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("cobiGenJava.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, javaFile: params[0], cobiGenTemplates: cobiGenTemplates });
        return null;

    }

    runCreateDevon4jProject(step: Step, command:Command): RunResult {

        // generate template to change directory, if the current directory is not equal to the required start directory
       let cdCommand = this.changeCurrentDir(path.join("/root", "devonfw", "workspaces", "main"));

       this.steps.push({
           "title": "Create a new project",
           "text": "step" + this.stepsCount + ".md"
       });

       this.renderTemplate("createDevon4jProject.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, name : command.parameters[0]});
       return null;  
    }

    runCreateFile(step: Step, command: Command): RunResult{
        let workspaceDir = path.join(this.getVariable(this.workspaceDirectory).concat(path.sep).replace(path.sep + "root" + path.sep, ""));
        let filePath = path.join(this.getVariable(this.workspaceDirectory), path.dirname(command.parameters[0])).replace(/\\/g, "/");
        let fileDir = path.join(workspaceDir, command.parameters[0]).replace(/\\/g, "/");
        let fileName = path.basename(path.join(command.parameters[0]));
        let content = "";
        if(command.parameters.length == 2) {
            content = fs.readFileSync(path.join(this.playbookPath, command.parameters[1]), { encoding: "utf-8" });
        }

        this.steps.push({
            "title": "Create a new file",
            "text": "step" + this.stepsCount + ".md"
        });
        
        this.renderTemplate("createFile.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, filePath: filePath, fileDir: fileDir , fileName:fileName , content: content});
        return null;
    }

    runChangeFile(step: Step, command: Command): RunResult{
        let workspaceDir = path.join(this.getVariable(this.workspaceDirectory).concat(path.sep).replace(path.sep + "root" + path.sep, ""));
        let fileName = path.basename(path.join(command.parameters[0]));
        let fileDir = path.join(workspaceDir, command.parameters[0]).replace(/\\/g, "/");
        let placeholder = command.parameters[1].placeholder ? command.parameters[1].placeholder : "";
        let dataTarget = command.parameters[1].placeholder ? "insert" : "replace";

        let content = "";
        if(command.parameters[1].content || command.parameters[1].contentKatacoda){
            content = (command.parameters[1].contentKatacoda) ? command.parameters[1].contentKatacoda : command.parameters[1].content;
        }else if(command.parameters[1].file || command.parameters[1].fileKatacoda){
            let file = (command.parameters[1].fileKatacoda) ? command.parameters[1].fileKatacoda : command.parameters[1].file;
            content = fs.readFileSync(path.join(this.playbookPath, file), { encoding: "utf-8" });
        }

        this.steps.push({
            "title": "Change " + fileName,
            "text": "step" + this.stepsCount + ".md"
        });
        
        this.renderTemplate("changeFile.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, fileDir: fileDir, content: content, placeholder: placeholder, dataTarget: dataTarget });
        return null;
    }

    runBuildJava(step: Step, command: Command): RunResult{
        
        let cdCommand = this.changeCurrentDir(path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]));
        let skipTest = (command.parameters.length == 2 && command.parameters[1] == true) ? false : true;
    
        this.steps.push({
            "title": "Build the java project",
            "text": "step" + this.stepsCount + ".md"
        });
        
        this.renderTemplate("buildJava.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, skipTest: skipTest, useDevonCommand: this.getVariable(this.useDevonCommand)});
        return null;

    }


    runBuildNg(step: Step, command: Command): RunResult {
        let cdCommand = this.changeCurrentDir(path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]));

        this.steps.push({
            "title": "Build the Angular Project",
            "text": "step" + this.stepsCount + ".md"
        });

        this.renderTemplate("buildNg.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, outputDir: command.parameters[1], useDevonCommand: this.getVariable(this.useDevonCommand) });

        return null;
    }
  
    runCloneRepository(step: Step, command: Command): RunResult {

        let cdCommand = this.changeCurrentDir(path.join(this.getVariable(this.workspaceDirectory)));
        let directoryPath = "";
        if(command.parameters[0].trim()) {
            directoryPath = path.join(command.parameters[0]).replace(/\\/g, "/");
            this.currentDir = path.join(this.currentDir, directoryPath);
        }
        

        this.steps.push({
            "title": "Clones Repository " + command.parameters[1],
            "text": "step" + this.stepsCount + ".md"
        });

        this.renderTemplate("cloneRepository.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, directoryPath: directoryPath, repository: command.parameters[1] });
        return null;
    }

    runRunServerJava(step: Step, command: Command): RunResult{
        let serverDir = path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]);
        let terminal = this.getTerminal('runServerJava');
        let cdCommand = this.changeCurrentDir(serverDir, terminal.terminalId, terminal.isRunning);
        this.steps.push({
            "title": "Start the java server",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("runServerJava.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, terminalId: terminal.terminalId, interrupt: terminal.isRunning, useDevonCommand: this.getVariable(this.useDevonCommand)});
        return null;
    }

    runNpmInstall(step: Step, command: Command): RunResult {
        let cdCommand = this.changeCurrentDir(path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]));
        
        this.steps.push({
            "title": "Install the dependencies",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("npmInstall.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, useDevonCommand: this.getVariable(this.useDevonCommand)});
        return null;
    }

    runRunClientNg(step: Step, command: Command): RunResult {
        let serverDir = path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]);
        let terminal = this.getTerminal('runClientNg');
        let cdCommand = this.changeCurrentDir(serverDir, terminal.terminalId, terminal.isRunning);

        this.steps.push({
            "title": "Start the Angular Project",
            "text": "step" + this.stepsCount + ".md"
        });

        fs.appendFileSync(path.join(this.getRunnerDirectory(),"templates","scripts", "intro_background.sh"), "\necho \'export NODE_OPTIONS=\"--max-old-space-size=16384\"\' >> /root/.profile\n");

        this.renderTemplate("runClientNg.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, terminalId: terminal.terminalId, interrupt: terminal.isRunning, useDevonCommand: this.getVariable(this.useDevonCommand)});
        return null;
    }

    runCreateFolder(step: Step, command: Command): RunResult {
        let folderPath = new DirUtils().getCdParam(this.currentDir, path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]));
        
        this.steps.push({
            "title": "Create a new folder",
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("createFolder.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, folderPath: folderPath });
        return null;
    }

    runNextKatacodaStep(step: Step, command: Command): RunResult {
        let tempFile = path.join(this.getTempDirectory(), command.name + ".md");
        fs.writeFileSync(tempFile, "");
        for(let i = 0; i < command.parameters[1].length; i++) {
            let param = command.parameters[1][i];
            if(param.content) {
                fs.appendFileSync(tempFile, param.content);
            } else if(param.file) {
                fs.appendFileSync(tempFile, fs.readFileSync(path.join(this.playbookPath, param.file), "utf-8"));
            } else if (param.image) {
                let image = path.join(this.playbookPath, param.image);
                this.assetManager.registerFile(image, path.basename(image), "", true);
                fs.appendFileSync(tempFile, "![" + path.basename(image) + "](./assets/" + path.basename(image) + ")");
            }
            fs.appendFileSync(tempFile, "\n\n");
        }

        let content = fs.readFileSync(tempFile, "utf-8");
        this.steps.push({
            "title": command.parameters[0],
            "text": "step" + this.stepsCount + ".md"
        });
        this.renderTemplate("nextKatacodaStep.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, content: content });
        return null;
    }

    runDockerCompose(step: Step, command: Command) : RunResult {
        let terminal = this.getTerminal('runDockerCompose');
        let cdCommand = this.changeCurrentDir(path.join(this.getVariable(this.workspaceDirectory), command.parameters[0]), terminal.terminalId, terminal.isRunning);

        this.steps.push({
            "title": "Execute Docker Compose",
            "text": "step" +this.stepsCount + ".md"
        });

        this.renderTemplate("dockerCompose.md", this.outputPathTutorial + "step" + (this.stepsCount++) + ".md", { text: step.text, textAfter: step.textAfter, cdCommand: cdCommand, terminalId: terminal.terminalId, interrupt: terminal.isRunning, port: command.parameters[1].port});
        return null;
    }

    private renderTemplate(name: string, targetPath: string, variables) {
        let template = fs.readFileSync(path.join(this.getRunnerDirectory(),"templates", name), 'utf8');
        let result = ejs.render(template, variables);
        fs.writeFileSync(targetPath, result);
    }

    private writeSetupFile(setupFile: string) {
        fs.writeFileSync(setupFile, this.setupScripts.length + "\n\n");
        for(let i = 0; i < this.setupScripts.length; i++) {
            fs.appendFileSync(setupFile, this.setupScripts[i].name + "\n");
            fs.appendFileSync(setupFile, this.setupScripts[i].script + "\n");
            fs.appendFileSync(setupFile, "##########\n");
        }

        this.assetManager.registerFile(setupFile, "setup/setup.txt", "/root/setup", false);
    }

    private changeCurrentDir(targetDir:string, terminalId?: number, isRunning?: boolean):string{
        if(!terminalId && this.currentDir == targetDir || isRunning){
            return "";
        }
        let dirUtils = new DirUtils();
        let dir;
        let terminal;
        let terminalDescr;
        if(terminalId){
            dir = dirUtils.getCdParam(path.join("/root"), targetDir);
            terminal = "T" + terminalId;
            terminalDescr = "\n Now you have to open another terminal. Click on the cd command twice and you will change to " + dir + " in terminal " + terminalId + " automatically.\n Alternatively you can click on the + next to \`IDE\`, choose the option \`Open New Terminal\` and run the cd command afterwards. \n"; 
            
        }else{
            dir = dirUtils.getCdParam(this.currentDir, targetDir);
            terminal = "T1";
            terminalDescr = "Please change the folder to " + dir + ".";
            this.currentDir = targetDir;
        }

        //create template to change directory 
        let template = fs.readFileSync(path.join(this.getRunnerDirectory(),"templates", 'cd.md'), 'utf8');
        return ejs.render(template, {dir: dir, terminal: terminal, terminalDescr: terminalDescr}); 
    }

    private getTerminal(functionName: string): {terminalId:number, isRunning:boolean}{
        let terminal = this.terminals.find( terminal => terminal.function === functionName)
        if(terminal){
            return {terminalId: terminal.terminalId, isRunning: true};
        } 
        this.terminalCounter++;
        this.terminals.push({function: functionName, terminalId: this.terminalCounter});
        return {terminalId: this.terminalCounter, isRunning: false};
    }

}