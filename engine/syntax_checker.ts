import * as fs from 'fs';
import path = require('path');

export class SyntaxChecker {
    public activated = false;
    public outputDir = __dirname + "/../errors/";;
    
    activate() {
        this.activated = true;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
    }

    handle(message: string) {
        if(this.activated){
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), message + "\n", {flag: "a"});
        }
    }
}