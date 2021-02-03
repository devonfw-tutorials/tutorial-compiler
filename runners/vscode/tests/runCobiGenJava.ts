// Import all the necessary objects from extension tester
//import { Notification, VSBrowser, Workbench, WebDriver, NotificationType } from 'vscode-extension-tester';
//We are using chai for assertions, feel free to use whichever package you like
import { expect } from 'chai';
//import { VSBrowser } from '../vsBrowser';
import { WebDriver, Workbench, VSBrowser } from 'vscode-extension-tester';

// Test suite is in standard Mocha BDD format
describe('Hello World Example UI Tests', () => {
    let driver: WebDriver;

    before(() => {
    //     // Retrieve a handle for the internal WebDriver instance so 
    //     // we can use all its functionality along with the tester API
        driver = VSBrowser.instance.driver;
    });

    // Test the Hello World command does what we expect
    it('Hello World Command should show a notification with the correct text', async function () {
        console.log("Title: " + await VSBrowser.instance.driver.getTitle());
        expect(await VSBrowser.instance.driver.getTitle()).contain("Code");

        let workbench = new Workbench();
        let commandprompt = await workbench.openCommandPrompt();
        commandprompt.sendKeys("Hallo");

        console.log(await driver.getTitle());
    });
});
