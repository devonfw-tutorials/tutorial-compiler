import { Playbook } from "./playbook";
import { Step } from "./step";
import { Command } from "./command";
const pegjs = require("pegjs");
const tspegjs = require("ts-pegjs");
const fs = require('fs');


export class Parser {
    private parser;

    constructor() {
        let def = fs.readFileSync(__dirname + "/parser.def", 'utf8');
        this.parser = pegjs.generate(def);
    }

    parse(inputFile: string): Playbook {
        let input = fs.readFileSync(inputFile, 'utf8');
        let parseResult = this.parser.parse(input);
        let result = new Playbook();
        result.title = parseResult[0][2];
        result.subtitle = parseResult[1]? parseResult[1][3]: "";
        result.description = parseResult[2][2].descriptionlines;
        result.conclusion = parseResult[4]? parseResult[4][2].conclusionlines: "";
        for(let index in parseResult[3]){
            let step = new Step();
            step.text = this.getText(parseResult, index);
            step.lines = this.getLines(parseResult, index);
            step.textAfter = this.getTextAfter(parseResult, index);
            step.title = this.getTitle(parseResult, index);
            result.steps.push(step);
        }
        return result;
    }

    getText(parseResult, index){
        try {
            return parseResult[3][index][1].steptextlines || parseResult[3][index][2][1].steptextlines;
        } catch (error) {
            return parseResult[3][index][2][1].steptextlines;
        }
    }

    getLines(parseResult, index):Command[]{
        let linebreak = process.platform=="win32" ? "\r\n" : "\n";
        try {
            return (parseResult[3][index][7].steplines || parseResult[3][index][2][7].steplines).split(linebreak).filter(e => e != '').map(e => this.createCommand(e));
        } catch (error) {
            return parseResult[3][index][2][7].steplines.split(linebreak).filter(e => e != '').map(e => this.createCommand(e));
        }
    }

    getTitle(parseResult, index) {
        console.log(parseResult[3][index][2]);
        
        if(parseResult[3][index][2][4] && parseResult[3][index][2][4][2] && parseResult[3][index][2][4][2].stepstitle){
        console.log(parseResult[3][index][2][4][2].steptitle);
        }
        try {
            return (parseResult[3][index][2][4][2].steptitle);
        } catch(error) {
            return null;
        }
    }

    createCommand(line: string): Command{
        let re =/([^(]+)\(([^)]*)\)/;
        let result = re.exec(line);
        let retVal = new Command();
        retVal.name = result[1].trim();
        retVal.parameterString = result[2];
        return retVal;
    }

    getTextAfter(parseResult, index){
        try {
            return parseResult[3][index][3].steptextafterlines || "";
        } catch (error) {
            return "";
        }
    }
}
