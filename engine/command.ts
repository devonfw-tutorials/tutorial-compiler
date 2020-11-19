export class Command{
    public name: string;
    public parameterString: string;

    get parameters(): any[] {
        return JSON.parse("[" + this.parameterString + "]");
    }
}