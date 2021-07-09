export class Command{
    public name: string;
    public parameterString: string;

    get parameters(): any[] {
        try {
            return JSON.parse("[" + this.parameterString + "]");
        } catch(e) {
            console.error("Error parsing arguments: '" + this.parameterString + "'");
            throw e;
        }
    }
}
