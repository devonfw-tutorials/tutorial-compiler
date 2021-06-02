import * as fs from 'fs';
import path = require('path');

export class SyntaxErrorLogger {
    public activated = false;
    private outputDir = __dirname + "/../errors/";
    private errorMap = new Map<string, Set<any>>();
    
    activate() {
        this.activated = true;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
    }

    deactivate() {
        if(this.activated && this.errorMap.size > 0){
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), "## Syntax Errors found" + "\n", {flag: "a"});
            this.errorMap.forEach((value: Set<any>, key: string) => {
                fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), "Environment incomplete: " + key + " | Missing functions: \n", {flag: "a"});
                console.log("Environment incomplete: " + key + " | Missing functions: \n");
                let missingFunctions = "";
                value.forEach(element => {
                    missingFunctions = missingFunctions + "- " + element + "\n";   
                });
                fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), missingFunctions + "\n", {flag: "a"});
                console.log(missingFunctions);
            });
        }
    }

    handleMissingFunction(environment: string, missingFunctions: any[]) {
        if(this.activated){
            let set = new Set;
            if(this.errorMap.has(environment)) {
                set = this.errorMap.get(environment);
            }
            this.errorMap.set(environment, this.addToSet(set, missingFunctions));
        }
    }

    handleParseError(playbook, error) {
        if(this.activated) { 
            fs.writeFileSync(path.join(this.outputDir, "syntaxErrors.md"), "## Error while parsing playbook: " + playbook + "\n" + "- " + error + "\n", {flag: "a"});
            this.activated = false;
        }
    }

    private addToSet(set: Set<any>, array: any[]): Set<any> {
        array.forEach(element => {
            set.add(element);
        });
        return set;
    }
}