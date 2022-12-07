const express = require('express');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');
const url = require('url'); 
const spotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new spotifyWebApi({
    redirectUri: 'http://localhost:8080/callback',
    clientId: 'a11dbd03bf194acb920593f6636c2740',
    clientSecret: '8b79ee3281aa47b7af9d6888262d90ff'
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

const app = express();
const router = express.Router();

app.engine('html', ejs.renderFile);

app.use(express.static(path.join(__dirname, '/css')));
app.use(express.static(path.join(__dirname, '/img')));
app.use(express.static(path.join(__dirname, '/js')));


router.get('/', (req, res, next) => {
    if (spotifyApi.getAccessToken()) {
        let me = {};

        spotifyApi.getMe().then(data => {
            me = {
                username: data.body.display_name,
                email: data.body.email,
                profile_image: data.body.images[0].url,
                member: data.body.product
            }

            res.render('index.html', {
                username: me.username,
                profile_image: data.body.images[0].url
            });
        });
    } else {
        res.sendFile(path.join(__dirname + '/index.html'));
    }

});

router.get('/login', (req, res, next) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

router.get('/exit', (req, res, next) => {
    spotifyApi.resetAccessToken();
    res.redirect('/');
});

router.get('/callback', (req, res, next) => {
    const error = req.query.error;
    const code = req.query.code;
    
    if (error) {
        console.error('erro', error);
        res.send(`erro: ${error}`);
        return;
    }

    //res.send('token inserido com sucesso! vá para <a href="http://localhost:8080/album"> esse link </a>');

    spotifyApi.authorizationCodeGrant(code).then(data => {
        const access_token = data.body['access_token'];
        token = access_token;
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
            console.log('access_token:', token);
        }, expires_in / 2 * 1000);
        res.redirect('/');
    });
});

router.get('/search', (req, res, next) => {
    let a = req.protocol + '://' + req.get('host') + req.originalUrl; // pega a url completa
    let q = url.parse(a, true);
    let qdata = q.query;
    let song = qdata.song;

    if (!song) {
        res.redirect('/');
    }

    /* let me = {};

    spotifyApi.getMe().then(data => {
        me = {
            search: song,
            username: data.body.display_name,
            email: data.body.email,
            profile_image: data.body.images[0].url,
            member: data.body.product
        }
    }); */

    spotifyApi.searchTracks(song, { limit: 1 }).then(data => {
        let trackId = data.body.tracks.items[0].id;
        let date = Date.now();
        res.render('search.html', {
            songSrc: "https://open.spotify.com/embed/track/" + trackId,
            data: date
        });
    });
});


/********* **********/

app.use('/', router);

app.listen(8080, (req, res, next) => {
    console.log('servidor rodando');
});