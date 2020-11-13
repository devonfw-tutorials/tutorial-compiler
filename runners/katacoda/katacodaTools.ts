import { KatacodaStep, KatacodaAsset } from "./katacodaInterfaces";

export class KatacodaTools {
    public static generateIndexJson(title: string, minutes: number, steps: KatacodaStep[], assets: KatacodaAsset[]) {
        let indexJsonObject = {
            "title": title,
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
            "environment": {
                "uilayout": "terminal",
                "showide": true
            },
            "backend": {
                "imageid": "ubuntu:2004"
            }
        }
        return indexJsonObject;
    }
}