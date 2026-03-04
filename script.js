// Tera apna Render server (API_BASE)
const API_BASE = "https://beatsvibe-music.onrender.com";

let currentAudio = new Audio();
let isPlaying = false;
let currentSongData = null; 
let downloadedSongs = []; 
let currentPlaylist = []; 
let currentIndex = 0;     

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

window.onload = () => searchSongs("Trending Hits 2024");

async function searchSongs(query) {
    if (!query) return;
    document.getElementById('sectionTitle').innerText = `Results for "${query}"`;
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '<p style="color: var(--brand);">Gaane dhoondh raha hu bhai...</p>';

    try {
        // Sirf search wale raaste par bhej rahe hain
        const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.error || !data.results || data.results.length === 0) {
            grid.innerHTML = `<p style="color: red;">${data.error || "No songs found."}</p>`;
            return;
        }

        currentPlaylist = data.results; 
        grid.innerHTML = ''; 

        data.results.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${song.cover}" loading="lazy" alt="Cover">
                <div class="play-btn"><i class="fa-solid fa-play"></i></div>
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            `;
            card.onclick = () => loadAndPlaySong(song, index);
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p style="color: red;">Server se connect nahi ho paaya!</p>';
    }
}

function loadAndPlaySong(song, index) {
    document.getElementById('currentTitle').innerText = song.title;
    document.getElementById('currentArtist').innerText = song.artist;
    const coverImg = document.getElementById('currentCover');
    coverImg.src = song.cover;
    coverImg.style.display = 'block';

    currentIndex = index; 
    currentSongData = song;

    // YAHAN HAI ASLI MAGIC: Tere apne server se gaana stream ho raha hai!
    const playUrl = `${API_BASE}/api/play?id=${song.id}`;
    currentAudio.src = playUrl;
    
    currentAudio.play().then(() => {
        isPlaying = true;
        updatePlayPauseIcon();
        
        const player = document.getElementById('mainPlayer');
        if(!player.classList.contains('expanded')) {
            toggleFullScreen();
        }
    }).catch(err => {
        console.error(err);
        alert("Bhai thoda wait kar, server gaana process kar raha hai. Phir se play daba!");
    });
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
        btn.classList.replace('fa-play', 'fa-pause');
    } else {
        btn.classList.replace('fa-pause', 'fa-play');
    }
}

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    currentAudio.volume = e.target.value;
});

function toggleFullScreen() {
    if (!currentAudio.src) return; 
    const player = document.getElementById('mainPlayer');
    player.classList.toggle('expanded');
    
    const btn = document.getElementById('expandBtn');
    if(player.classList.contains('expanded')) {
        btn.classList.replace('fa-expand', 'fa-compress');
    } else {
        btn.classList.replace('fa-compress', 'fa-expand');
    }
}

currentAudio.addEventListener('ended', playNext);

function playNext() {
    if (currentIndex < currentPlaylist.length - 1) {
        let nextSong = currentPlaylist[currentIndex + 1];
        loadAndPlaySong(nextSong, currentIndex + 1);
    }
}

function playPrevious() {
    if (currentIndex > 0) {
        let prevSong = currentPlaylist[currentIndex - 1];
        loadAndPlaySong(prevSong, currentIndex - 1);
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
    if (!currentSongData) return; 
    const alreadyExists = downloadedSongs.find(song => song.title === currentSongData.title);
    if(alreadyExists) { alert("Already in Library!"); return; }
    downloadedSongs.push(currentSongData);
    alert(`"${currentSongData.title}" added to Your Library!`);
}

function renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';
    if(downloadedSongs.length === 0) {
        grid.innerHTML = '<p style="color: #a0a0a0;">Your library is empty.</p>';
        return;
    }
    currentPlaylist = downloadedSongs; 
    downloadedSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${song.cover}" loading="lazy" alt="Cover">
            <div class="play-btn"><i class="fa-solid fa-play"></i></div>
            <div class="title">${song.title}</div>
            <div class="artist">${song.artist}</div>
        `;
        card.onclick = () => loadAndPlaySong(song, index);
        grid.appendChild(card);
    });
}