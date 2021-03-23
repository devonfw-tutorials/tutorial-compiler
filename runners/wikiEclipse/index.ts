import { Playbook } from "../../engine/playbook";
import { WikiRunner } from "../../engine/wikiRunner";

export class WikiEclipse extends WikiRunner {

    init(playbook: Playbook): void {
        super.init(playbook);
    }

    async destroy(playbook: Playbook): Promise<void> {
        super.destroy(playbook);
    }
}