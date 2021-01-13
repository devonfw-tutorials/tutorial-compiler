import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";
import { Playbook } from "../../engine/playbook";
import { ConsolePlatform, AsyncProcess } from "./consoleInterfaces";
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";
import * as psList from "ps-list";
const findProcess = require("find-process");

export class Console extends Runner {

    private platform: ConsolePlatform;
    private asyncProcesses: AsyncProcess[] = [];

    init(playbook: Playbook): void {
        if(process.platform=="win32") {
            this.platform = ConsolePlatform.WINDOWS;
        } else {
            this.platform = ConsolePlatform.LINUX;
        }
    }

    destroy(playbook: Playbook): void {
        this.killAsyncProcesses();
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


    runRestoreDevonfwIde(step: Step, command: Command): RunResult {
        return this.runInstallDevonfwIde(step, command);
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


    runBuildNg(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let projectPath = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]);

        this.executeDevonCommandSync("npm install", projectPath, result); // needed until npm integrated
        // if(command.parameters.length == 2 && command.parameters[1].trim()) {
        //     this.executeDevonCommandSync("ng build --output-path " + command.parameters[1], projectPath, result);
        // } else {
        //     this.executeDevonCommandSync("ng build", projectPath, result);
        // }
        var outputdirectory;
        if(command.parameters.length == 2  && command.parameters[1]) {
            outputdirectory = this.createFolder(path.join(projectPath, command.parameters[1].trim()), true);
            this.executeDevonCommandSync("ng build --output-path " + outputdirectory, projectPath, result);
        } else {
            let content = fs.readFileSync(path.join(projectPath, "angular.json"), { encoding: "utf-8" });
            let outputpath = this.lookup(JSON.parse(content), "outputPath")[1];
            if(outputpath == null) {
                outputpath = "dist";
            }
            outputdirectory = this.createFolder(path.join(projectPath, outputpath),true);
            this.executeDevonCommandSync("ng build --progress", projectPath, result);
            console.log("projectpath subdirectories: " + fs.readdirSync(projectPath));
            console.log("outputdirectory subdirectories: " + fs.readdirSync(outputdirectory));
        }

        return result;
    }
        

    runRunServerJava(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let serverDir = path.join(this.getWorkingDirectory(), command.parameters[0]);
        let process = this.executeDevonCommandAsync("mvn spring-boot:run", serverDir, result);
        if(process.pid) {
            this.asyncProcesses.push({ pid: process.pid, name: "java", port: command.parameters[1].port });
        }

        return result;
    }

    runCloneRepository(step: Step, command: Command): RunResult {
        let result = new RunResult();
        result.returnCode = 0;

        let directorypath = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]);
        
        this.createFolder(directorypath, true);
        this.executeCommandSync("git clone " + command.parameters[1], directorypath, result);

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
            if(installedTools[i] == "ng") {
                installedTools[i] = path.join("node");
            } 
            assert.directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "software", installedTools[i]));
        }
    }

    async assertRestoreDevonfwIde(step: Step, command: Command, result: RunResult) {
       this.assertInstallDevonfwIde(step, command, result);
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


    async assertBuildNg(step: Step, command: Command, result: RunResult) {
        let projectPath = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0]);
        var outputpath;
        if(command.parameters.length == 2) {
            outputpath = command.parameters[1].trim();
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
    }
  
    async assertRunServerJava(step: Step, command: Command, result: RunResult) {
        let assert = new Assertions()
        .noErrorCode(result)
        .noException(result);

        if(command.parameters.length > 1) {
            if(!command.parameters[1].startupTime) {
                console.warn("No startup time for command runServerJava has been set")
            }
            let startupTimeInSeconds = command.parameters[1].startupTime ? command.parameters[1].startupTime : 0;
            await this.sleep(command.parameters[1].startupTime);

            if(!command.parameters[1].port || !command.parameters[1].path) {
                this.killAsyncProcesses();
                throw new Error("Missing arguments for command runServerJava. You have to specify a port and a path for the server. For further information read the function documentation.");
            } else {
                let isReachable = await assert.serverIsReachable(command.parameters[1].port, command.parameters[1].path);
                if(!isReachable) {
                    this.killAsyncProcesses();
                    throw new Error("The server has not become reachable in " + startupTimeInSeconds + " seconds: " + "http://localhost:" + command.parameters[1].port + "/" + command.parameters[1].path)
                }
            }
        }
    }

    async assertCloneRepository(step: Step, command: Command, result: RunResult) {
        let repository = command.parameters[1];
        let repoName = repository.slice(repository.lastIndexOf("/"), -4);
        let directorypath = path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0], repoName);
        
        new Assertions()
        .noErrorCode(result)
        .noException(result)
        .directoryExits(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0], repoName))
        .directoryNotEmpty(path.join(this.getWorkingDirectory(), "devonfw", "workspaces", "main", command.parameters[0], repoName))
        .repositoryIsClean(directorypath);
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

    private executeCommandAsync(command: string, directory: string, result: RunResult, input?: string): child_process.ChildProcess {
        if(result.returnCode != 0) return;

        let process = child_process.spawn(command, [], { shell: true, cwd: directory });
        if(!process.pid) {
            result.returnCode = 1;
        }
        return process;
    }

    private executeDevonCommandAsync(devonCommand: string, directory: string, result: RunResult, input?: string): child_process.ChildProcess {
        if(this.platform == ConsolePlatform.WINDOWS) {
            let scriptsDir = path.join(this.getWorkingDirectory(), "devonfw", "scripts");
            return this.executeCommandAsync(scriptsDir + "\\devon " + devonCommand, directory, result, input);
        } else {
            return this.executeCommandAsync("~/.devon/devon " + devonCommand, directory, result, input);
        }
    }

    private sleep(seconds: number) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    private killAsyncProcesses() {
        if(this.asyncProcesses.length > 0) {
            psList().then(processes => {
                // Get all processes and check if they are child orprocesses of the processes that should be terminated. If so, kill them first.
                let killProcessesRecursively = function(processes, processIdToKill) {
                    let childProcesses = processes.filter(process => {
                        return process.ppid == processIdToKill;
                    });

                    if(childProcesses.length > 0) {
                        childProcesses.forEach(childProcess => {
                            killProcessesRecursively(processes, childProcess.pid)
                        });
                    }

                    process.kill(processIdToKill);
                }

                this.asyncProcesses.forEach(asyncProcess => {
                    killProcessesRecursively(processes, asyncProcess.pid);
                });
            }).then(() => {
                //Check if there are still running processes on the given ports
                this.asyncProcesses.forEach(asyncProcess => {
                    findProcess("port", asyncProcess.port).then((processes) => {
                        if(processes.length > 0) {
                            processes.forEach(proc => {
                                if(proc.name == asyncProcess.name || proc.name == asyncProcess.name + ".exe") {
                                    process.kill(proc.pid);
                                }
                            });
                        }
                    })
                });
            })
        }
    }
    

}