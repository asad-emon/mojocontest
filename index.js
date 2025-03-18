const puppeteer = require('puppeteer');
const { db, saveToDatabase } = require('./helpers/db');
const generator = require('./helpers/data-generator');

const refId = "ApqQB4zSKodYR5EKgHIqREheezXMWXRY";
let isRunning = true;


async function submitForm() {
    try {
        const browser = await puppeteer.launch({ headless: 'new' }); // Run in headless mode
        const page = await browser.newPage();

        // Capture AJAX responses
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/v1/auth/login')) { // Change to your API endpoint
                try {
                    // Check if the response has a JSON content-type
                    const contentType = response.headers()['content-type'] || '';
                    if (!contentType.includes('application/json')) {
                        console.log(`Skipping non-JSON response from: ${url}`);
                        return;
                    }

                    const jsonResponse = await response.json();
                    console.log('Captured API Response:', jsonResponse);

                    // Save successful response
                    await saveToDatabase(url, jsonResponse, null);
                } catch (err) {
                    console.log(`Error parsing JSON response from ${url}:`, err.message);

                    // Save error message
                    await saveToDatabase(url, null, err.message);
                }
            }
        });

        // Navigate to the page
        await page.goto(`https://www.mojoakijventure.com/registration?ref=${refId}`, {
            waitUntil: 'networkidle2',
            timeout: 60000 // Increase timeout if needed
        });

        // Fill form fields
        await page.type('#name', generator.generateBengaliName());
        await page.type('#phone', generator.generatePhoneNumber()); // Use a valid test phone number
        await page.type('#age', generator.generateAge()); // Use a valid age
        await page.type('#location', generator.generateBangladeshLocation()); // Use a valid location

        // Click submit
        await page.click('.flex.flex-col.gap-2.items-center.mx-auto.mt-5');

        // Wait for navigation to complete after form submission
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log("Form submitted successfully");

        await browser.close();
    } catch (ex) {
        console.error("Error:", ex);
    }
}

const runApp = () => {
    setInterval(submitForm, 5000);
}
runApp();