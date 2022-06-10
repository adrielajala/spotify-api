import 'dotenv/config';
import express from 'express';
import routes from './routes/routes.js';
import cors from 'cors';
import SpotifyWebApi from 'spotify-web-api-node';
import path from 'path';
import ejs from 'ejs';

const __dirname = path.resolve();

const app = express();

const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.SPOTIFY_REDIRECT_URL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

export default spotifyApi;

app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(routes);
app.use(cors());

app.listen(8080, (req, res, next) => {
    console.log('servidor rodando');
});
