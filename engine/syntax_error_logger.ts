import * as fs from 'fs';
import path = require('path');

export class SyntaxErrorLogger {
    public activated = false;
    private outputDir = __dirname + "/../errors/";
    private errors = new Array;
    
    activate() {
        this.activated = true;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
    }

    deactivate() {
        if(this.activated && this.errors.length > 0){
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), "## Function(s) not found: \n - ", {flag: "a"});
            let ending = "\n You can find all supported functions and how to use them [here](https://github.com/devonfw-tutorials/tutorials/wiki/Functions)."
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), this.errors.join("\n - ") + "\n" + ending + "\n", {flag: "a"});
            this.activated = false;
        }
    }

    handleMissingFunction(missingFunctions: any[]) {
        if(this.activated){
            this.errors = missingFunctions;
        }
    }

    handleParseError(playbook, error) {
        if(this.activated) { 
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), 
                "## Error while parsing playbook: " 
                + playbook + 
                "\n" + "- " 
                + error + "\n"
                + "\n You can find informations on the syntax [here](https://github.com/devonfw-tutorials/tutorials/wiki/Tutorials)" + "\n",
                 {flag: "a"});
            this.activated = false;
        }
    }
}