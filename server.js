const express = require('express');
const cors = require('cors');
const ytSearch = require('yt-search'); 

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query is required" });

    console.log(`\n🔍 Searching for: "${query}"`);

    try {
        const result = await ytSearch(query);
        const videos = result.videos.slice(0, 10); 

        if (!videos || videos.length === 0) {
            return res.status(404).json({ error: "No songs found." });
        }

        const songs = videos.map(video => {
            // Updated stable Invidious server link
            const audioStreamUrl = `https://invidious.nerdvpn.de/latest_version?id=${video.videoId}&itag=140`;

            return {
                id: video.videoId,
                title: video.title,
                artist: video.author.name,
                cover: video.thumbnail,
                url: audioStreamUrl 
            };
        });

        res.json({ results: songs });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Server error occurred." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 BeatsVibe Server running on port ${PORT}`);
});