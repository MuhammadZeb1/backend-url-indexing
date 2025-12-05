const agenda = require('./agenda');
const Campaign = require('../models/campaignModel');
const { submitToGoogle, isOwnedDomain } = require('../utlis/googleIndexing.js');

console.log("khan")
agenda.define("index-urls", async job => {
    console.log("first")
  const { campaignId, urls } = job.attrs.data;
  console.log("Processing campaign:", campaignId, urls);
  await Campaign.updateOne({ _id: campaignId }, { $set: { status: "Processing" } });
  let count = 0;
  console.log("1")

  for (let url of urls) {
    let ok = false;
    try {
      if (isOwnedDomain(url)) ok = await submitToGoogle(url);
      else ok = true; // Bing / sitemap logic
      console.log("1")
    } catch (err) {
      console.error(err.message);
    }

    if (ok) {
      await Campaign.updateOne({ _id: campaignId }, { $inc: { indexedCount: 1 } });
      count++;
    }

    await new Promise(res => setTimeout(res, 500));
  }
  console.log("2")

  await Campaign.updateOne({ _id: campaignId }, { $set: { status: "Complete" } });
  console.log(`Campaign ${campaignId}: completed ${count}/${urls.length}`);
});

(async () => await agenda.start())();
