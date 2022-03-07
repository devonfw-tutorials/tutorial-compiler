import { KatacodaAsset, AssetManagerData } from "./katacodaInterfaces";
import * as fs from 'fs';
import * as path from 'path';

export class KatacodaAssetManager {
    private assetDirectory: string;
    private assetData: AssetManagerData[] = [];
    private katacodaAssets: KatacodaAsset[] = [];

    constructor(assetDir: string) {
        this.assetDirectory = assetDir;
    }

    registerFile(filepathSource: string, filepathTarget: string, katacodaDirectory: string, copyFile: boolean, copyIntoKatacodaEnvironment: boolean) {
        this.assetData.push({
            sourcePath: filepathSource,
            targetPath: filepathTarget,
            katacodaDirectory: katacodaDirectory,
            copyFile: copyFile
        });

        if(copyIntoKatacodaEnvironment) {
            this.katacodaAssets.push({
                file: filepathTarget.replace(/\\/g, "/"),
                target: katacodaDirectory.replace(/\\/g, "/")
            })
        }
    }

    registerDirectory(directorySource: string, filepathTarget: string, katacodaDirectory: string, copyFile: boolean, copyIntoKatacodaEnvironment: boolean) {
        let dir = fs.readdirSync(directorySource);
        dir.forEach(file => {
            if(fs.lstatSync(path.join(directorySource, file)).isDirectory()) {
                this.registerDirectory(path.join(directorySource, file), filepathTarget, katacodaDirectory, copyFile, copyIntoKatacodaEnvironment);
            } else {
                this.registerFile(path.join(directorySource, file), path.join(filepathTarget, file), katacodaDirectory, copyFile, copyIntoKatacodaEnvironment);
            }
        });
    }

    getKatacodaAssets() {
        return this.katacodaAssets;
    }

    copyAssets() {
        for(let i = 0; i < this.assetData.length; i++) {
            if(this.assetData[i].copyFile) {
                fs.copyFileSync(this.assetData[i].sourcePath, path.join(this.assetDirectory, this.assetData[i].targetPath));
            }
        }
    }
}