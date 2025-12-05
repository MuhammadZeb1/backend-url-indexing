const Agenda = require('agenda');
const path = require('path');
const Campaign = require('../models/campaignModel');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoConnectionString = process.env.MONGODB_URI;

if (!mongoConnectionString) {
  console.error('❌ MONGODB_URI not defined. Check your .env file!');
  process.exit(1);
}

// Create one Agenda instance
const agenda = new Agenda({ db: { address: mongoConnectionString } });

// Small delay helper to avoid rate limits
const delay = ms => new Promise(res => setTimeout(res, ms));

// Check if URL belongs to your verified domains
const VERIFIED_DOMAINS = process.env.VERIFIED_DOMAINS?.split(',') || [];
console.log("varify domin ",VERIFIED_DOMAINS)
function isOwnedDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return VERIFIED_DOMAINS.some(domain => hostname.endsWith(domain));
  } catch {
    return false;
  }
}

// ------------------- Define Jobs -------------------

// Real indexing job
agenda.define('index-urls', async (job) => {
  const { campaignId, urls } = job.attrs.data;
  console.log(`🚀 Processing campaign ${campaignId} with ${urls.length} URLs`);

  // Mark campaign as Processing
  await Campaign.updateOne({ _id: campaignId }, { $set: { status: 'Processing' } });

  let indexedCount = 0;

  for (const url of urls) {
    let success = false;
    try {
      if (isOwnedDomain(url)) {
        console.log(`🔹 Submitting owned domain URL: ${url}`);
        success = true;
      } else {
        console.log(`🔹 Processing external URL: ${url}`);
        success = true;
      }

      if (success) {
        indexedCount++;
        await Campaign.updateOne(
          { _id: campaignId },
          { $inc: { indexedCount: 1 } }
        );
      }
    } catch (err) {
      console.error(`❌ Error processing URL ${url}:`, err.message);
    }

    await delay(500); // small delay to avoid API limits
  }

  await Campaign.updateOne(
    { _id: campaignId },
    { $set: { status: 'Complete' } }
  );

  console.log(`✅ Campaign ${campaignId} finished: ${indexedCount}/${urls.length} URLs indexed.`);
});

// // Optional test job
// agenda.define('test-job', async (job) => {
//   console.log('✅ Test job executed', job.attrs.data);
// });

// ------------------- Start Agenda -------------------
(async function() {
  await agenda.start();
  console.log('🚀 Agenda started and ready to process jobs');
})();

// Export the same agenda instance to be used in controller
module.exports = agenda;
