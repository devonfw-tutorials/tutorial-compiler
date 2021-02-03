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
        let driverPlatform = process.platform === "win32" ? "win32" : "linux64";
        let file = path.join(downloadPath, "chromedriver_" + driverPlatform + ".zip");
        let url = "https://chromedriver.storage.googleapis.com/" + chromeDriverVersion + "/chromedriver_" + driverPlatform + ".zip"

        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver_" + driverPlatform + ".zip\""
            : "wget -c \"" + url + "\" -O chromedriver_" + driverPlatform + ".zip -";
        let cp = child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        if(!fs.existsSync(file)) {
            console.log("Unable to chromedriver from url " + url + ". Try to download latest release for chromedriver version " + chromeDriverVersion.substring(0, chromeDriverVersion.indexOf(".")));
            url = "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_" + chromeDriverVersion.substring(0, chromeDriverVersion.indexOf("."));
            command = (process.platform == "win32")
                ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver_latestRelease.txt\""
                : "wget -c \"" + url + "\" -O chromedriver_latestRelease.txt -";
            cp = child_process.spawnSync(command, { shell: true, cwd: downloadPath });

            if(!fs.existsSync(path.join(downloadPath, "chromedriver_latestRelease.txt"))) {
                throw new Error("Unable to get latest release");
            }

            chromeDriverVersion = fs.readFileSync(path.join(downloadPath, "chromedriver_latestRelease.txt"), "utf-8");
            url = "https://chromedriver.storage.googleapis.com/" + chromeDriverVersion + "/chromedriver_" + driverPlatform + ".zip"
            command = (process.platform == "win32")
                ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver_" + driverPlatform + ".zip\""
                : "wget -c \"" + url + "\" -O chromedriver_" + driverPlatform + ".zip -";
            cp = child_process.spawnSync(command, { shell: true, cwd: downloadPath });
            if(!fs.existsSync(file)) {
                console.log(cp.output.toString());
                throw new Error("Error while downloading chromedriver from url " + url);
            }
        }
        console.log("Chromedriver (Version: " + chromeDriverVersion + ") successfully downloaded to " + file);

        //unzip driver
        command = (process.platform == "win32")
            ? "powershell.exe tar -xz chromedriver_" + driverPlatform + ".zip"
            : "tar -xz chromedriver_" + driverPlatform + ".zip";
        cp = child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        console.log(cp.output.toString());
        return file;
    }
}