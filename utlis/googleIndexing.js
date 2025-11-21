// utils/googleIndexing.js
const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

const KEY_FILE_PATH = path.join(__dirname, '../google-service-account.json');

async function submitToGoogle(url) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });
        const authClient = await auth.getClient();
        const requestBody = { url, type: 'URL_UPDATED' };

        const response = await axios.post(
            'https://indexing.googleapis.com/v3/urlnotifications:publish',
            requestBody,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authClient.credentials.access_token}` } }
        );

        if (response.status === 200 || response.status === 202) {
            console.log(`[Google API] Successfully submitted: ${url}`);
            return true;
        }
    } catch (err) {
        console.error(`[Google API Error] Failed: ${url} → ${err.message}`);
    }
    return false;
}

module.exports = { submitToGoogle };
