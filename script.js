// DHYAN DE: Yahan tera Render wala LIVE link daal diya hai!
const API_URL = "https://beatsvibe-music.onrender.com/api/search?q=";

let currentAudio = new Audio();
let isPlaying = false;
let currentSongData = null; 
let downloadedSongs = []; 

function switchTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links li, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId + 'Section').classList.add('active');
    event.currentTarget.classList.add('active');

    if(tabId === 'search') {
        document.getElementById('topSearchBar').style.display = 'block';
        document.getElementById('searchInput').focus();
    }
    if(tabId === 'library') renderLibrary();
}

function triggerSearch(query) {
    document.getElementById('searchInput').value = query;
    switchTab('home');
    searchSongs(query);
}

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        switchTab('home'); 
        searchSongs(this.value);
    }
});

window.onload = () => searchSongs("Trending Hindi Songs 2024");

async function searchSongs(query) {
    if (!query) return;
    document.getElementById('sectionTitle').innerText = `Results for "${query}"`;
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '<p style="color: #00f2fe;">Finding full audio tracks...</p>';

    try {
        const response = await fetch(API_URL + encodeURIComponent(query));
        const data = await response.json();
        
        if (data.error || !data.results || data.results.length === 0) {
            grid.innerHTML = `<p style="color: red;">${data.error || "No songs found."}</p>`;
            return;
        }

        grid.innerHTML = ''; 
        data.results.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${song.cover}" loading="lazy" alt="Cover">
                <div class="play-btn"><i class="fa-solid fa-play"></i></div>
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            `;
            card.onclick = () => loadAndPlaySong(song.url, song.title, song.artist, song.cover);
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p style="color: red;">Server se connect nahi ho paaya!</p>';
    }
}

function loadAndPlaySong(url, title, artist, cover) {
    document.getElementById('currentTitle').innerText = title;
    document.getElementById('currentArtist').innerText = artist;
    const coverImg = document.getElementById('currentCover');
    coverImg.src = cover;
    coverImg.style.display = 'block';

    currentSongData = { title, artist, cover, url };

    currentAudio.src = url;
    currentAudio.play();
    isPlaying = true;
    updatePlayPauseIcon();
}

function togglePlay() {
    if (!currentAudio.src) return; 
    isPlaying ? currentAudio.pause() : currentAudio.play();
    isPlaying = !isPlaying;
    updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
    const btn = document.getElementById('playPauseBtn');
    if (isPlaying) {
        btn.classList.remove('fa-play');
        btn.classList.add('fa-pause');
    } else {
        btn.classList.remove('fa-pause');
        btn.classList.add('fa-play');
    }
}

currentAudio.addEventListener('timeupdate', () => {
    if(currentAudio.duration) {
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
    }
});

document.getElementById('progressContainer').addEventListener('click', function(e) {
    if(currentAudio.duration) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = currentAudio.duration;
        currentAudio.currentTime = (clickX / width) * duration;
    }
});

function downloadCurrentSong() {
    if (!currentSongData) { alert("Play a song first!"); return; }
    const alreadyExists = downloadedSongs.find(song => song.title === currentSongData.title);
    if(alreadyExists) { alert("Song is already in your Library!"); return; }
    downloadedSongs.push(currentSongData);
    alert(`"${currentSongData.title}" downloaded to Your Library!`);
}

function renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';
    if(downloadedSongs.length === 0) {
        grid.innerHTML = '<p style="color: #a0a0a0;">Your library is empty. Click the download icon on the player!</p>';
        return;
    }
    downloadedSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${song.cover}" loading="lazy" alt="Cover">
            <div class="play-btn"><i class="fa-solid fa-play"></i></div>
            <div class="title">${song.title}</div>
            <div class="artist">${song.artist}</div>
        `;
        card.onclick = () => loadAndPlaySong(song.url, song.title, song.artist, song.cover);
        grid.appendChild(card);
    });
}

const modal = document.getElementById('authModal');
function openModal() { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }