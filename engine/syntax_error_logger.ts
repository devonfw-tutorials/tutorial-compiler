import * as fs from 'fs';
import path = require('path');

export class SyntaxErrorLogger {
    public activated = false;
    private outputDir = __dirname + "/../errors/";
    private header = "## Syntax Errors found";
    
    activate() {
        this.activated = true;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
    }

    handle(message: string) {
        if(this.activated){
            if(!fs.existsSync(path.join(this.outputDir, "syntaxErrors.md"))) {
                fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), this.header + "\n", {flag: "a"});
            }
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), message + "\n", {flag: "a"});
        }
    }
}