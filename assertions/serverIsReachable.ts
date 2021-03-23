import * as isReachable from "is-reachable";

export class ServerIsReachable {
    public static async run(parameters, callback): Promise<void> {
        let port = this.getValue(parameters, 'port', undefined);
        let path = this.getValue(parameters, 'path', "");
        let interval = this.getValue(parameters, 'intervall', 5);
        let startupTime = this.getValue(parameters, 'startupTime', 600);
        let requirePath = this.getValue(parameters, 'requirePath', false);

        process.on('unhandledRejection', function(err) {
            console.log(err);
            // sendInTheCalvary(err);
        });

        if(!port || (requirePath && !path)) {
            callback();
            let optionalString = requirePath? "and a path " : "";
            throw new Error("Missing arguments for command runServerJava. You have to specify a port " + optionalString + "for the server. For further information read the function documentation.");
        } else {
            let endTime = new Date().getTime() + startupTime * 1000;
            console.log("Ending at: " + new Date(endTime).toISOString());
            const polling = async (): Promise<void> => {
                    let reached = await isReachable("http://localhost:" + port + "/" + path);

                    let now = new Date().getTime();
                    if (now >= endTime) {
                        console.log("timeout at " + new Date(now).toISOString());
                        callback();
                        throw new Error("The server has not become reachable in " + startupTime + " seconds: " + "http://localhost:" + port + "/" + path);
                    } else if (!reached) {
                        setTimeout(polling, interval * 1000);
                    }         
            };
            try {
                await polling();
            } catch(err) {
                throw err;
            }
        }
    }

    private static getValue(parameters, name, defaultVal){
        return parameters && parameters[name]!==undefined ? parameters[name] : defaultVal;
   }
}