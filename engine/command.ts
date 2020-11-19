export class Command{
    public name: string;
    public parameterString: string;

    get parameters(): any[] {
        let params = JSON.parse("[" + this.parameterString + "]");
        return params;
    }
}