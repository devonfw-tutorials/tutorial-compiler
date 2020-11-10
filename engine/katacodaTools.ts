export class KatacodaTools {
    public static generateIndexJson(title: string, minutes: number, steps: object[], assets: object[]) {
        let indexJsonObject = {
            "title": title,
            "difficulty": "Beginner",
            "time": minutes + " Minutes",
            "details": {
                "steps": steps,
                "intro": {
                    "text": "intro.md"
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