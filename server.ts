import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const getRedirectUri = (req: express.Request) => {
    // In our environment, we use the APP_URL provided by the user
    // or we can use the origin from the request if it's reliable.
    // The instructions say use APP_URL env var if available.
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    return `${origin}/api/auth/spotify/callback`;
  };

  // Spotify Auth URL
  app.get('/api/auth/spotify/url', (req, res) => {
    if (!SPOTIFY_CLIENT_ID) {
      return res.status(500).json({ error: 'Spotify Client ID not configured' });
    }

    const scope = 'user-read-currently-playing user-read-recently-played';
    const redirectUri = getRedirectUri(req);
    
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scope,
      show_dialog: 'true'
    });

    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  // Spotify Auth Callback
  app.get('/api/auth/spotify/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    const redirectUri = getRedirectUri(req);

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error_description || data.error);

      // Set tokens in cookies
      res.cookie('spotify_access_token', data.access_token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: data.expires_in * 1000 
      });
      
      if (data.refresh_token) {
        res.cookie('spotify_refresh_token', data.refresh_token, { 
          httpOnly: true, 
          secure: true, 
          sameSite: 'none',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'spotify' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Spotify Auth Error:', error);
      res.status(500).send('Authentication failed: ' + error.message);
    }
  });

  // Spotify Now Playing
  app.get('/api/spotify/now-playing', async (req, res) => {
    let accessToken = req.cookies.spotify_access_token;
    const refreshToken = req.cookies.spotify_refresh_token;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Refresh token if needed
    if (!accessToken && refreshToken) {
      try {
        const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        res.cookie('spotify_access_token', accessToken, { 
          httpOnly: true, 
          secure: true, 
          sameSite: 'none',
          maxAge: refreshData.expires_in * 1000 
        });
      } catch (e) {
        return res.status(401).json({ error: 'Token refresh failed' });
      }
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.status === 204 || response.status > 400) {
        // Nothing playing, try recently played
        const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const recentData = await recentResponse.json();
        if (recentData.items && recentData.items.length > 0) {
          const track = recentData.items[0].track;
          return res.json({
            isPlaying: false,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            albumImageUrl: track.album.images[0].url,
            songUrl: track.external_urls.spotify
          });
        }
        return res.json({ isPlaying: false });
      }

      const data = await response.json();
      return res.json({
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(', '),
        albumImageUrl: data.item.album.images[0].url,
        songUrl: data.item.external_urls.spotify
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch now playing' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
