import { expect } from 'chai';
import { WebDriver, Workbench, VSBrowser, InputBox, ActivityBar, Key } from 'vscode-extension-tester';

describe('CobiGenJava Test', () => {
    let driver: WebDriver;

    before(() => {
        driver = VSBrowser.instance.driver;
    });

    it('runCobiGenJava', async function () {
        console.log("Title: " + await VSBrowser.instance.driver.getTitle());
        expect(await VSBrowser.instance.driver.getTitle()).contain("Code");
        await sleep(4);
        let workbench = new Workbench();
        let commandprompt = await workbench.openCommandPrompt();
        commandprompt.sendKeys("Hallo");

        await workbench.executeCommand('Extest: Add Folder To Workspace');
        let prompt = await workbench.openCommandPrompt() as InputBox;
        await prompt.setText('C:\\projects\\my-first-project\\workspaces\\main\\tutorial-compiler\\');
        await prompt.sendKeys(Key.ENTER);

        await sleep(4);

        let control = await new ActivityBar().getViewControl('Explorer');
        await control.openView();

        await sleep(4);

        await workbench.executeCommand('Extest: Open File');
        prompt = await workbench.openCommandPrompt() as InputBox;
        await prompt.setText('C:\\projects\\my-first-project\\workspaces\\main\\tutorial-compiler\\package.json');
        await prompt.sendKeys(Key.ENTER);

        await sleep(5);
    });
});

function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
