const API_URL = "https://beatsvibe-music.onrender.com/api/search?q=";

let currentAudio = new Audio();
let isPlaying = false;
let currentSongData = null; 
let downloadedSongs = []; 
let currentPlaylist = []; // Gaano ki list save karega
let currentIndex = 0;     // Kaunsa number chal raha hai

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
    grid.innerHTML = '<p style="color: #00f2fe;">Finding full audio tracks...</p>';

    try {
        const response = await fetch(API_URL + encodeURIComponent(query));
        const data = await response.json();
        
        if (data.error || !data.results || data.results.length === 0) {
            grid.innerHTML = `<p style="color: red;">${data.error || "No songs found."}</p>`;
            return;
        }

        currentPlaylist = data.results; // Nayi list ko save kiya auto-play ke liye
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
            // Click karne par index bhi bhej rahe hain
            card.onclick = () => loadAndPlaySong(song.url, song.title, song.artist, song.cover, index);
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p style="color: red;">Server se connect nahi ho paaya!</p>';
    }
}

function loadAndPlaySong(url, title, artist, cover, index) {
    document.getElementById('currentTitle').innerText = title;
    document.getElementById('currentArtist').innerText = artist;
    const coverImg = document.getElementById('currentCover');
    coverImg.src = cover;
    coverImg.style.display = 'block';

    currentIndex = index; // Current gaane ka number set kiya
    currentSongData = { title, artist, cover, url };

    currentAudio.src = url;
    
    // Play karo, aur agar error aaye toh batao
    currentAudio.play().then(() => {
        isPlaying = true;
        updatePlayPauseIcon();
        
        // Gaana play hote hi full screen khol do
        const player = document.getElementById('mainPlayer');
        if(!player.classList.contains('expanded')) {
            toggleFullScreen();
        }
    }).catch(err => {
        console.error(err);
        alert("Bhai yeh gaana blocked hai ya load nahi ho raha, doosra try kar!");
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

// Volume Control
document.getElementById('volumeSlider').addEventListener('input', (e) => {
    currentAudio.volume = e.target.value;
});

// Full Screen Toggle
function toggleFullScreen() {
    if (!currentAudio.src) return; // Bina gaane ke bada mat karo
    const player = document.getElementById('mainPlayer');
    player.classList.toggle('expanded');
    
    const btn = document.getElementById('expandBtn');
    if(player.classList.contains('expanded')) {
        btn.classList.replace('fa-expand', 'fa-compress');
    } else {
        btn.classList.replace('fa-compress', 'fa-expand');
    }
}

// Auto-Play Next (Jab ek gaana khatam ho)
currentAudio.addEventListener('ended', playNext);

function playNext() {
    if (currentIndex < currentPlaylist.length - 1) {
        let nextSong = currentPlaylist[currentIndex + 1];
        loadAndPlaySong(nextSong.url, nextSong.title, nextSong.artist, nextSong.cover, currentIndex + 1);
    }
}

function playPrevious() {
    if (currentIndex > 0) {
        let prevSong = currentPlaylist[currentIndex - 1];
        loadAndPlaySong(prevSong.url, prevSong.title, prevSong.artist, prevSong.cover, currentIndex - 1);
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
    // Library ke gaane bhi auto-play honge agar wo currentPlaylist ban jayein
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
        card.onclick = () => loadAndPlaySong(song.url, song.title, song.artist, song.cover, index);
        grid.appendChild(card);
    });
}