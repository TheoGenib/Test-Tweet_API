import express from 'express';
import fetch from 'node-fetch';
import ejs from 'ejs';

const app = express();
// Acess token secret cSJkNAAqsPsOQ3WLWk6UmJNPJwMnxNmSf8Ot2wMZ0JBjN
//aCCESS TOKEN / 1583533082853998609-WSgOjiMGdqUwm9fGBqOPQ1r1PGc7be
//API KEY SECRET : 391qqr6AgL75tqBFAtEUnqnwgtykSBfOnwqYesO1FqQ0M44UFL
//Bearer : AAAAAAAAAAAAAAAAAAAAADEglgEAAAAAhbC0e2aMd9zrgzUkZwwt2WSF%2B1A%3DjntBuK6TtVp7YrFdJRbt5IPAGyjZk3QnlcuNTQkC2XSe5NpZbL
const API_KEY = 'AAAAAAAAAAAAAAAAAAAAADEglgEAAAAAhbC0e2aMd9zrgzUkZwwt2WSF%2B1A%3DjntBuK6TtVp7YrFdJRbt5IPAGyjZk3QnlcuNTQkC2XSe5NpZbL'; // Remplacez par votre propre clé d'API
const API_URL = 'https://api.twitter.com/2';

let lastTweetId = null;

app.use(express.static('style', { 'Content-Type': 'text/css' }));

// Route pour récupérer les tweets les plus récents sur le thème des retraites
app.get('/tweets', async (req, res) => {
    const query = req.query.query || 'retraites';
    const refresh = req.query.refresh === 'true';
    let url = `${API_URL}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=public_metrics,entities,author_id&expansions=author_id&user.fields=profile_image_url`;


    if (refresh && lastTweetId) {
        url += `&since_id=${lastTweetId}`;
    }
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'User-Agent': 'v2FilteredStreamJS',
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();

        // Retrieve the users associated with the tweets
        const users = data.includes.users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const tweets = data.data.map(tweet => ({
            text: tweet.text,
            user: users[tweet.author_id],
            retweets: tweet.public_metrics.retweet_count,
            likes: tweet.public_metrics.like_count,
            views: tweet.public_metrics.reply_count,
            profileImageUrl: users[tweet.author_id].profile_image_url
        }));
        lastTweetId = data.meta.newest_id;

        res.render('tweets', { tweets });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tweets.' });
    }
});

// Configure EJS comme moteur de template par défaut
app.set('view engine', 'ejs');
// Définir le chemin des vues (templates)
app.set('views', './views');

// Démarrage du serveur
app.listen(3000, () => {
    console.log('Le serveur est démarré sur le port 3000...');
});