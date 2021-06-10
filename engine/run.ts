import { Parser } from "./parser";
import { Playbook } from "./playbook";
import { Environment } from "./environment";
import { Engine } from "./engine";
import { SyntaxErrorLogger } from "./syntax_error_logger";
const fs = require('fs');
const yargs = require('yargs/yargs');

class Run {
    private playbooks: Playbook[] = [];
    private environments: Map<string, Environment> = new Map<string, Environment>();
    private args: Map<string, string> = new Map<string, string>();
    private errors = [];
    private syntaxErrorLogger = new SyntaxErrorLogger();

    async run(): Promise<boolean> {
        try {
            this.parseArgs();
            if(!this.args.has("debug")) {
                console.debug = function(){}
            }
            if(this.args.has("checkSyntax")) {
                this.syntaxErrorLogger.activate();
            }
            this.parsePlaybooks();
            this.parseEnvironments();
            let entries = this.filterEnv(Array.from(this.environments.entries()));

            for (let entry of entries) {
                let key = entry[0];
                let value = entry[1];
                let playbookIndecies = this.filterPlaybooks(this.playbooks)
                for (let playbookIndex of playbookIndecies) {
                    let engine = new Engine(key, value, this.playbooks[playbookIndex], this.syntaxErrorLogger);

                    for (let varEntry of Array.from(this.args.entries())) {
                        engine.setVariable(varEntry[0], varEntry[1]);
                    }

                    try {
                        await engine.run();
                    } catch (error) {
                        console.error(error);
                        this.errors.push(error);
                    }
                }
            }
            this.syntaxErrorLogger.deactivate();
        } catch (error) {
            console.error(error);
            this.errors.push(error);
        }
        
        if (this.errors.length != 0) {
            console.log("Errors", JSON.stringify(this.errors, null, "\t"));
        }
        return this.errors.length == 0;
    }

    parsePlaybooks() {
        let parser = new Parser();

        let playbooksDir = (<string>this.args.get("playbooksDir")) || __dirname + "/../playbooks/";
        let playbookDirs = fs.readdirSync(playbooksDir);
        for (let index in playbookDirs) {
            try {
                let indexFile = playbooksDir + playbookDirs[index] + "/index.asciidoc";
                if (fs.existsSync(indexFile)) {
                    let playbook = parser.parse(indexFile);
                    playbook.name = playbookDirs[index] + "/";
                    playbook.path = playbooksDir + playbookDirs[index] + "/";
                    this.playbooks.push(playbook);
                }
            } catch(e) {
                console.error("Error while parsing playbook: " + playbookDirs[index], e);
                this.syntaxErrorLogger.handleParseError(playbookDirs[index], e);
                this.errors.push(e);
            }
        }
    }

    parseEnvironments() {
        let environmentsDir = (<string>this.args.get("environmentsDir")) || __dirname + "/../environments/";
        let environmentFiles = fs.readdirSync(environmentsDir);
        for (let index in environmentFiles) {
            let jsonFile = environmentsDir + environmentFiles[index];
            if (jsonFile.endsWith(".json")) {
                let json = fs.readFileSync(jsonFile, 'utf8');
                let parts = environmentFiles[index].split(".");
                this.environments.set(parts[0], JSON.parse(json));
            }
        }
    }

    parseArgs() {
        var argv = yargs(process.argv.slice(2)).argv;
        this.traverseArgs('', argv);
    }

    traverseArgs(parentName, obj) {

        for (let index in obj) {
            if (obj[index] instanceof Object) {
                this.args.set(parentName + index, obj[index]);
                this.traverseArgs(parentName + index + ".", obj[index]);
            }
            else {
                this.args.set(parentName + index, obj[index]);
            }
        }
    }

    filterEnv(entries){
        if(!this.args.get('e'))
            return entries;

        let filteredEntries = new Array();
        for(let entry of entries){
            if(this.args.get('e').includes(entry[0]))
                filteredEntries.push(entry)
        }
        return filteredEntries
    }

    filterPlaybooks(playbooks){
        if(!this.args.get('p'))
            return Array.from(playbooks.keys());
            
        let filteredIndecies = [];
        for(let playbook of playbooks){
            if(this.args.get('p').includes(playbook['name'].replace("/", "")))
                filteredIndecies.push(playbooks.indexOf(playbook))
        }
        return filteredIndecies
    }
}


let main = new Run();
main.run().then((result) => {
    if (!result) {
        process.exit(1);
    }
});