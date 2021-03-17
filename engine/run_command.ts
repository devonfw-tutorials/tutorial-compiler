import { Command } from "./command";

export class RunCommand {
    public text: string;
    public command: Command;
    public lineIndex: number;
    public stepIndex: number;
    public textAfter: string;
    public stepTitle: string;
}