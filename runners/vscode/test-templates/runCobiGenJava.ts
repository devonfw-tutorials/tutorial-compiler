import { expect } from 'chai';
import { WebDriver, Workbench, InputBox, ActivityBar, Key, SideBarView, CustomTreeSection, TerminalView } from 'vscode-extension-tester';
import { VSBrowser } from '../vsCodeBrowser';

describe('CobiGenJava Test', () => {
    let driver: WebDriver;

    before(() => {
        driver = VSBrowser.instance.driver;
    });

    it('runCobiGenJava', async function () {
        let workbench = new Workbench();
        let cobigenOutput = "";
        let prompt = await workbench.openCommandPrompt() as InputBox;
        await prompt.setText('> Extest: Add Folder To Workspace');
        await prompt.sendKeys(Key.ENTER);
        await prompt.setText('<%= directoryPath %>');
        await prompt.sendKeys(Key.ENTER);


        let explorer = await new ActivityBar().getViewControl("Explorer");
        await explorer.openView();

        let sections = await new SideBarView().getContent().getSections();
        let workspace = "";
        for(let i = 0; i < sections.length; i++) {
            let title = await sections[i].getTitle();
            if(title && title.toLowerCase().indexOf("workspace") > 0) workspace = await sections[i].getTitle();
        }
        if(workspace) {
            let workspaceSection = await new SideBarView().getContent().getSection(workspace) as CustomTreeSection;
            let files = await workspaceSection.openItem("<%= directoryName %>");
            for(let i = 0; i < files.length; i++) {
                let file = files[i];
                let fileText = await file.getText();
                if(fileText.indexOf("<%= filename %>") > -1) {
                    let menu = await file.openContextMenu();
                    let items = await menu.getItems();
                    for(let i = 0; i < items.length; i++) {
                        let text = await items[i].getText();
                        if(text.indexOf("CobiGen") > -1) {
                            await items[i].select();
                            break;
                        }
                    }
                    await sleep(50);
                    let terminal = new TerminalView();
                    await terminal.executeCommand("<%= cobigenTemplates %>");
                    await sleep(30);
                    cobigenOutput = await terminal.getText();
                }
            }
        }

        expect(cobigenOutput).to.not.be.empty;
        expect(cobigenOutput).not.contains("Exception");
        expect(cobigenOutput).contains("Commands were executed correctly");
    });
});

function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
