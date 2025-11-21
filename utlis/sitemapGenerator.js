// NOTE: You must replace the path below with the correct path to your Campaign model
const Campaign = require("../models/campaignModel");
const fs = require("fs");
const path = require("path");

/**
 * Generates an XML sitemap string from an array of URLs.
 * @param {string[]} urls - Array of URLs to include in the sitemap.
 * @param {string} campaignId - The ID of the campaign, mainly for logging/context.
 * @returns {string} - A complete XML sitemap string.
 */
function generateSitemapXml(urls, campaignId) {
  if (!urls || urls.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const lastModDate = new Date().toISOString().split("T")[0];

  urls.forEach((url) => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      xml += `
    <url>
        <loc>${url}</loc>
        <lastmod>${lastModDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`;
    }
  });

  xml += `
</urlset>`;

  console.log(
    `[Sitemap Generator] Successfully generated sitemap XML for campaign ${campaignId} with ${urls.length} URLs.`
  );
  return xml;
}

/**
 * Express middleware to fetch campaign data and serve the sitemap XML.
 */
async function serveSitemap(req, res) {
  const { campaignId } = req.params;
  console.log("REQUESTED SITEMAP:", campaignId);

  if (!campaignId) {
    return res.status(400).send("Campaign ID is required.");
  }

  try {
    // Fetch the campaign document, only selecting the sitemapUrls field
    const campaign = await Campaign.findById(campaignId, "urls").exec();
    console.log("Fetched campaign:", campaign);

    if (!campaign) {
      return res.status(404).send("Campaign not found.");
    }

    const sitemapXml = generateSitemapXml(campaign.urls, campaignId);

    // Send the correct content type for XML
    res.set("Content-Type", "application/xml");
    res.send(sitemapXml);
  } catch (error) {
    console.error(
      `[Sitemap Error] Failed to serve sitemap for ${campaignId}:`,
      error
    );
    res.status(500).send("Internal server error while generating sitemap.");
  }
}
async function updateSitemap() {
  const campaigns = await Campaign.find({}, "urls").exec();

  let xml =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const lastModDate = new Date().toISOString().split("T")[0];

  campaigns.forEach((c) => {
    c.urls.forEach((url) => {
      xml += `
        <url>
          <loc>${url}</loc>
          <lastmod>${lastModDate}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;
    });
  });

  xml += "</urlset>";

  // Save to public folder
  fs.writeFileSync(path.join(__dirname, "../public/sitemap-index.xml"), xml);
  console.log("[Sitemap] sitemap-index.xml updated!");
}

module.exports = {
  serveSitemap,
  generateSitemapXml,
  updateSitemap,
};
