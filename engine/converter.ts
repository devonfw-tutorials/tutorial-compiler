import { ConsolePlatform } from "../runners/console/consoleInterfaces";
import { ConsoleUtils } from "../runners/console/consoleUtils";
import * as child_process from "child_process"
import * as path from "path"
import * as fs from "fs"
import { pathToFileURL } from "url";
import { fstat } from "fs";
import { FileContains } from "../assertions/fileContains";

export class Converter {

private readonly TMP_DIR = "tmp_convert";

private platform: ConsolePlatform;

    constructor() {
        // Determine platform for script execution
        if(process.platform == "win32") {
            this.platform = ConsolePlatform.WINDOWS;
        }else {
            this.platform = ConsolePlatform.LINUX;
        }

        // Create temporary directory in which files can be created & modified
        this.createTempDir();
    }

    createTempDir(): void {
        // Create tempDir if not already existing
        let dir = this.getTempDir();
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }


    createTempFile(filename: string, content: string) {
        fs.writeFileSync(path.join(this.getTempDir(),filename), content);
    }

    readTempFile(filename: string): string {
        let file_path = path.join(this.getTempDir(), filename);
        let fileContent = "";
        let file = fs.readFileSync(file_path);
        fileContent = file.toString()
        return fileContent;
    }

    getTempDir(): string {
        // Return tempDir
        return path.join(__dirname, this.TMP_DIR);
    }

    convertAsciidocToMarkdown(asciidocString: string): string {
        if(asciidocString !== undefined) {
            /**
             * 1. Write asciidocString to temp.adoc file
             * 2. Use AsciiDoctor to convert AsciiDoc String to DocBook XML file
             * 3. Use Pandoc to convert DocBook XML file to Markdown File
             * 4. Read Markdown file (eventually combine with step 2?)
             */

            this.createTempFile("temp.adoc", asciidocString);

            let markdownString = "";
            if(this.platform == ConsolePlatform.WINDOWS) {
                this.executeCommand("asciidoctor -b docbook temp.adoc", this.getTempDir());
                this.executeCommand("pandoc -f docbook -t gfm temp.xml -o temp.md", this.getTempDir());
                markdownString = this.readTempFile("temp.md");
            }else {
                this.executeCommand("asciidoctor -b docbook temp.adoc", this.getTempDir());
                this.executeCommand("pandoc -f docbook -t markdown temp.xml -o temp.md", this.getTempDir());
                markdownString = this.readTempFile("temp.md");
            }    
            return markdownString;
        }        
    }

    executeCommand(command: string, directory: string) {
        let process = child_process.spawnSync(command, {shell: true, cwd: directory});
        if(process.status != 0) {
            console.log("Error executing command: " + command + " (exit code: )" + process.status + ")");
            console.log(process.stderr.toString(), process.stdout.toString());
        }
    }
}