import 'dotenv/config';
import express, { Router } from 'express';
import spotifyApi from '../app';
import url from 'url';


const routes = express.Router();
routes.use(express.json());

routes.get('/', (req, res, next) => {
    res.render('index.html');
});

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

routes.get('/login', (req, res, next) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

routes.get('/callback', (req, res, next) => {
    const error = req.query.error;
    const code = req.query.code;
    
    if (error) {
        console.error('erro', error);
        res.send(`erro: ${error}`);
        return;
    }

    res.send('token inserido com sucesso! vá para <a href="http://localhost:8080/album"> esse link </a>');

    spotifyApi.authorizationCodeGrant(code).then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
      
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
      
        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);
        console.log('expires in:', expires_in);

        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const access_token = data.body['access_token'];
            spotifyApi.setAccessToken(access_token);
        
            console.log('The access token has been refreshed!');
            console.log('access_token:', access_token);
        }, expires_in / 2 * 1000)
    });
});

routes.get('/album', (req, res, next) => {
    spotifyApi.getAlbum('2G4AUqfwxcV1UdQjm2ouYr').then(
        function (data) {
            //res.send(data.body.artists[0].name);
            //res.send('<img src="' + data.body.images[0].url + '">');
            res.send('<img src="' + data.body.images[1].url + '"> \n \n \n <p>' + data.body.artists[0].name + '</p> \n \n \n' + data.body.name + '\n \n \n');
        },
        function (err) {
            res.send(err);
        }
    );    
});

routes.get('/play', (req, res, next) => {
    let track = '6c6W25YoDGjTq3qSPOga5t?si=18e1794ec3c84530';
    res.send('<iframe src="https://open.spotify.com/embed/track/' + track + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
});

routes.get('/toptracks', (req, res, next) => {
    spotifyApi.getMyTopTracks().then(data => {
        res.send(
            data.body.items[0].artists[0].name + ' - ' + data.body.items[0].name + '\n \n <p>'
            +
            data.body.items[1].artists[0].name + ' - ' + data.body.items[1].name + '\n \n <p>'
            +
            data.body.items[2].artists[0].name + ' - ' + data.body.items[2].name + '\n \n <p>'
            +
            data.body.items[3].artists[0].name + ' - ' + data.body.items[3].name + '\n \n <p>'
            +
            data.body.items[4].artists[0].name + ' - ' + data.body.items[4].name + '\n \n <p>'
        );
    })
});

routes.get('/search', async (req, res, next) => {
    let a = req.protocol + '://' + req.get('host') + req.originalUrl;
    let q = url.parse(a, true);
    let qdata = q.query;
    let song = qdata.song;

    spotifyApi.searchTracks(song, { limit: 1 }).then(data => {
        let trackId = data.body.tracks.items[0].id;
        res.send('<iframe src="https://open.spotify.com/embed/track/' + trackId + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
    });
});

export default routes;
