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
        result.description = parseResult[1][2].descriptionlines;
        for(let index in parseResult[2]){
            let step = new Step();
            step.text = this.getText(parseResult,index);;
            step.lines = this.getLines(parseResult,index);
            step.textAfter = this.getTextAfter(parseResult, index);

            result.steps.push(step);
        }

        return result;
    }

    getText(parseResult, index){
        try {
            return parseResult[2][index][0].steptextlines || parseResult[2][index][2][0].steptextlines;
        } catch (error) {
            return parseResult[2][index][2][0].steptextlines;
        }
    }

    getLines(parseResult, index):Command[]{
        try {
            return (parseResult[2][index][5][0].stepline || parseResult[2][index][2][5][0].stepline).split("\r\n").filter(e => e != '').map(e => this.createCommand(e));
        } catch (error) {
            return parseResult[2][index][2][5][0].stepline.split("\r\n").filter(e => e != '').map(e => this.createCommand(e));
        }
    }

    createCommand(line: string): Command{
        let re =/([^(]+)\(([^)]*)\)/;
        let result = re.exec(line);
        let retVal = new Command();
        retVal.name = result[1].trim();
        retVal.parameters = result[2];
        return retVal;
    }

    getTextAfter(parseResult, index){
        try {
            return parseResult[2][index][3].steptextafterlines || "";
        } catch (error) {
            return "";
        }
    }
}