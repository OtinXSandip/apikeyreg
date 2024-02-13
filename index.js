const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint to retrieve all generated API keys
app.get('/api/apikeys', async (req, res) => {
    try {
        const apiKey = await getAllApiKeys();
        res.json({ apiKey });
    } catch (error) {
        console.error('Error getting API keys:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST endpoint to generate and save a new API key
app.post('/api/generate-apikey', async (req, res) => {
    try {
        const apiKey = generateRandomApiKey();
        await saveApiKey(apiKey);
        res.json({ apiKey, message: 'API Key generated and saved.' });
    } catch (error) {
        console.error('Error generating API key:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to retrieve all generated API keys from config.json
async function getAllApiKeys() {
    try {
        const config = await readConfig();
        return config.apiKey || [];
    } catch (error) {
        console.error('Error reading config.json:', error.message);
        throw error;
    }
}

// Function to generate a random 5-character API key
function generateRandomApiKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';

    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        apiKey += characters.charAt(randomIndex);
    }

    return apiKey;
}

// Function to read the current content of config.json
async function readConfig() {
    try {
        const data = await fs.readFile('config.json', 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, return an empty object
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

// Function to save the API key to config.json
async function saveApiKey(apiKey) {
    try {
        const config = await readConfig();
        config.apiKey = config.apiKey || [];
        config.apiKey.push(apiKey);

        await fs.writeFile('config.json', JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error writing to config.json:', error.message);
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
