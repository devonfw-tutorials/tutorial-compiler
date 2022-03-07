import { KatacodaStep, KatacodaAsset } from "./katacodaInterfaces";

export class KatacodaTools {
    public static generateIndexJson(title: string, description: string, minutes: number, steps: KatacodaStep[], assets: KatacodaAsset[], showVsCodeIde: boolean) {
        let environment = showVsCodeIde ? { "uilayout": "terminal", "showide": true } : { "uilayout": "editor-terminal", "showide": false };
        let indexJsonObject = {
            "title": title,
            "description": description,
            "difficulty": "Beginner",
            "time": minutes + " Minutes",
            "details": {
                "steps": steps,
                "intro": {
                    "text": "intro.md",
                    "code": "intro_foreground.sh",
                    "courseData": "intro_background.sh"
                },
                "finish": {
                    "text": "finish.md"
                },
                "assets": {
                    "client": assets
                }
            },
            "environment": environment,
            "backend": {
                "imageid": "ubuntu:2004"
            }
        }
        return indexJsonObject;
    }
}