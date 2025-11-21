const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load .env first
console.log("DOTENV VARIABLES:", process.env.GOOGLE_PROJECT_ID, process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY ? "OK" : "MISSING");

const cors = require('cors');
require('./config/db'); // Initialize MongoDB connection
const Campaign = require('./models/campaignModel'); // adjust path if needed
const path = require('path');

const { serveSitemap } = require('./utlis/sitemapGenerator');
const submissionController = require('./controllers/submissionController');
const BASE_DOMAIN = 'https://www.orung.com';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/submit', submissionController.submitCampaign);
app.get('/api/credits', submissionController.getCredits);
app.get('/api/campaigns', submissionController.getCampaigns);
app.get('/api/sitemap/:campaignId', serveSitemap);

// 🔹 Sitemap Index Route
app.get('/sitemap-index.xml', async (req, res) => {
    try {
        const campaigns = await Campaign.find({}, '_id').exec();
        const lastModDate = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        campaigns.forEach(campaign => {
            xml += `
  <sitemap>
    <loc>${BASE_DOMAIN}/api/sitemap/${campaign._id}</loc>
    <lastmod>${lastModDate}</lastmod>
  </sitemap>`;
        });

        xml += `
</sitemapindex>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('[Sitemap Index Error]', err);
        res.status(500).send('Internal server error');
    }
});

// 🔹 Robots.txt Route
app.get('/robots.txt', async (req, res) => {
    try {
        const campaigns = await Campaign.find({}, '_id').exec();

        let robotsTxt = `User-agent: *\nDisallow: /admin/\n`;

        // Add the sitemap index instead of individual sitemaps
        robotsTxt += `Sitemap: ${BASE_DOMAIN}/sitemap-index.xml\n`;

        res.type('text/plain');
        res.send(robotsTxt);

    } catch (err) {
        console.error('[robots.txt Error]', err);
        res.status(500).send('Internal server error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
