const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// MongoDB connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'mySampleDatabase';

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const productsCollection = db.collection('products');

        // Route to get users and products
        app.get('/api/data', (req, res) => {
            Promise.all([
                usersCollection.find().toArray(),
                productsCollection.find().toArray()
            ])
            .then(([users, products]) => {
                res.json({ users, products });
            })
            .catch(error => res.status(500).send(error));
        });
    })
    .catch(error => console.error(error));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
