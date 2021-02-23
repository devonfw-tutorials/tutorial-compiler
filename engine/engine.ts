import { Environment } from "./environment";
import { Playbook } from "./playbook";
import { Runner } from "./runner";
import { RunResult } from "./run_result";


export class Engine {

    private runners: Map<string, Runner> = new Map<string, Runner>();
    private variables: Map<string, any> = new Map<string, any>();

    constructor(private environmentName: string, private environment: Environment, private playbook: Playbook) { }

    async run() {
        console.log("Environment: " + this.environmentName);
        if(this.variables.get("ci") && !this.environment.ciExecution) {
            console.log("Skip environment because of ci execution");
            return;
        }
        if (! await this.isEnvironmentComplete()) {
            if (this.environment.failOnIncomplete) {
                throw "Environment incomplete: " + this.environmentName;
            }
            console.log("Environment incomplete: " + this.environmentName);
            return;
        }
        for (let runnerIndex in this.environment.runners) {
            (await this.getRunner(this.environment.runners[runnerIndex])).init(this.playbook);
        }

        mainloop: for (let stepIndex in this.playbook.steps) {
            for (let lineIndex in this.playbook.steps[stepIndex].lines) {
                let foundRunnerToExecuteCommand = false;
                for (let runnerIndex in this.environment.runners) {
                    let runner = await this.getRunner(this.environment.runners[runnerIndex]);
                    if (runner.supports(this.playbook.steps[stepIndex].lines[lineIndex].name)) {
                        var result = new RunResult();
                        if(runner.commandIsSkippable(this.playbook.steps[stepIndex].lines[lineIndex].name)) {
                            console.log("Command " + this.playbook.steps[stepIndex].lines[lineIndex].name + " will be skipped.");
                            continue;
                        }
                        try {
                            result = runner.run(this.playbook.steps[stepIndex], this.playbook.steps[stepIndex].lines[lineIndex]);
                        }
                        catch (e) {
                            result.exceptions.push(e);
                        }
                        
                        await runner.assert(this.playbook.steps[stepIndex], this.playbook.steps[stepIndex].lines[lineIndex], result);
                        
                        foundRunnerToExecuteCommand = true;
                        break;
                    }
                }
                if(!foundRunnerToExecuteCommand) {
                    break mainloop;
                }   
            }
        }

        for (let runnerIndex in this.environment.runners) {
            (await this.getRunner(this.environment.runners[runnerIndex])).destroy(this.playbook);
        }
    }

    public setVariable(name: string, value: any) {
        this.variables.set(name, value);
    }

    private async isEnvironmentComplete(): Promise<boolean> {
        for (let stepIndex in this.playbook.steps) {
            for (let lineIndex in this.playbook.steps[stepIndex].lines) {
                let isSupported = false;
                for (let runnerIndex in this.environment.runners) {
                    if ((await this.getRunner(this.environment.runners[runnerIndex])).supports(this.playbook.steps[stepIndex].lines[lineIndex].name)) {
                        isSupported = true;
                        break;
                    }
                }
                if (!isSupported) {
                    return false;
                }
            }
        }

        return true;
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
        this.runners.set(name, runner);
    }
}