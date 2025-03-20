const puppeteer = require('puppeteer');
const { db, saveToDatabase } = require('./helpers/db');
const generator = require('./helpers/data-generator');

const refId = "ApqQB4zSKodYR5EKgHIqREheezXMWXRY";

let browser; // Store the browser instance
const MAX_PAGES = 5; // Number of concurrent form submissions

async function initializeBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' });
    }
}

async function submitForm(instance) {
    try {
        await initializeBrowser(); // Ensure browser is running

        const page = await browser.newPage();
        console.log(`Starting form submission ${instance}...`);

        // Capture AJAX responses
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/v1/auth/login')) {
                try {
                    const contentType = response.headers()['content-type'] || '';
                    if (!contentType.includes('application/json')) {
                        console.log(`Skipping non-JSON response from: ${url}`);
                        return;
                    }

                    const jsonResponse = await response.json();
                    console.log(`Captured API Response for instance ${instance}:`, jsonResponse);

                    // Save successful response
                    await saveToDatabase(url, jsonResponse, null);
                } catch (err) {
                    console.log(`Error parsing JSON response for instance ${instance}:`, err.message);

                    // Save error message
                    await saveToDatabase(url, null, err.message);
                }
            }
        });

        // Navigate to the page
        await page.goto(`https://www.mojoakijventure.com/registration?ref=${refId}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Fill form fields
        await page.type('#name', generator.generateBengaliName());
        await page.type('#phone', generator.generatePhoneNumber());
        await page.type('#age', generator.generateAge());
        await page.type('#location', generator.generateBangladeshLocation());

        // Click submit
        await page.click('.flex.flex-col.gap-2.items-center.mx-auto.mt-5');

        // Wait for navigation to complete after form submission
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log(`Form submitted successfully for instance ${instance}`);

        // Close only the page (not the browser)
        await page.close();
    } catch (ex) {
        console.error(`Error in instance ${instance}:`, ex);
    }
}

// Start multiple pages at once
(async () => {
    await initializeBrowser();

    while (true) { // Infinite loop to keep submitting forms
        console.log(`Starting ${MAX_PAGES} parallel submissions...`);
        await Promise.all(
            Array.from({ length: MAX_PAGES }, (_, i) => submitForm(i + 1))
        );
        // Optional delay before starting the next batch
        console.log(`Waiting before starting the next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
})();

// Gracefully close the browser when exiting the script
process.on('SIGINT', async () => {
    console.log("Closing browser...");
    if (browser) {
        await browser.close();
    }
    process.exit();
});
