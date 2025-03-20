const { chromium } = require('playwright');
const { quizdb, saveToQuizDatabase, getQuizById } = require('./helpers/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let currentQuestion = null;

let currentQuestionNo = 1;

async function callGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent("Just return the number of the correct answer: " + prompt);
    console.log(`Question ${currentQuestionNo}: ` + result.response.text());
    currentQuestionNo++;
}

const formatQuestionData = (data) => {
    const formattedData = data.options.map((item) => {
        return obj = {
            question_id: data.questionId,
            question: data.question,
            option_id: item.optionId,
            option: item.option,
            correct: null,
        }
    });
    return formattedData;
}

async function callGPT(prompt) {
    const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: "Choose the correct answer from the given options and return only the number (1-4): " + prompt,
            },
        ],
        max_tokens: 5, // Ensures a short response
    });

    console.log("GPT: " + completion.choices[0].message.content);
}

(async () => {
    const browser = await chromium.launch({ headless: false }); // Open real browser
    const page = await browser.newPage();

    // Listen to all responses for a specific endpoint
    page.on('response', async (response) => {
        if (response.url().includes('/game/failed?type=WRONG')) {  // Replace with your target API
            currentQuestionNo = 1
            const data = formatQuestionData(currentQuestion);
            saveToQuizDatabase(data, null)
        }

        if (response.url().includes('/v1/quiz/start') || response.url().includes('v1/quiz/next-question')) {  // Replace with your target API
            try {
                const jsonData = await response.json(); // Get JSON response

                currentQuestion = jsonData.data;

                const questionId = jsonData.data.questionId; // Extract question

                const data = await getQuizById(questionId); // Fetch quiz data by ID

                if (data) {
                    console.log("Existing Quiz Data:", data);
                    return
                } 

                const question = jsonData.data.question; // Extract question

                let options = jsonData.data.options;   // Extract options
                options = options.map((option, index) => (index + 1) + ":" + option.option);

                const prompt = `${question} ${options.join(", ")}`; // Create prompt string

                await callGemini(prompt); // Assuming callGemini is async
                // await callGPT(prompt); // Assuming callGPT is async
            } catch (error) {
                console.error("Error processing response:", error);
            }
        }
    });


    await page.goto('https://mojoakijventure.com/registration');  // Replace with your web app

    await page.fill('#name', 'Shoheli Islam'); // Replace with actual input selector
    await page.fill('#phone', '01922099457');
    await page.fill('#age', '23');
    await page.fill('#location', 'Kawniya, Barishal');

    console.log("Browse manually, then press Enter in the terminal to close...");
    await new Promise(resolve => process.stdin.once('data', resolve));

    await browser.close();
})();
