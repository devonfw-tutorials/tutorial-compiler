import { expect } from 'chai';
import { Workbench, InputBox, ActivityBar, Key, SideBarView, CustomTreeSection, TerminalView } from 'vscode-extension-tester';

describe('CobiGenJava Test', () => {

    it('runCobiGenJava', async function () {
        let workbench = new Workbench();
        let terminalOutput = "";
        let timeoutFlag = false;
        let timeout: NodeJS.Timeout;
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

                    //timeout after 5 minutes
                    timeout = setTimeout(() => {
                        timeoutFlag = true;
                    }, 300000);

                    let terminal = new TerminalView();
                    terminalOutput = await terminal.getText();
                    while(terminalOutput.indexOf("Exception") == -1 && terminalOutput.indexOf("Please enter the number(s) of increment(s) that you want to generate separated by comma") == -1 && !timeoutFlag) {
                        await sleep(1);
                        terminalOutput = await terminal.getText();
                    }

                    if(terminalOutput.indexOf("Please enter the number(s) of increment(s) that you want to generate separated by comma") > -1) {
                        await terminal.executeCommand("<%= cobigenTemplates %>");
                        terminalOutput = await terminal.getText();
                        while(terminalOutput.indexOf("Exception") == -1 && terminalOutput.indexOf("Commands were executed correctly") == -1 && !timeoutFlag) {
                            await sleep(1);
                            terminalOutput = await terminal.getText();
                        }
                    }
                }
            }
        }

        if(timeout) {
            clearTimeout(timeout);
        }
        expect(terminalOutput).to.not.be.empty;
        expect(terminalOutput).not.contains("Exception");
        expect(terminalOutput).contains("Commands were executed correctly");
    });
});

function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
