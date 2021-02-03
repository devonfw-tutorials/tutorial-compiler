import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";

export class VsCodeUtils {
    static getVsCodeInstallDirectory() {
        let cmd = (process.platform == "win32") ? "where code" : "which code"
        let cp = child_process.spawnSync(cmd, { shell: true });
        let output = cp.stdout.toString();
        if(!output) {
            return "";
        }
        
        let vsCodeDirectory = output.toString().split("\n")[0];
        let executable = vsCodeDirectory.substring(0, vsCodeDirectory.lastIndexOf(path.sep)) + path.sep + ".." + path.sep + "Code.exe";
        return executable;
    }
    
   static getVsCodeVersion() {
        let cp = child_process.spawnSync("code --version", { shell: true });
        let output = cp.stdout.toString();
        if(!output) {
            return "";
        }
        
        return output.split("\n")[0];
    }
    
    static getChromeDriverVersion(vsCodeVersion: string, downloadPath: string) {
        console.log(downloadPath);
        let url = "https://raw.githubusercontent.com/Microsoft/vscode/" + vsCodeVersion + "/cgmanifest.json";
        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile manifest.json\""
            : "wget -c \"" + url + "\" -O -";
        child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        let filename = path.join(downloadPath, "manifest.json");
        if(!fs.existsSync(filename)) {
            throw Error("Could't download manifest.json from " + url);
        }

        let manifest = require(filename);
        return manifest.registrations[0].version;
    }
    
    static downloadChromeDriver(chromeDriverVersion: string, downloadPath: string) {
        let file = path.join(downloadPath, process.platform == "win32" ? "chromedriver.exe" : "chromedriver");
        let driverPlatform = process.platform === "win32" ? "win32" : "linux64";
        let url = "https://chromedriver.storage.googleapis.com/" + chromeDriverVersion + "/chromedriver_" + driverPlatform + ".zip"

        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver.exe\""
            : "wget -c \"" + url + "\" -O chromedriver -";
        child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        if(!fs.existsSync(file)) {
            throw new Error("Error while downloading chromedriver from url " + url);
        }
        console.log("Chromedriver (Version: " + chromeDriverVersion + ") successfully downloaded to " + file);
    }
}