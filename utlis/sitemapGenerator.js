// utils/sitemapGenerator.js
// Removed dependencies: fs and path are not needed for dynamic XML generation.
const Campaign = require("../models/campaignModel");

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

	const uRls= urls.forEach((url) => {
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
  console.log("url",uRls)

	xml += `
</urlset>`;

	console.log(
		`[Sitemap Generator] Successfully generated sitemap XML for campaign ${campaignId} with ${urls.length} sitemapUrls.`
	);
	return xml;
}

/**
 * Express route handler to fetch campaign data and serve the sitemap XML.
 * This is the public endpoint: /api/sitemap/:campaignId
 */
async function serveSitemap(req, res) {
	const { campaignId } = req.params;

	if (!campaignId) return res.status(400).send("Campaign ID required");

	try {
		// Fetch only 'sitemapUrls' to restrict the sitemap to 3rd party links
		const campaign = await Campaign.findById(campaignId, "sitemapUrls").exec(); 
		if (!campaign) return res.status(404).send("Campaign not found");

		// Generate XML using the retrieved URLs
		const sitemapXml = generateSitemapXml(campaign.sitemapUrls, campaignId);

		// Send the correct content type for XML
		res.set("Content-Type", "application/xml");
		res.send(sitemapXml);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error while generating sitemap.");
	}
}


// This utility generates the XML string for the master sitemap index (if needed)
async function updateSitemap() {
	// For simplicity, this currently fetches all campaign URLs for a hypothetical master sitemap.
	const campaigns = await Campaign.find({}, "urls").exec();
	const lastModDate = new Date().toISOString().split("T")[0];

	let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

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

	xml += `</urlset>`;

	console.log("[Sitemap] sitemap XML generated dynamically for all campaigns");
	return xml; // Returns the XML string, does not save it.
}


module.exports = {
	serveSitemap,
	generateSitemapXml,
	updateSitemap,
};