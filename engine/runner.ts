import { RunResult } from "./run_result";
import { Playbook } from "./playbook";
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { RunCommand } from "./run_command";

export abstract class Runner {
    public path: string;
    public name: string;
    public playbookName: string;
    public playbookPath: string;
    public playbookTitle: string;
    public environmentName: string;
    protected readonly useDevonCommand: string = "useDevonCommand";
    protected readonly workspaceDirectory: string = "workspaceDirectory";

    private setVariableCallback: (name: string, value: any) => any;
    registerSetVariableCallback(callback: (name: string, value: any) => any) {
        this.setVariableCallback = callback;
    }
    protected setVariable(name: string, value: any) {
        this.setVariableCallback(name, value);
    }

    private getVariableCallback: (name: string) => any;
    registerGetVariableCallback(callback: (name: string) => any) {
        this.getVariableCallback = callback;
    }
    protected getVariable(name: string) {
        return this.getVariableCallback(name);
    }

    protected getRunnerDirectory(): string {
        return this.path;
    }

    protected getRunnerName(): string {
        return this.name;
    }

    protected getPlaybookName(): string {
        return this.playbookName;
    }

    protected getPlaybookPath(): string {
        return this.playbookPath;
    }

    protected getPlaybookTitle(): string {
        return this.playbookTitle;
    }

    protected getOutputDirectory(): string {
        let dir = (<string>this.getVariable("outputDir")) || __dirname + "/../output/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return dir;
    }

    protected getWorkingDirectory(): string {
        let dir = (<string>this.getVariable("workingDir")) || __dirname + "/../working/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return dir;
    }

    protected getTempDirectory(): string {
        let dir = (<string>this.getVariable("tempDir")) || __dirname + "/../temp/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return dir;
    }

    supports(name: string, parameters: any[]): boolean {
        return !!this[this.getMethodName("run", name)];
    }

    private getMethodName(prefix: string, name: string): string {
        return prefix + name.charAt(0).toUpperCase() + name.slice(1);
    }

    init(playbook: Playbook): void {
        this.setVariable(this.useDevonCommand, false);
    }

    run(runCommand: RunCommand): RunResult {
        console.log("Run " + runCommand.command.name, runCommand.command.parameters);
        return this[this.getMethodName("run", runCommand.command.name)](runCommand);
    }

    async assert(runCommand: RunCommand, runResult: RunResult): Promise<void> {
        if (this[this.getMethodName("assert", runCommand.command.name)]) {
            await this[this.getMethodName("assert", runCommand.command.name)](runCommand, runResult);
        }
    }

    destroy(playbook: Playbook): void {
    }

    protected createFolder(path: string, deleteFolerIfExist: boolean) {
        if(fs.existsSync(path)) {
            if(deleteFolerIfExist) {
                rimraf.sync(path);
                fs.mkdirSync(path, { recursive: true });
            } else return path;
        }
        fs.mkdirSync(path, { recursive: true });
        return path;
    }

    commandIsSkippable(command: String): Boolean {
        let returnVal = false; 
        let runner = this.getVariable("skipCommands." + this.getRunnerName());
        if(runner) {
            if((runner instanceof Array && runner.indexOf(command) != -1) || runner == command) {
                returnVal = true;
            }
        } 
        return returnVal;
    }
}