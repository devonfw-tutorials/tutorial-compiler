import { RunResult } from "../engine/run_result";
import { Step } from "../engine/step";
import { Command } from "../engine/command";
import { NoErrorCode } from "./noErrorCode";
import { NoException } from "./noException";
import { DirectoryExist } from "./directoryExist";
import { FileExist } from "./fileExist";
import { DirectoryNotEmpty } from "./directoryNotEmpty";
import { FileContains } from "./fileContains";
import { RepositoryIsClean } from "./repositoryIsClean";


export class Assertions {

    public noErrorCode(result: RunResult): Assertions {
        NoErrorCode.run(result);
        return this;
    }

    public noException(result: RunResult): Assertions {
        NoException.run(result);
        return this;
    }

    public directoryExits(directory: string): Assertions {
        DirectoryExist.run(directory);
        return this;
    }

    public directoryNotEmpty(directory: string): Assertions {
        DirectoryNotEmpty.run(directory);
        return this;
    }

    public fileExits(filepath: string): Assertions {
        FileExist.run(filepath);
        return this;
    }

    public fileContains(filepath: string, content: string): Assertions {
        FileContains.run(filepath, content);
        return this;
    }

    public repositoryIsClean(directory: string): Assertions {
        RepositoryIsClean.run(directory);
        return this;
    }
}