const express = require('express');
const cors = require('cors');
const ytSearch = require('yt-search'); 

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query is required" });

    console.log(`\n🔍 YouTube par dhoondh raha hu: "${query}"`);

    try {
        const result = await ytSearch(query);
        const videos = result.videos.slice(0, 10); 

        if (!videos || videos.length === 0) {
            return res.status(404).json({ error: "Koi gaana nahi mila bhai." });
        }

        const songs = videos.map(video => {
            const audioStreamUrl = `https://inv.tux.pizza/latest_version?id=${video.videoId}&itag=140`;

            return {
                id: video.videoId,
                title: video.title,
                artist: video.author.name,
                cover: video.thumbnail,
                url: audioStreamUrl 
            };
        });

        console.log(`✅ Success! ${songs.length} full gaane mil gaye.`);
        res.json({ results: songs });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Kuch gadbad ho gayi bhai." });
    }
});

// Render ke liye process.env.PORT zaroori hota hai
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Ultimate BeatsVibe Server running on port ${PORT}`);
});