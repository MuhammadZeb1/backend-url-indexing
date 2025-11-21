const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://zeb11afridi_db_user:r2y4bK2X4vaoCXtn@cluster0.ygn6hhw.mongodb.net/indexing-url?retryWrites=true&w=majority';

// const mongoURI = 'mongodb://localhost:27017/IndexingToolDB';
// const mongoURI ='mongodb+srv://zeb11afridi_db_user:r2y4bK2X4vaoCXtn@cluster0.ygn6hhw.mongodb.net/indexing-url?retryWrites=true&w=majority
// ';


mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// const mongoose = require('mongoose');

// // Atlas URI

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connected successfully.'))
//     .catch(err => console.error('MongoDB connection error:', err));
