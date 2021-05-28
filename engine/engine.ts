import { Environment } from "./environment";
import { Playbook } from "./playbook";
import { Runner } from "./runner";
import { RunCommand } from "./run_command";
import { RunResult } from "./run_result";
import { SyntaxErrorLogger } from "./syntax_error_logger";

export class Engine {

    private runners: Map<string, Runner> = new Map<string, Runner>();
    private variables: Map<string, any> = new Map<string, any>();

    constructor(private environmentName: string, private environment: Environment, private playbook: Playbook, private syntaxErrorLogger: SyntaxErrorLogger) { }

    async run() {
        for (let runnerIndex in this.environment.runners) {
            (await this.getRunner(this.environment.runners[runnerIndex])).init(this.playbook);
        }

        console.log("Environment: " + this.environmentName);
        if (! await this.isEnvironmentComplete()) {
            if (this.environment.failOnIncomplete) {
                throw "Environment incomplete: " + this.environmentName;
            } else if(!this.environment.skipMissingFunctions) {
                console.log("Environment incomplete: " + this.environmentName);
                return;
            } else {
                console.log("Environment incomplete: " + this.environmentName + " (ignored)");
           }
        }

        mainloop: for (let stepIndex = 0; stepIndex < this.playbook.steps.length; stepIndex++) {
            for (let lineIndex = 0; lineIndex < this.playbook.steps[stepIndex].lines.length; lineIndex++) {
                let runCommand = this.initRunCommand(stepIndex, lineIndex);
                let foundRunnerToExecuteCommand = false;
                for (let runnerIndex in this.environment.runners) {
                    let runner = await this.getRunner(this.environment.runners[runnerIndex]);
                    if (runner.supports(this.playbook.steps[stepIndex].lines[lineIndex].name, this.playbook.steps[stepIndex].lines[lineIndex].parameters)) {
                        var result = new RunResult();
                        if(runner.commandIsSkippable(runCommand.command.name)) {
                            console.log("Command " + runCommand.command.name + " will be skipped.");
                            continue;
                        }
                        try {
                            result = runner.run(runCommand);
                        }
                        catch (e) {
                            result.exceptions.push(e);
                        }
                        
                        await runner.assert(runCommand, result);
                        
                        foundRunnerToExecuteCommand = true;
                        break;
                    }
                }
                if(!foundRunnerToExecuteCommand && !this.environment.skipMissingFunctions) {
                    break mainloop;
                }   
            }
        }

        for (let runnerIndex in this.environment.runners) {
            await (await this.getRunner(this.environment.runners[runnerIndex])).destroy(this.playbook);
        }
    }

    public setVariable(name: string, value: any) {
        this.variables.set(name, value);
    }

    private async isEnvironmentComplete(): Promise<boolean> {
        let missingFunctions = [];
        for (let stepIndex in this.playbook.steps) {
            for (let lineIndex in this.playbook.steps[stepIndex].lines) {
                let isSupported = false;
                for (let runnerIndex in this.environment.runners) {
                    if ((await this.getRunner(this.environment.runners[runnerIndex])).supports(this.playbook.steps[stepIndex].lines[lineIndex].name, this.playbook.steps[stepIndex].lines[lineIndex].parameters)) {
                        isSupported = true;
                        break;
                    }
                }
                if (!isSupported) {
                    missingFunctions.push(this.playbook.steps[stepIndex].lines[lineIndex].name);
                }
            }
        }
        if(missingFunctions.length > 0) {
            this.syntaxErrorLogger.handleMissingFunction(this.environmentName, missingFunctions);
            return false;
        } else {
            return true;
        }
    }

    private async getRunner(name: string): Promise<Runner> {
        if (!this.runners.has(name)) {
            await this.loadRunner(name);
        }
        return this.runners.get(name);
    }

    private async loadRunner(name: string) {
        let imp = await import("../runners/" + name + "/index");
        let map = new Map<string, any>();
        for (let index in imp) {
            map.set(index.toLowerCase(), imp[index]);
        }
        let runner: Runner = new (map.get(name.toLowerCase()));
        runner.registerGetVariableCallback((name) => this.variables.get(name));
        runner.registerSetVariableCallback((name, value) => this.setVariable(name, value));
        runner.path = __dirname + "/../runners/" + name + "/";
        runner.name = name;
        runner.playbookName = this.playbook.name;
        runner.playbookPath = this.playbook.path;
        runner.playbookTitle = this.playbook.title;
        runner.environmentName = this.environmentName;
        this.runners.set(name, runner);
    }

    private initRunCommand(stepIndex: number, lineIndex: number): RunCommand {
        let runCommand = new RunCommand();
        if(lineIndex == 0) {
            runCommand.text = this.playbook.steps[stepIndex].text;
        } 
        if(lineIndex == (this.playbook.steps[stepIndex].lines.length - 1)){
            runCommand.textAfter = this.playbook.steps[stepIndex].textAfter;
        }
        runCommand.command = this.playbook.steps[stepIndex].lines[lineIndex];
        runCommand.stepIndex = stepIndex;
        runCommand.lineIndex = lineIndex;
        runCommand.stepTitle = this.playbook.steps[stepIndex].title;

        return runCommand;
    }
}
