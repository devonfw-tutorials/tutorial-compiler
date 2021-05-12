import * as fs from 'fs';
import path = require('path');

export class SyntaxChecker {
    public activated = false;
    private headerSet = false;
    public outputDir = __dirname + "/../errors/";;
    
    activate() {
        this.activated = true;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
    }

    handle(message: string) {
        if(this.activated){
            if(!this.headerSet) {
                fs.writeFileSync(path.join(this.outputDir, "errorComment.md"), this.getHeader(), {flag: "a"});
                this.headerSet = true;
            }
            fs.writeFileSync(path.join(this.outputDir, "errorComment.md"), message + "\n", {flag: "a"});
        }
    }

    private getHeader(): string {
        return "## Syntax Error(s) found \n"
    }
}