import { RunResult } from "../engine/run_result";
import { Step } from "../engine/step";
import { Command } from "../engine/command";
import { NoErrorCode } from "./noErrorCode";
import { NoException } from "./noException";


export class Assertions{

    public noErrorCode(result: RunResult): Assertions {
        NoErrorCode.run(result);
        return this;
    }

    public noException(result: RunResult): Assertions {
        NoException.run(result);
        return this;
    }
}