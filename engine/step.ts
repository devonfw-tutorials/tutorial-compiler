import { Command } from "./command";

export class Step {
    public text: string;
    public lines: Command[] = [];
    public title: string;
    public textAfter: string;
}