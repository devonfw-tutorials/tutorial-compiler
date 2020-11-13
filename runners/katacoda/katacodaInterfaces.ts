export interface KatacodaStep {
    title: string
    text: string
}

export interface KatacodaAsset {
    file: string;
    target: string;
}

export interface KatacodaSetupScript {
    name: string
    script: string
}

export interface AssetManagerData {
    sourcePath: string;
    targetPath: string;
    katacodaDirectory: string;
    copyFile: boolean
}