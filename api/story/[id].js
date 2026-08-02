// /api/story/[id].js
// Vercel Serverless Function.
// Purpose: when someone shares a link like https://nidrno.com/story/<id>,
// link-preview bots (WhatsApp, Facebook, Twitter, Slack, Telegram, etc.)
// don't run JavaScript, so they only see whatever HTML the SERVER returns.
// Since Nidrno is a single-page app that reads everything from the URL
// hash (#story/id) on the client side, a bot hitting a real path
// (/story/id) would otherwise just get the generic homepage tags.
//
// This function:
//  1. Detects if the request is coming from a known bot's user-agent.
//  2. If it's a bot: fetches that post's title/excerpt/cover image from
//     Supabase and returns a tiny HTML page with the correct
//     og:title / og:description / og:image tags for that post.
//  3. If it's a real visitor: 302-redirects them straight into the app
//     at /#story/id, so the experience is unchanged for humans.

const SUPABASE_URL = 'https://tbcmtwljgpxgemqttubx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiY210d2xqZ3B4Z2VtcXR0dWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODUwMTEsImV4cCI6MjA5Nzc2MTAxMX0.hhuUQfhDWziv2gpp_dS0FU_b7flQKlV5EH4K19wSZZ0';

// Add more bot signatures here any time you notice a platform not
// generating a preview correctly.
const BOT_UA = /facebookexternalhit|WhatsApp|Twitterbot|Slackbot|Discordbot|TelegramBot|LinkedInBot|Pinterest|redditbot|Googlebot|bingbot|Applebot|Embedly|vkShare|SkypeUriPreview|Iframely|W3C_Validator/i;

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  const { id } = req.query;
  const ua = req.headers['user-agent'] || '';
  const isBot = BOT_UA.test(ua);
  const siteUrl = 'https://nidrno.com';

  // Real human visitors: send them straight into the app.
  if (!isBot) {
    res.writeHead(302, { Location: `/#story/${id}` });
    res.end();
    return;
  }

  // Bots: fetch this specific post's data so the preview card is correct.
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}&select=title,excerpt,cover_url,is_anonymous&status=eq.approved`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await resp.json();
    const post = Array.isArray(data) ? data[0] : null;

    const title = post ? `${post.title} | Nidrno` : 'Nidrno – Share Your Night Dreams';
    const description = post
      ? (post.excerpt || 'A dream shared on Nidrno.')
      : 'A community for night dreamers, travellers and storytellers.';
    const image = post && post.cover_url ? post.cover_url : `${siteUrl}/logo.png`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta property="og:type" content="article">
<meta property="og:url" content="${siteUrl}/story/${esc(id)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
</head>
<body>
<p>${esc(title)}</p>
<a href="/#story/${esc(id)}">Open on Nidrno</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (e) {
    // If anything goes wrong, fall back to sending the bot to the homepage.
    res.writeHead(302, { Location: '/' });
    res.end();
  }
};
