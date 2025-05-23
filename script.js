console.log("Hello");

let currentSong = new Audio();
let songs = [];
let currentFolder;

// Helper: Replace fetch for text
function fetchText(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error("HTTP error " + xhr.status));
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send();
    });
}

// Helper: Replace fetch for JSON
function fetchJSON(url) {
    return fetchText(url).then(text => JSON.parse(text));
}

// Get songs from a folder
async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetchText(`/${currentFolder}/`);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a") || element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/" + currentFolder + "/")[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = " ";
    for (const song of songs) {
        songUL.innerHTML += `<li data-file="${song}">
            <i class="fas fa-music fa-xl"></i>
            <div class="info">
                <div class="songName">${song.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4)}</div>
                <div>Darshan</div>
            </div>
            <i class="fa-solid fa-play fa-xl"></i>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const actualFileName = e.getAttribute("data-file");
            const songName = e.querySelector(".songName").innerHTML;
            playMusic(actualFileName, songName);
        });
    });

    const firstSong = songs[0];
    const displayName = firstSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4);
    playMusic(firstSong, displayName);

    return songs;
}

// Play music
const playMusic = (path, track) => {
    currentSong.src = `/${currentFolder}/` + path;
    currentSong.play();
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    document.querySelector(".songInfo").innerHTML = track;
}

// Format time display
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

// Set album click behavior
function albumClick() {
    Array.from(document.querySelectorAll(".cardContainer .card")).forEach(e => {
        e.addEventListener("click", async () => {
            const folder = "musics/" + e.dataset.folder;
            console.log(folder);
            songs = await getSongs(folder);
        });
    });
}

// Set track next/previous
function trackChange() {
    previous.addEventListener("click", () => {
        let current = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(current);
        let previousSong = songs[index - 1];
        if (previousSong) {
            let songName = previousSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4);
            playMusic(previousSong, songName);
        }
    });

    next.addEventListener("click", () => {
        let current = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(current);
        let nextSong = songs[index + 1];
        if (nextSong) {
            let songName = nextSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4);
            playMusic(nextSong, songName);
        }
    });
}

// Get album list and render cards
async function getAlbum() {
    let response = await fetchText(`/musics/`);
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer");
    let anchors = div.getElementsByTagName("a");

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/musics/")) {
            let folder = e.href.split("/musics/")[1];
            let albumData = await fetchJSON(`/musics/${folder}/album.json`);

            cardContainer.innerHTML += `<div class="card" data-folder="${folder}">
                <div class="play">
                    <svg class="fa-circle-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="50" height="50">
                        <circle cx="256" cy="256" r="256" fill="#1ed760" />
                        <polygon points="208,144 208,368 368,256" fill="black" />
                    </svg>
                </div>
                <img src="${albumData.cover}" alt="cover">
                <h3>${albumData.title}</h3>
                <p>${albumData.description}</p>
            </div>`;

            albumClick();
            trackChange();
        }
    });
}

// Main init function
async function main() {
    songs = await getSongs("musics/Romantic");
    await getAlbum();

    let play = document.querySelector("#play");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.classList.remove("fa-play");
            play.classList.add("fa-pause");
        } else {
            currentSong.pause();
            play.classList.remove("fa-pause");
            play.classList.add("fa-play");
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector("#time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const perc = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.currentTime = perc * currentSong.duration;
    });

    document.querySelector("#hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });

    document.querySelector("#close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    vol.addEventListener("input", () => {
        currentSong.volume = vol.value;
    });
}

main();

