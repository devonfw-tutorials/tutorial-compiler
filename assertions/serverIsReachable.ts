import * as isReachable from "is-reachable";
import { ServerIsReachableParameterInterface } from "./serverIsReachableParameterInterface";

export class ServerIsReachable {
    public static async run(parameters: ServerIsReachableParameterInterface): Promise<void> {
        let port = this.getValue(parameters, 'port', undefined);
        let path = this.getValue(parameters, 'path', "");
        let interval = this.getValue(parameters, 'intervall', 5);
        let startupTime = this.getValue(parameters, 'startupTime', 600);
        let command = this.getValue(parameters, 'command', "");

        if(!port) {
            throw new Error("Missing arguments for the command " + command + ". You have to specify a port for the server. For further information read the function documentation.");
        } else {
            let timeoutFlag = false;
            let reached = false;
            let timeout = setTimeout(() => {
                timeoutFlag = true;
            }, startupTime * 1000);
            
            while(!timeoutFlag && !reached) {
                try {
                    reached = await isReachable("http://localhost:" + port + "/" + path);
                } catch(err) {
                    throw err;
                }
                if (!reached) {
                    await this.sleep(interval);
                }         
            }
            if (timeoutFlag) {
                throw new Error("The server has not become reachable in " + startupTime + " seconds: " + "http://localhost:" + port + "/" + path);
            }
            if(timeout) {
                clearTimeout(timeout);
            }
        }
    }

    private static getValue(parameters, name, defaultVal){
        return parameters && parameters[name]!==undefined ? parameters[name] : defaultVal;
   }

    private static sleep(seconds: number) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}