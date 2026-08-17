import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Consultation endpoint (server-side Gemini)
  app.post('/api/ai/consultation', async (req, res) => {
    try {
      const { messages } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.json({ reply: "Gemini API key is not configured yet. Please configure GEMINI_API_KEY in settings." });
      }

      const history = Array.isArray(messages)
        ? messages.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Previous Conversation:\n${history}\n\nNew Request: Based on the system goals, please respond to the latest user message.`,
        config: {
          systemInstruction: `You are "UX Mind", an elite AI UX Strategy Assistant embedded in the portfolio of a world-class UX Designer.
Your goal is to help visitors understand the Designer's value and brainstorm UX solutions.

Guidelines:
- Keep responses concise, professional, and insightful.
- Use UX terminology correctly (e.g., heuristics, cognitive load, information architecture).
- Focus on user-centric solutions.
- If asked about the designer, emphasize their focus on minimalism, user research, and data-driven design.
- If a user provides a business problem, offer 2-3 high-level UX strategy suggestions.
- Be encouraging and visionary.`,
          temperature: 0.8,
          topP: 0.95,
        },
      });

      res.json({ reply: response.text || "I'm having trouble thinking of a response right now. Let's try again in a moment." });
    } catch (err: any) {
      console.error('Gemini Consultation Error:', err);
      res.status(500).json({ error: 'Failed to generate consultation response' });
    }
  });

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const getRedirectUri = (req: express.Request) => {
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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

