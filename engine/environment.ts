
export interface Environment{
    failOnIncomplete: boolean;
    runners: RunnerEnvironment[];
}

export interface RunnerEnvironment {
    name: string;
    path: string;
}