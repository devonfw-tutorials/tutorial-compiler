import {Step} from "./step";

type Tag = Record<string, string[]>

export class Playbook{
    public name: string;
    public path: string;
    public title: string;
    public subtitle: string;
    public description: string;
    public conclusion: string;
    public steps: Step[] = [];
    public tags: Tag;
}