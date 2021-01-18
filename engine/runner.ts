import { Command } from "./command";
import { RunResult } from "./run_result";
import { Playbook } from "./playbook";
import { Step } from "./step";
import * as fs from 'fs';
import * as rimraf from 'rimraf';

const nameof = <T>(name: Extract<keyof T, string>): string => name;

export abstract class Runner {
    public path: string;
    public name: string;
    public playbookName: string;
    public playbookPath: string;
    public playbookTitle: string;
    protected useDevonCommand: boolean = false; 

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

    supports(name: string): boolean {
        return !!this[this.getMethodName("run", name)];
    }

    private getMethodName(prefix: string, name: string): string {
        return prefix + name.charAt(0).toUpperCase() + name.slice(1);
    }

    init(playbook: Playbook): void {
    }

    run(step: Step, command: Command): RunResult {
        console.log("Run " + command.name, command.parameters);
        return this[this.getMethodName("run", command.name)](step, command);
    }

    async assert(step: Step, command: Command, runResult: RunResult): Promise<void> {
        if (this[this.getMethodName("assert", command.name)]) {
            await this[this.getMethodName("assert", command.name)](step, command, runResult);
        }
    }

    destroy(playbook: Playbook): void {
    }

    protected createFolder(path: string, deleteFolerIfExist: boolean) {
        if(fs.existsSync(path)) {
            if(deleteFolerIfExist) {
                rimraf.sync(path);
                fs.mkdirSync(path, { recursive: true });
            } else return
        }
        fs.mkdirSync(path, { recursive: true });
        return path;
    }
}