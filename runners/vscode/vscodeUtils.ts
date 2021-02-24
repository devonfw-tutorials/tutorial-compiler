import * as path from 'path';
import * as child_process from "child_process";
import * as fs from "fs";

export class VsCodeUtils {
    static getVsCodeExecutable() {
        let cmd = (process.platform == "win32") ? "where code" : "which code";
        let cp = child_process.spawnSync(cmd, { shell: true });
        let output = cp.stdout.toString();

        let executable = "";
        if(output) {
            let vsCodeBin = output.toString().split("\n")[0];
            executable = path.normalize(path.join(path.dirname(vsCodeBin), "..", (process.platform == "win32") ? "Code.exe" : "code"));
        } else {
            let vscodeDirectory = path.normalize(path.join(__dirname, "..", "..", "working", "devonfw", "software", "vscode"));
            executable = (process.platform == "win32") ? path.join(vscodeDirectory, "Code.exe") : path.join(vscodeDirectory, "code");
        }
            
        if(!fs.existsSync(executable)) return null;
        return executable;
    }
    
   static getVsCodeVersion(vsCodeBin?: string) {
        let cp = child_process.spawnSync("code --version", { shell: true });
        let output = cp.stdout.toString();
        if(output) {
            return output.split("\n")[0];
        }
        
        cp = child_process.spawnSync(vsCodeBin + " --version", { shell: true });
        output = cp.stdout.toString();
        if(output) {
            return output.split("\n")[0];
        }
        return "";
    }
    
    static getChromiumVersion(vsCodeVersion: string, downloadPath: string) {
        let url = "https://raw.githubusercontent.com/Microsoft/vscode/" + vsCodeVersion + "/cgmanifest.json";
        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile manifest.json\""
            : "wget -c \"" + url + "\" -O -";
        let p = child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        console.log(p.output.toString())
        let filename = path.join(downloadPath, "manifest.json");
        if(!fs.existsSync(filename)) {
            console.log("Could't download manifest.json from " + url);
            throw Error("Could't download manifest.json from " + url);
        }

        let manifest = require(filename);
        return manifest.registrations[0].version;
    }
    
    static downloadChromeDriver(chromiumVersion: string, downloadPath: string) {
        let driverPlatform = process.platform === "win32" ? "win32" : "linux64";
        let file = path.join(downloadPath, "chromedriver_" + driverPlatform + ".zip");
        
        this.downloadDriverInternal(chromiumVersion, driverPlatform, downloadPath);
        if(!fs.existsSync(file)) {
            console.log("Unable to download chromedriver " + chromiumVersion + ". Try to download latest chromedriver release for chromium " + chromiumVersion.substring(0, chromiumVersion.indexOf(".")));
            chromiumVersion = this.getLatestChromeDriverVersion(chromiumVersion.substring(0, chromiumVersion.indexOf(".")), downloadPath);
           
            this.downloadDriverInternal(chromiumVersion, driverPlatform, downloadPath);
            if(!fs.existsSync(file)) {
                throw new Error("Unable to download chromedriver " + chromiumVersion);
            }
        }
        console.log("Chromedriver " + chromiumVersion + " successfully downloaded to " + file);

        //unzip chromedriver
        let unzipCommand = (process.platform == "win32")
            ? "powershell.exe Expand-Archive -LiteralPath chromedriver_" + driverPlatform + ".zip -DestinationPath " + downloadPath
            : "tar -xz chromedriver_" + driverPlatform + ".zip";
        child_process.spawnSync(unzipCommand, { shell: true, cwd: downloadPath });
        return file;
    }

    private static getLatestChromeDriverVersion(chromiumVersion: string, downloadPath: string): string {
        let url =  "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_" + chromiumVersion;
        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver_latestRelease.txt\""
            : "wget -c \"" + url + "\" -O chromedriver_latestRelease.txt";
        child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        if(!fs.existsSync(path.join(downloadPath, "chromedriver_latestRelease.txt"))) {
            throw new Error("Unable to get latest chromedriver release for chromium version " + chromiumVersion);
        }
        return fs.readFileSync(path.join(downloadPath, "chromedriver_latestRelease.txt"), "utf-8");
    }

    private static downloadDriverInternal(chromiumVersion: string, driverPlatform: string, downloadPath: string) {
        let url = "https://chromedriver.storage.googleapis.com/" + chromiumVersion + "/chromedriver_" + driverPlatform + ".zip"

        let command = (process.platform == "win32")
            ? "powershell.exe \"Invoke-WebRequest " + url + " -OutFile chromedriver_" + driverPlatform + ".zip\""
            : "wget -c \"" + url + "\" -O chromedriver_" + driverPlatform + ".zip -";
        let p = child_process.spawnSync(command, { shell: true, cwd: downloadPath });
        console.log(p.output.toString())
    }
}