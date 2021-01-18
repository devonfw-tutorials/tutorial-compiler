import * as isReachable from "is-reachable";

export class ServerIsReachable {
    public static async run(command: string, assertionDetails: any) {
        if(!assertionDetails.startupTime) {
            console.warn("No startup time for command " + command + " has been set")
        }

        let startupTimeInSeconds = assertionDetails.startupTime ? assertionDetails.startupTime : 0;
        await this.sleep(startupTimeInSeconds);
            
        if(!assertionDetails.port) {
            throw new Error("Missing argument for command " + command + ". You have to specify a port for the server. For further information read the function documentation.");
        } else {
            let isServerReachable = await isReachable("http://localhost:" + assertionDetails.port + "/" + assertionDetails.path);
            if(!isServerReachable) {
                throw new Error("The server has not become reachable in " + startupTimeInSeconds + " seconds: " + "http://localhost:" + assertionDetails.port + "/" + assertionDetails.path)
            }
        }
    }

    private static sleep(seconds: number) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}