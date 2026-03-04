const express = require('express');
const cors = require('cors');
const ytSearch = require('yt-search'); // Yeh naya package jo kabhi fail nahi hota!

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query is required" });

    console.log(`\n🔍 YouTube par dhoondh raha hu: "${query}"`);

    try {
        // Seedha YouTube se search kar rahe hain bina kisi API limit ke
        const result = await ytSearch(query);
        const videos = result.videos.slice(0, 10); // Top 10 gaane

        if (!videos || videos.length === 0) {
            return res.status(404).json({ error: "Koi gaana nahi mila bhai." });
        }

        const songs = videos.map(video => {
            // Hum Invidious (YouTube ka audio bypass) use kar rahe hain
            // itag=140 ka matlab hai 128kbps M4A (Full High-Quality Audio)
            const audioStreamUrl = `https://inv.tux.pizza/latest_version?id=${video.videoId}&itag=140`;

            return {
                id: video.videoId,
                title: video.title,
                artist: video.author.name,
                cover: video.thumbnail,
                url: audioStreamUrl // Pura full-length gaana!
            };
        });

        console.log(`✅ Success! ${songs.length} full gaane mil gaye.`);
        res.json({ results: songs });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Kuch gadbad ho gayi bhai." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Ultimate BeatsVibe Server running at http://localhost:${PORT}`);
});