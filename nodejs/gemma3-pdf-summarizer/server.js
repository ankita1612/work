const express = require('express');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Or latest available

app.use(express.json());

app.post('/summarize', async (req, res) => {
    try {
        const { pdfPath } = req.body;
        const pdfBuffer = fs.readFileSync(pdfPath);

        const pdfData = await pdfParse(pdfBuffer);
        const fullText = pdfData.text;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: "Summarize the following:\n\n" + fullText }]
                }
            ]
        });

        const response = await result.response;
        res.json({ summary: response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
