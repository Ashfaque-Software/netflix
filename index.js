const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');

// Connection URI
const uri = 'mongodb://localhost:27017/netflix';

// Define the schema for movies
const movieSchema = new mongoose.Schema({
    movie_id: Number,
    director_name: String,
    actor_name: String,
    year_of_release: Number,
    imdb_rating: Number,
    genre: String,
    language: String
});

// Create a model based on the schema
const Movie = mongoose.model('Movie', movieSchema);

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected successfully to MongoDB');

        // Read data from the JSON file
        fs.readFile('data.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                return;
            }

            const moviesData = JSON.parse(data);

            // Insert data into MongoDB
            Movie.insertMany(moviesData)
                .then(() => console.log('Data inserted successfully'))
                .catch(err => console.error('Error inserting data:', err));
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/movies') {
        // Query data
        Movie.find({ genre: { $in: ["horror", "thriller"] } })
            .then(horrorThrillerMovies => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(horrorThrillerMovies));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                console.error('Error querying movies:', err);
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
