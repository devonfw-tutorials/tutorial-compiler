import {Step} from "./step";

export class Playbook{
    public name: string;
    public path: string;
    public title: string;
    public description: string;
    public steps: Step[] = [];
}