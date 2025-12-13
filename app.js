const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
require('./config/db');
const Campaign = require('./models/campaignModel');
const path = require('path');

const { serveSitemap } = require('./utlis/sitemapGenerator');
const submissionController = require('./controllers/submissionController');

// -------------------- BASE DOMAIN --------------------
const BASE_DOMAIN =
  process.env.BACKEND_URL || "https://backend-url-indexing.vercel.app";

console.log(`🌐 Base domain: ${BASE_DOMAIN}`);

const app = express();

// -------------------- PORT ---------------------------
const PORT = process.env.PORT || 5000;

// -------------------- CORS ---------------------------
app.use(cors({
  origin: [
    "https://frontend-indexing-url.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

// -------------------- MIDDLEWARE ---------------------
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- API ROUTES ---------------------
app.post('/api/submit', submissionController.submitCampaign);
app.get('/api/credits', submissionController.getCredits);
app.get('/api/campaigns', submissionController.getCampaigns);

// -------------------- SITEMAPS -----------------------
app.get('/api/sitemap/:campaignId', serveSitemap(BASE_DOMAIN));

app.get('/sitemap-index.xml', async (req, res) => {
  try {
    const campaigns = await Campaign.find({}, '_id');
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

    xml += `</sitemapindex>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[Sitemap Index Error]', err);
    res.status(500).send('Internal server error');
  }
});

// -------------------- ROBOTS.TXT ---------------------
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin/
Sitemap: ${BASE_DOMAIN}/sitemap-index.xml`);
});

// -------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
