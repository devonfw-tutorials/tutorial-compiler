import { Runner } from "../../engine/runner"
import { RunResult } from "../../engine/run_result";
import { Step } from "../../engine/step";
import { Command } from "../../engine/command";
import { Assertions } from "../../assertions";

export class Console extends Runner {

    runInstallDevonIde(step: Step, command: Command): RunResult {
        //TODO
        let result = new RunResult();
        result.returnCode = 0;
        return result;
    }

    runInstallCobiGen(step: Step, command: Command): RunResult {
        return null;
    }

    async assertInstallDevonIde(step: Step, command: Command, result: RunResult) {
        console.log("assertInstallDevonIde");
        new Assertions()
        .noErrorCode(result)
        .noException(result);
    }

    async assertInstallCobiGen(step: Step, command: Command, result: RunResult) {
        console.log("assertInstallCobiGen");
    }
}