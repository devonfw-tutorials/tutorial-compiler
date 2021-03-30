import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { RunCommand } from "../../engine/run_command";
import { Assertions } from "../../assertions";
import { Playbook } from "../../engine/playbook";
import { ConsolePlatform, AsyncProcess } from "./consoleInterfaces";
import * as path from 'path';
import * as fs from "fs";
import * as psList from "ps-list";
import { ConsoleUtils } from "./consoleUtils";
const findProcess = require("find-process");
const os = require("os");

export class Console extends Runner {

    private platform: ConsolePlatform;
    private asyncProcesses: AsyncProcess[] = [];
    private mapIdeTools: Map<String, String> = new Map();
    private env: any;

    init(playbook: Playbook): void {
        if(process.platform=="win32") {
            this.platform = ConsolePlatform.WINDOWS;
        } else {
            this.platform = ConsolePlatform.LINUX;
        }

        this.mapIdeTools.set("mvn", "maven")
        .set("npm", "node")
        .set("ng", "node");

        ConsoleUtils.createBackupDevonDirectory();

        this.createFolder(path.normalize(this.getWorkingDirectory()), true);
        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory()));
        this.env = process.env;
    }

    async destroy(playbook: Playbook): Promise<void> {
        await this.cleanUp();
    }

    runInstallDevonfwIde(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(runCommand.command.parameters[0].indexOf("npm") > -1 || runCommand.command.parameters[0].indexOf("ng")) {
            let nodeInstallDir = path.join(this.getWorkingDirectory(), "devonfw", "software", "node");
            this.env["npm_config_prefix"] = nodeInstallDir;
            this.env["npm_config_cache"] = "";
        }

        if(this.platform == ConsolePlatform.WINDOWS) {
            let pathVariables = this.env["PATH"];
            pathVariables += ";" + path.join(os.homedir(), "scripts");
            this.env["PATH"] = pathVariables;
        }
       
        let settingsDir = this.createFolder(path.join(this.getWorkingDirectory(), "devonfw-settings"), true);
        ConsoleUtils.executeCommandSync("git clone https://github.com/devonfw/ide-settings.git settings", settingsDir, result, this.env);
        this.createFolder(path.join(settingsDir, "settings", "vscode", "plugins"), true)
        let tools = "DEVON_IDE_TOOLS=(" + runCommand.command.parameters[0].join(" ") + ")";
        fs.writeFileSync(path.join(settingsDir, "settings", "devon.properties"), tools);
        fs.appendFileSync(path.join(settingsDir, "settings", "devon", "conf", "npm", ".npmrc"), "\nunsafe-perm=true");
        fs.renameSync(path.join(settingsDir, "settings"), path.join(settingsDir, "settings.git"));
        ConsoleUtils.executeCommandSync("git add -A && git config user.email \"devonfw\" && git config user.name \"devonfw\" && git commit -m \"devonfw\"", path.join(settingsDir, "settings.git"), result, this.env);

        let installDir = path.join(this.getWorkingDirectory(), "devonfw");
        this.createFolder(installDir, true);

        let downloadUrl = "https://repository.sonatype.org/service/local/artifact/maven/redirect?r=central-proxy&g=com.devonfw.tools.ide&a=devonfw-ide-scripts&v=LATEST&p=tar.gz";
        if(runCommand.command.parameters.length > 1 && runCommand.command.parameters[1] != "") {
            downloadUrl = "https://repository.sonatype.org/service/local/artifact/maven/redirect?r=central-proxy&g=com.devonfw.tools.ide&a=devonfw-ide-scripts&p=tar.gz&v=" + runCommand.command.parameters[1];
        }
        if(this.platform == ConsolePlatform.WINDOWS) {
            ConsoleUtils.executeCommandSync("powershell.exe \"Invoke-WebRequest -OutFile devonfw.tar.gz '" + downloadUrl + "'\"", installDir, result, this.env);
            ConsoleUtils.executeCommandSync("powershell.exe tar -xvzf devonfw.tar.gz", installDir, result, this.env);
            ConsoleUtils.executeCommandSync("powershell.exe ./setup.bat " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, this.env, "yes");
        } else {
            ConsoleUtils.executeCommandSync("wget -c \"" + downloadUrl + "\" -O - | tar -xz", installDir, result, this.env);
            ConsoleUtils.executeCommandSync("bash setup " + path.join(settingsDir, "settings.git").replace(/\\/g, "/"), installDir, result, this.env, "yes");
        }

        this.setVariable(this.workspaceDirectory, path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));
        this.setVariable(this.useDevonCommand, true);

        return result;
    }


    runRestoreDevonfwIde(runCommand: RunCommand): RunResult {
        return this.runInstallDevonfwIde(runCommand);
    }

    runInstallCobiGen(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(!this.getVariable(this.useDevonCommand)){
            console.warn("Devonfw IDE is not installed"); 
        }

        ConsoleUtils.executeDevonCommandSync("cobigen", path.join(this.getWorkingDirectory(), "devonfw"), path.join(this.getWorkingDirectory(), "devonfw"), result, this.env);
        return result;
    }

    runCreateDevon4jProject(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(!this.getVariable(this.useDevonCommand)){
            console.warn("Devonfw IDE is not installed"); 
        }

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        let projectName = runCommand.command.parameters[0];
        ConsoleUtils.executeDevonCommandSync("java create com.example.application." + projectName, workspaceDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env);
        return result;
    }

    runCreateFile(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let filepath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        if(!fs.existsSync(filepath.substr(0, filepath.lastIndexOf(path.sep)))) {
            fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf(path.sep)), { recursive: true });
        }

        let content = "";
        if(runCommand.command.parameters.length == 2) {
            content = fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1]), { encoding: "utf-8" });
        }
        fs.writeFileSync(filepath, content);
      
        return result;
    }
    

    runBuildJava(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let buildCommand = (runCommand.command.parameters.length == 2 && runCommand.command.parameters[1] == true)
            ? "mvn clean install"
            : "mvn clean install -Dmaven.test.skip=true";

        this.getVariable(this.useDevonCommand)
            ? ConsoleUtils.executeDevonCommandSync(buildCommand, projectDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandSync(buildCommand, projectDir, result, this.env);

        return result;
    }

    runCobiGenJava(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(!this.getVariable(this.useDevonCommand)){
            console.warn("Devonfw IDE is not installed"); 
        }

        let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");
        ConsoleUtils.executeDevonCommandSync("cobigen generate " + runCommand.command.parameters[0], workspaceDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env, runCommand.command.parameters[1].toString());
        return result;
    }

    runChangeFile(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let filepath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);

        let content = fs.readFileSync(filepath, { encoding: "utf-8" });
        if(runCommand.command.parameters[1].placeholder) {
            let placeholder = runCommand.command.parameters[1].placeholder;
            if(runCommand.command.parameters[1].content || runCommand.command.parameters[1].contentConsole) {
                let contentReplace = runCommand.command.parameters[1].contentConsole ? runCommand.command.parameters[1].contentConsole : runCommand.command.parameters[1].content;
                content = content.replace(placeholder, contentReplace);
            } else if (runCommand.command.parameters[1].file || runCommand.command.parameters[1].fileConsole) {
                let file = runCommand.command.parameters[1].fileConsole ? runCommand.command.parameters[1].fileConsole : runCommand.command.parameters[1].file;
                let contentFile = fs.readFileSync(path.join(this.playbookPath, file), { encoding: "utf-8" });
                content = content.replace(placeholder, contentFile);
            }
        } else {
            if(runCommand.command.parameters[1].content || runCommand.command.parameters[1].contentConsole) {
                content = runCommand.command.parameters[1].contentConsole ? runCommand.command.parameters[1].contentConsole : runCommand.command.parameters[1].content;
            } else {
                let file = runCommand.command.parameters[1].fileConsole ? runCommand.command.parameters[1].fileConsole : runCommand.command.parameters[1].file;
                content = fs.readFileSync(path.join(this.playbookPath, file), { encoding: "utf-8" });
            }
        }
        fs.writeFileSync(filepath, content);

        return result;
    }        


    runDockerCompose(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;
        
        let filepath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);

        let process = ConsoleUtils.executeCommandAsync("docker-compose up", filepath, result, this.env);
        process.on('close', (code) => {
            if (code !== 0) {
                result.returnCode = code;
            }
          });
        if(process.pid && runCommand.command.parameters.length == 2) {
            this.asyncProcesses.push({ pid: process.pid, name: "dockerCompose", port: runCommand.command.parameters[1].port });
        }
        
        return result;
        
    }

    runRunServerJava(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let serverDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let process = (this.getVariable(this.useDevonCommand))
            ? ConsoleUtils.executeDevonCommandAsync("mvn spring-boot:run", serverDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandAsync("mvn spring-boot:run", serverDir, result, this.env);

        if(process.pid) {
            this.asyncProcesses.push({ pid: process.pid, name: "java", port: runCommand.command.parameters[1].port });
        }

        return result;
    }

    runCloneRepository(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let directorypath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        if(runCommand.command.parameters[0] != "") {
            this.createFolder(directorypath, true);
        }
        ConsoleUtils.executeCommandSync("git clone " + runCommand.command.parameters[1], directorypath, result, this.env);

        return result;
    }

    runNpmInstall(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let npmCommand = "npm install";
        if(runCommand.command.parameters.length > 1){
            if (runCommand.command.parameters[1].global) npmCommand += " -g";
            if (runCommand.command.parameters[1].args) npmCommand += " " + runCommand.command.parameters[1].args.join(" ");
            if (runCommand.command.parameters[1].name) npmCommand += " " + runCommand.command.parameters[1].name; 
        }
        this.getVariable(this.useDevonCommand)
            ? ConsoleUtils.executeDevonCommandSync(npmCommand, projectPath, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandSync(npmCommand, projectPath, result, this.env);

        return result;
    }

    runDownloadFile(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let downloadlDir = this.getVariable(this.workspaceDirectory);
        if (runCommand.command.parameters.length == 3) {
            downloadlDir = path.join(downloadlDir, runCommand.command.parameters[2]);
            this.createFolder(downloadlDir, false);
        }
        let command1 = (this.platform == ConsolePlatform.WINDOWS) 
            ? "powershell.exe \"Invoke-WebRequest -OutFile " +   runCommand.command.parameters[1] + " '" + runCommand.command.parameters[0] + "'\""
            : "wget -c " + runCommand.command.parameters[0] + " -O " + runCommand.command.parameters[1];
        
            ConsoleUtils.executeCommandSync(command1, downloadlDir, result, this.env);
        return result;
    }
        
    runRunClientNg(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let process = this.getVariable(this.useDevonCommand) 
            ? ConsoleUtils.executeDevonCommandAsync("ng serve", projectDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandAsync("ng serve", projectDir, result, this.env);
        if(process.pid) { 
            this.asyncProcesses.push({ pid: process.pid, name: "node", port: runCommand.command.parameters[1].port });
        }
        return result;
    }

    runBuildNg(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        let command1 = "ng build";
        if(runCommand.command.parameters.length == 2) {
            command1 = command1 + " --output-path " + runCommand.command.parameters[1];
        }
        this.getVariable(this.useDevonCommand) 
            ? ConsoleUtils.executeDevonCommandSync(command1, projectDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandSync(command1, projectDir, result, this.env);
        
        return result;
    }

    runCreateFolder(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let folderPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
        if(folderPath && !fs.existsSync(folderPath)) {
            this.createFolder(folderPath, true);
        }
        
        return result;
    }

    runNextKatacodaStep(runCommand: RunCommand): RunResult {
        //Only needed for katacoda runner
        return null;
    }

    runAdaptTemplatesCobiGen(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        if(!this.getVariable(this.useDevonCommand)){
            console.warn("Devonfw IDE is not installed"); 
        }
        ConsoleUtils.executeDevonCommandSync("cobigen adapt-templates",path.join(this.getWorkingDirectory(), "devonfw"), path.join(this.getWorkingDirectory(), "devonfw"), result, this.env);
        return result;
    }

    runCreateDevon4ngProject(runCommand: RunCommand): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[1]);
        let params = runCommand.command.parameters.length > 2 && (runCommand.command.parameters[2] instanceof Array) ? (" " + runCommand.command.parameters[2].join(" ")) : "";
        this.getVariable(this.useDevonCommand)
            ? ConsoleUtils.executeDevonCommandSync("ng create " + runCommand.command.parameters[0] + params, projectDir, path.join(this.getWorkingDirectory(), "devonfw"), result, this.env)
            : ConsoleUtils.executeCommandSync("ng new " + runCommand.command.parameters[0] + params, projectDir, result, this.env);

        return result;
    }

    async assertInstallDevonfwIde(runCommand: RunCommand, result: RunResult) {
        try {
            let installedTools = runCommand.command.parameters[0];

            let assert = new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software"))
            .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main"));

            for(let i = 0; i < installedTools.length; i++) {
                let tool = this.mapIdeTools.get(installedTools[i]) != undefined ? this.mapIdeTools.get(installedTools[i]) : installedTools[i];
                assert.directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", tool));
            }
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertRestoreDevonfwIde(runCommand: RunCommand, result: RunResult) {
       this.assertInstallDevonfwIde(runCommand, result);
    }

    async assertInstallCobiGen(runCommand: RunCommand, result: RunResult) {
        try {
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli"))
            .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen.jar"))
            .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "software", "cobigen-cli", "cobigen"));
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertBuildJava(runCommand: RunCommand, result: RunResult) {
        try {
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], "api", "target"))
            .directoryExits(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], "core", "target"))
            .directoryExits(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], "server", "target"));
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCobiGenJava(runCommand: RunCommand, result: RunResult) {
        try {
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .fileExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", runCommand.command.parameters[0]));
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCreateDevon4jProject(runCommand: RunCommand, result: RunResult) {
        try {
            let workspaceDir = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main");

            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(workspaceDir, runCommand.command.parameters[0]))
            .directoryExits(path.join(workspaceDir, runCommand.command.parameters[0], "api", "src", "main", "java"))
            .directoryExits(path.join(workspaceDir, runCommand.command.parameters[0], "core", "src", "main", "java"))
            .directoryExits(path.join(workspaceDir, runCommand.command.parameters[0], "server", "src", "main", "java"))
            .fileExits(path.join(workspaceDir, runCommand.command.parameters[0], "core", "src", "main", "java", "com", "example", "application", runCommand.command.parameters[0], "SpringBootApp.java"));
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCreateFile(runCommand: RunCommand, result: RunResult) {
        try {
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .fileExits(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]));
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertChangeFile(runCommand: RunCommand, result: RunResult) {
        try{
            let content = "";
            if(runCommand.command.parameters[1].content) {
                content = runCommand.command.parameters[1].content;
            } else if (runCommand.command.parameters[1].file) {
                content = fs.readFileSync(path.join(this.playbookPath, runCommand.command.parameters[1].file), { encoding: "utf-8" });
            }
    
            let filepath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .fileExits(filepath)
            .fileContains(filepath, content);
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertDockerCompose(runCommand: RunCommand, result: RunResult) {
        try {
            let assert = new Assertions()
            .noErrorCode(result)
            .noException(result);

            if(runCommand.command.parameters.length > 1) {
                if(!runCommand.command.parameters[1].startupTime) {
                    console.warn("No startup time for command dockerCompose has been set")
                }
                let startupTimeInSeconds = runCommand.command.parameters[1].startupTime ? runCommand.command.parameters[1].startupTime : 0;
                await this.sleep(runCommand.command.parameters[1].startupTime);

                if(!runCommand.command.parameters[1].port) {
                    await this.killAsyncProcesses();
                    throw new Error("Missing arguments for command dockerCompose. You have to specify a port and a path for the server. For further information read the function documentation.");
                } else {
                    let isReachable = await assert.serverIsReachable(runCommand.command.parameters[1].port, runCommand.command.parameters[1].path);
                    if(!isReachable) {
                        await this.killAsyncProcesses();
                        throw new Error("The server has not become reachable in " + startupTimeInSeconds + " seconds: " + "http://localhost:" + runCommand.command.parameters[1].port + "/" + runCommand.command.parameters[1].path);
                    }
                }
            }
         } catch(error) {
            await this.cleanUp();
            throw error;
        }  
    }

    async assertRunServerJava(runCommand: RunCommand, result: RunResult) {
        try {
            let assert = new Assertions()
            .noErrorCode(result)
            .noException(result);

            if(runCommand.command.parameters.length > 1) {
                if(!runCommand.command.parameters[1].startupTime) {
                    console.warn("No startup time for command runServerJava has been set")
                }
                let startupTimeInSeconds = runCommand.command.parameters[1].startupTime ? runCommand.command.parameters[1].startupTime : 0;
                await this.sleep(runCommand.command.parameters[1].startupTime);

                if(!runCommand.command.parameters[1].port || !runCommand.command.parameters[1].path) {
                    await this.killAsyncProcesses();
                    throw new Error("Missing arguments for command runServerJava. You have to specify a port and a path for the server. For further information read the function documentation.");
                } else {
                    let isReachable = await assert.serverIsReachable(runCommand.command.parameters[1].port, runCommand.command.parameters[1].path);
                    if(!isReachable) {
                        await this.killAsyncProcesses();
                        throw new Error("The server has not become reachable in " + startupTimeInSeconds + " seconds: " + "http://localhost:" + runCommand.command.parameters[1].port + "/" + runCommand.command.parameters[1].path)
                    }
                }
            }
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCloneRepository(runCommand: RunCommand, result: RunResult) {
        try {
            let repository = runCommand.command.parameters[1];
            let repoName = repository.slice(repository.lastIndexOf("/"), -4);
            let directorypath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], repoName);
            
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], repoName))
            .directoryNotEmpty(path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0], repoName))
            .repositoryIsClean(directorypath);
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertNpmInstall(runCommand: RunCommand, result: RunResult) {
        try {
            let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(projectDir)
            if(runCommand.command.parameters.length < 2 || !runCommand.command.parameters[1].global){
                new Assertions()
                .directoryExits(path.join(projectDir, "node_modules"))
                .directoryNotEmpty(path.join(projectDir, "node_modules"));
            }
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertDownloadFile(runCommand: RunCommand, result: RunResult){
        try {
            let directory = this.getVariable(this.workspaceDirectory);
            if(runCommand.command.parameters.length == 3) {
                directory = path.join(directory, runCommand.command.parameters[2]);
            }
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(directory)
            .directoryNotEmpty(directory)
            .fileExits(path.join(directory, runCommand.command.parameters[1]));
         } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertRunClientNg(runCommand: RunCommand, result: RunResult) {
        try {
            let assert = new Assertions()
            .noErrorCode(result)
            .noException(result);

            if(runCommand.command.parameters.length > 1) {
                if(!runCommand.command.parameters[1].startupTime) {
                    console.warn("No startup time for command runClientNg has been set")
                }
                let startupTimeInSeconds = runCommand.command.parameters[1].startupTime ? runCommand.command.parameters[1].startupTime : 0;
                await this.sleep(runCommand.command.parameters[1].startupTime);

                if(!runCommand.command.parameters[1].port) {
                    await this.killAsyncProcesses();
                    throw new Error("Missing arguments for command runClientNg. You have to specify a port for the server. For further information read the function documentation.");
                } else {
                    let isReachable = await assert.serverIsReachable(runCommand.command.parameters[1].port, runCommand.command.parameters[1].path);
                    if(!isReachable) {
                        await this.killAsyncProcesses();
                        throw new Error("The server has not become reachable in " + startupTimeInSeconds + " seconds: " + "http://localhost:" + runCommand.command.parameters[1].port + "/" + runCommand.command.parameters[1].path)
                    }
                }
            }
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertBuildNg(runCommand: RunCommand, result: RunResult) {
        try {
            let projectPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
            var outputpath;
            if(runCommand.command.parameters.length == 2) {
                outputpath = runCommand.command.parameters[1].trim();
            } else {
                let content = fs.readFileSync(path.join(projectPath, "angular.json"), { encoding: "utf-8" });
                outputpath = this.lookup(JSON.parse(content), "outputPath")[1];
                if(outputpath == null) {
                    outputpath = "dist";
                }
            }
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(path.join(projectPath, outputpath))
            .directoryNotEmpty(path.join(projectPath, outputpath));

        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCreateFolder(runCommand: RunCommand, result: RunResult){
        try {
            let folderPath = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[0]);
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(folderPath);
         } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertAdaptTemplatesCobiGen(runCommand: RunCommand, result: RunResult) {
        try {
            let templatesDir = path.join(os.homedir(), ".cobigen", "templates");
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(templatesDir)
            .directoryNotEmpty(templatesDir);

        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    async assertCreateDevon4ngProject(runCommand: RunCommand, result: RunResult) {
        try {
            let projectDir = path.join(this.getVariable(this.workspaceDirectory), runCommand.command.parameters[1], runCommand.command.parameters[0]);
            new Assertions()
            .noErrorCode(result)
            .noException(result)
            .directoryExits(projectDir)
            .directoryNotEmpty(projectDir);
        } catch(error) {
            await this.cleanUp();
            throw error;
        }
    }

    private lookup(obj, lookupkey) {
        for(var key in obj) {
            
            if(key == lookupkey) {
                return [lookupkey, obj[key]];
            }
            if(obj[key] instanceof Object) {
                var y = this.lookup(obj[key], lookupkey);
                if (y && y[0] == lookupkey) return y;
            }
        }
        return null;
    }

    private sleep(seconds: number) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    private async killAsyncProcesses(): Promise<void> {
        let killProcessesRecursively = function(processes: psList.ProcessDescriptor[], processIdToKill: number) {
            let childProcesses = processes.filter(process => {
                return process.ppid == processIdToKill;
            });

            if(childProcesses.length > 0) {
                for(let childProcess of childProcesses) {
                    killProcessesRecursively(processes, childProcess.pid)
                }
            }

            try {
                process.kill(processIdToKill);
            } catch(e) {
                console.error("Error killing id " + processIdToKill, e);
            }
        }

        if(this.asyncProcesses.length > 0) {
            let processes: psList.ProcessDescriptor[] = Array.from((await psList()).values());
            for(let asyncProcess of this.asyncProcesses) {
                killProcessesRecursively(processes, asyncProcess.pid);
            }
            
            //Check if there are still running processes on the given ports
            for(let asyncProcess of this.asyncProcesses) {
                let processes: any[] = await findProcess("port", asyncProcess.port);
                if(processes.length > 0) {
                    for(let proc of processes) {
                        if(proc.name == asyncProcess.name || proc.name == asyncProcess.name + ".exe") {
                            try {
                                process.kill(proc.pid);
                            } catch(e) {
                                console.error("Error killing id " + proc.pid, e);
                            }
                        }
                    }
                }
            }   
        }
    }

    private async cleanUp(): Promise<void> {
        await this.killAsyncProcesses();
        ConsoleUtils.restoreDevonDirectory();
    }
}
