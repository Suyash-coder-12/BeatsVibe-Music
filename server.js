const express = require('express');
const cors = require('cors');
const ytSearch = require('yt-search'); 
const ytdl = require('@distube/ytdl-core'); // Naya Brahmastra!

const app = express();
app.use(cors());

// 1. Gaane Search karne ka raasta
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

        const songs = videos.map(video => ({
            id: video.videoId,
            title: video.title,
            artist: video.author.name,
            cover: video.thumbnail
        }));

        res.json({ results: songs });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Server error occurred." });
    }
});

// 2. NAYA: Gaane Play karne ka raasta (Tera apna streaming server)
app.get('/api/play', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Video ID missing" });

    try {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // ytdl-core seedha YouTube se audio nikal kar tere player ko bhejega
        ytdl(youtubeUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // Buffering rokne ke liye
        }).pipe(res);

    } catch (error) {
        console.error("❌ Streaming Error:", error.message);
        res.status(500).json({ error: "Audio play nahi ho paaya" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Ultimate BeatsVibe Server running on port ${PORT}`);
});