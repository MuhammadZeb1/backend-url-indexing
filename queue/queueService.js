const { Queue } = require('bullmq');

// NOTE: Redis must be running on this host/port!
const connection = { host: '127.0.0.1', port: 6379 }; 

// Create and export the indexing queue instance
exports.indexingQueue = new Queue('indexingQueue', { connection });

console.log('BullMQ Queue initialized.');