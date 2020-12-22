import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";
import { Playbook } from "../../engine/playbook";
import { ConsolePlatform } from "./consoleInterfaces";
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";

export class Console extends Runner {

    private platform: ConsolePlatform;

    init(playbook: Playbook): void {
        if(process.platform=="win32") {
            this.platform = ConsolePlatform.WINDOWS;
        } else {
            this.platform = ConsolePlatform.LINUX;
        }
    }

    runInstallDevonfwIde(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let settingsDir = this.createFolder(path.join(this.getWorkingDirectory(), "devonfw-settings"), true);
        this.executeCommandSync("git clone https://github.com/devonfw/ide-settings.git settings", settingsDir, result);
        
        let tools = "DEVON_IDE_TOOLS=(" + command.parameters[0].join(" ") + ")";
        fs.writeFileSync(path.join(settingsDir, "settings", "devon.properties"), tools);
        fs.renameSync(path.join(settingsDir, "settings"), path.join(settingsDir, "settings.git"));
        this.executeCommandSync("git add -A && git config user.email \"devonfw\" && git config user.name \"devonfw\" && git commit -m \"devonfw\"", path.join(settingsDir, "settings.git"), result);
        
        let installDir = path.join(this.getWorkingDirectory(), "devonfw");
        this.createFolder(installDir, true);

        let downloadUrl = "https://bit.ly/2BCkFa9";
        if(command.parameters.length > 1 && command.parameters[1] != "") {
            downloadUrl = "https://repository.sonatype.org/service/local/artifact/maven/redirect?r=central-proxy&g=com.devonfw.tools.ide&a=devonfw-ide-scripts&p=tar.gz&v=" + command.parameters[1];
        }
        if(this.platform == ConsolePlatform.WINDOWS) {
            this.executeCommandSync("powershell.exe \"Invoke-WebRequest -OutFile devonfw.tar.gz '" + downloadUrl + "'\"", installDir, result);
            this.executeCommandSync("powershell.exe tar -xvzf devonfw.tar.gz", installDir, result);
            this.executeCommandSync("powershell.exe ./setup " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, "yes");
        } else {
            this.executeCommandSync("wget -c \"" + downloadUrl + "\" -O - | tar -xz", installDir, result);
            this.executeCommandSync("bash setup " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, "yes");
        }

        return result;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        this.executeDevonCommandSync("cobigen", path.join(this.getWorkingDirectory(), "devonfw"), result);
        return result;
    }

    runCreateDevon4jProject(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        let projectName = command.parameters[0];
        this.executeDevonCommandSync("java create com.example.application." + projectName, workspaceDir, result);

        return result;
    }

