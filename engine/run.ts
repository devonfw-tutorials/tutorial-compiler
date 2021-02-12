import { Parser } from "./parser";
import { Playbook } from "./playbook";
import { Environment } from "./environment";
import { Engine } from "./engine";
import { isObject } from "util";
const fs = require('fs');
const yargs = require('yargs/yargs');

class Run {
    private playbooks: Playbook[] = [];
    private environments: Map<string, Environment> = new Map<string, Environment>();
    private args: Map<string, string> = new Map<string, string>();

    async run(): Promise<boolean> {
        this.parseArgs();
        this.parsePlaybooks();
        this.parseEnvironments();
        let errors = [];
        for (let entry of Array.from(this.environments.entries())) {
            let key = entry[0];
            let value = entry[1];
            for (let playbookIndex in this.playbooks) {
                let engine = new Engine(key, value, this.playbooks[playbookIndex]);

                for (let varEntry of Array.from(this.args.entries())) {
                    engine.setVariable(varEntry[0], varEntry[1]);
                }

                try {
                    await engine.run();
                } catch (error) {
                    console.error(error);
                    errors.push(error);
                }
            }
        }
        if (errors.length != 0) {
            console.log("Errors", errors);
        }
        return errors.length == 0;
    }

    parsePlaybooks() {
        let parser = new Parser();

        let playbooksDir = (<string>this.args.get("playbooksDir")) || __dirname + "/../playbooks/";
        let playbookDirs = fs.readdirSync(playbooksDir);
        for (let index in playbookDirs) {
            let indexFile = playbooksDir + playbookDirs[index] + "/index.asciidoc";
            if (fs.existsSync(indexFile)) {
                let playbook = parser.parse(indexFile);
                playbook.name = playbookDirs[index] + "/";
                playbook.path = playbooksDir + playbookDirs[index] + "/";
                this.playbooks.push(playbook);
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
        console.log(argv);
        this.traverseArgs('', argv);
        console.log(this.args);

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
}


let main = new Run();
main.run().then((result) => {
    if (!result) {
        process.exit(1);
    }
});