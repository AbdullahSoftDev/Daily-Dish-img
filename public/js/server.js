// server.js (Backend API)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI API route
app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional chef and recipe creator. Always respond with valid JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Failed to generate recipe' });
    }
});

app.listen(3001, () => {
    console.log('Backend server running on port 3001');
});