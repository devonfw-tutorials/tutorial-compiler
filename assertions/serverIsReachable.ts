import * as isReachable from "is-reachable";

export class ServerIsReachable {
    public static run(port: number, path: string): Promise<boolean> {
        return isReachable("http://localhost:" + port + "/" + path);
    }
}