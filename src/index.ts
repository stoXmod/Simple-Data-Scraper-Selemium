import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as fs from 'fs';

async function scrapeTouristGuides() {
    // Initialize the WebDriver
    let driver: WebDriver = await new Builder().forBrowser('chrome').build();

    try {
        // Start at the first page
        await driver.get('https://srilanka.travel/tourist-guides?page=1');
        let allRecords: any[] = [];

        while (true) {
            // Wait for the guides to be loaded
            await driver.wait(until.elementsLocated(By.css('.travel-guide-inner')), 10000);

            // Find all the guide elements on the page
            let guides = await driver.findElements(By.css('.travel-guide-inner'));
            console.log('🤖 Guides cards found: ',guides.length)
            for (let guide of guides) {
                // get the className holds "row" from span 6 div wrapper and push to a array
                let guideWrapper = await guide.findElement(By.css('.span6'));

                // Extract the details from each guide
                let name = await guide.findElement(By.css('h4')).getText();
                let telephoneNumber = await guide.findElement(By.css('div.row:nth-of-type(3)>.span5C>p>span')).getText();
                let emailAddress = await guide.findElement(By.css('div.row:nth-of-type(6)>.span5C>p>span')).getText();
                console.log('✅: fetched user: name/phone number/email => ',name, telephoneNumber, emailAddress)
                // ... extract other details similarly

                // Add the extracted details to the allRecords array
                allRecords.push({
                    name: name,
                    phoneNumber: telephoneNumber,
                    email: emailAddress,
                });
            }

            // Find the button or element that closes the cookie consent dialog
            try {
                let cookieConsentButton = await driver.findElement(By.css('button.cc-btn'));
                if (cookieConsentButton){
                    await cookieConsentButton.click();
                }
            }catch(ex){
                console.log('Couln\'t find the cookie consent button')
            }

            // After handling the dialog, attempt to click the link again
            let nextButton = await driver.findElement(By.css('div.pagination a:nth-last-of-type(2)'));
            if (nextButton) {
                await driver.executeScript('arguments[0].scrollIntoView(true);', nextButton);
                await nextButton.click();
                await driver.sleep(2000);
            } else {
            break
            }
        }

        // Write the JSON output to a file
        fs.writeFileSync('../out/tourist_guides.json', JSON.stringify(allRecords, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        // Quit the WebDriver session
        await driver.quit();
    }
}

scrapeTouristGuides().then(()=> {
    console.log('🚀🚀🚀🚀 Scraping completed!')
}).catch((ex) => {
    console.log('❌❌❌ Scraping failed with error: ',ex)
})