    runCreateFile(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        let filepath = path.join(workspaceDir, command.parameters[0]);
        if(!fs.existsSync(filepath.substr(0, filepath.lastIndexOf(path.sep)))) {
            fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf(path.sep)), { recursive: true });
        }

        let content = "";
        if(command.parameters.length == 2) {
            content = fs.readFileSync(path.join(this.playbookPath, command.parameters[1]), { encoding: "utf-8" });
        }
        fs.writeFileSync(filepath, content);
      
        return result;
    }
    

    runBuildJava(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]);
        if(command.parameters.length == 2 && command.parameters[1] == true){
            this.executeDevonCommandSync("mvn clean install", projectDir, result);
        } else {
            this.executeDevonCommandSync("mvn clean install -Dmaven.test.skip=true", projectDir, result);
        }

        return result;
    }

    runCobiGenJava(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        this.executeDevonCommandSync("cobigen generate " + command.parameters[0], workspaceDir, result, command.parameters[1].toString());

        return result;
    }

    runChangeFile(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        let filepath = path.join(workspaceDir, command.parameters[0]);

        if(command.parameters[1].placeholder) {
            let content = fs.readFileSync(filepath, { encoding: "utf-8" });
            let placeholder = command.parameters[1].placeholder;
            if(command.parameters[1].content) {
                content = content.replace(placeholder, command.parameters[1].content);
            } else if (command.parameters[1].file) {
                let contentFile = fs.readFileSync(path.join(this.playbookPath, command.parameters[1].file), { encoding: "utf-8" });
                content = content.replace(placeholder, contentFile);
            }
            fs.writeFileSync(filepath, content);
        } else {
            if(command.parameters[1].content) {
                fs.writeFileSync(filepath, command.parameters[1].content);
            } else {
                fs.writeFileSync(filepath, fs.readFileSync(path.join(this.playbookPath, command.parameters[1].file), { encoding: "utf-8" }));
            }
        }

        return result;
    }

    runCloneRepository(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        let directorypath = path.join(workspaceDir, command.parameters[0]);
        
        this.createFolder(directorypath, false);
        this.executeCommandSync("git clone" + command.parameters[1], directorypath, result);

        return result;
    }

    async assertInstallDevonfwIde(step: Step, command: Command, result: RunResult) {
        let installedTools = command.parameters[0];

        let assert = new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software"))
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));

        for(let i = 0; i < installedTools.length; i++) {
            if(installedTools[i] == "mvn") installedTools[i] = "maven";
            assert.directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", installedTools[i]));
        }
    }

    async assertInstallCobiGen(step: Step, command: Command, result: RunResult) {
        let assert = new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen.jar"))
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen"));
    }

    async assertBuildJava(step: Step, command: Command, result: RunResult) {
        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");

        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(workspaceDir, command.parameters[0], "api", "target"))
        .directoryExits(path.join(workspaceDir, command.parameters[0], "core", "target"))
        .directoryExits(path.join(workspaceDir, command.parameters[0], "server", "target"));
    }

    async assertCobiGenJava(step: Step, command: Command, result: RunResult) {
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]));
    }

    async assertCreateDevon4jProject(step: Step, command: Command, result: RunResult) {
        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");

        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(workspaceDir, command.parameters[0]))
        .directoryExits(path.join(workspaceDir, command.parameters[0], "api", "src", "main", "java"))
        .directoryExits(path.join(workspaceDir, command.parameters[0], "core", "src", "main", "java"))
        .directoryExits(path.join(workspaceDir, command.parameters[0], "server", "src", "main", "java"))
        .fileExits(path.join(workspaceDir, command.parameters[0], "core", "src", "main", "java", "com", "example", "application", command.parameters[0], "SpringBootApp.java"));
    }

    async assertCreateFile(step: Step, command: Command, result: RunResult) {
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]));
    }

    async assertChangeFile(step: Step, command: Command, result: RunResult) {
        
        let content = "";
        if(command.parameters[1].content) {
            content = command.parameters[1].content;
        } else if (command.parameters[1].file) {
            content = fs.readFileSync(path.join(this.playbookPath, command.parameters[1].file), { encoding: "utf-8" });
        }

        let filepath = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]);
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .fileExits(filepath)
        .fileContains(filepath, content);
    }

    async assertCloneRepository(step: Step, command: Command, result: RunResult) {
        let repository = command.parameters[1]
        let repoName = repository.substr(repository.lastIndexOf("/"),repository.lastIndexOf("."));
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0], repoName));
    }

    private executeCommandSync(command: string, directory: string, result: RunResult, input?: string) {
        if(result.returnCode != 0) return;

        let process = child_process.spawnSync(command, { shell: true, cwd: directory, input: input, maxBuffer: Infinity });
        if(process.status != 0) {
            console.log("Error executing command: " + command + " (exit code: " + process.status + ")");
            console.log(process.stderr.toString(), process.stdout.toString());
            result.returnCode = process.status;
        }
    }

    private executeDevonCommandSync(devonCommand: string, directory: string, result: RunResult, input?: string) {
        if(this.platform == ConsolePlatform.WINDOWS) {
            let scriptsDir = path.join(this.getWorkingDirectory(), "devonfw", "scripts");
            this.executeCommandSync(scriptsDir + "\\devon " + devonCommand, directory, result, input);
        } else {
            this.executeCommandSync("~/.devon/devon " + devonCommand, directory, result, input);
        }
    }
}