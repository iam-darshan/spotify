console.log("Hello")

const owner = "iam-darshan";
const repo = "spotify";
const branch = "main";

let currentSong = new Audio();
let songs = [];
let currentFolder;

async function getSongs(folder) {
    currentFolder = folder;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${currentFolder}?ref=${branch}`;
    let res = await fetch(apiUrl);
    let files = await res.json();

    songs = [];

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file.name.endsWith(".m4a") || file.name.endsWith(".mp3")) {
            songs.push(file.download_url.split("/"+currentFolder+"/")[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li data-file="${song}">
                            <i class="fas fa-music fa-xl"></i>
                            <div class="info">
                                <div class="songName">${song.replaceAll("%20"," ").replaceAll("%2",",").slice(0, -4)} </div>
                                <div>Darshan</div>
                            </div>
                            <i class="fa-solid fa-play fa-xl"></i>
                        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            const actualFileName = e.getAttribute("data-file");
            const songName = e.querySelector(".songName").innerHTML
            playMusic(actualFileName, songName)
        })
    })

    const firstSong = songs[0]; 
    const displayName = firstSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4); 
    playMusic(firstSong, displayName)

    return songs;
}

const playMusic = (path, track) => {
    currentSong.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${currentFolder}/` + path;
    currentSong.play();
    play.classList.remove("fa-pause")
    play.classList.add("fa-play")
    document.querySelector(".songInfo").innerHTML = track;
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

function albumClick(){
     Array.from(document.querySelectorAll(".cardContainer .card")).forEach(e=>{
        e.addEventListener("click",async ()=>{
            const folder="musics/"+e.dataset.folder;
            console.log(folder)
            songs = await getSongs(folder)
        })
    })  
}

function trackChange(){
    previous.addEventListener("click",()=>{
        let current = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(current);
        let previousSong = songs[index - 1];
        let songName = previousSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4);
        playMusic(previousSong, songName);
    })

    next.addEventListener("click",()=>{
        let current = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(current);
        let nextSong = songs[index + 1];
        let songName = nextSong.replaceAll("%20", " ").replaceAll("%2", ",").slice(0, -4);
        playMusic(nextSong, songName);
    })
}

async function getAlbum(){
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/musics?ref=${branch}`;
    let res = await fetch(apiUrl);
    let folders = await res.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";
    for (const folder of folders) {
        if (folder.type === "dir") {
            const albumUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/musics/${folder.name}/album.json`;
            let a = await fetch(albumUrl);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder.name}">
                    <div class="play">
                         <svg class="fa-circle-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="50" height="50">
                        <circle cx="256" cy="256" r="256" fill="#1ed760" />
                        <polygon points="208,144 208,368 368,256" fill="black" />
                    </svg>
                    </div>
                    <img src="${response.cover}" alt="cover">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`
            albumClick();
            trackChange();
        }
    }
}

async function main(){
    songs = await getSongs("musics/Romantic")
    console.log(songs)

    await getAlbum();

    let play = document.querySelector("#play");

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.classList.remove("fa-play")
            play.classList.add("fa-pause")
        }
        else{
            currentSong.pause();
            play.classList.remove("fa-pause")
            play.classList.add("fa-play")
        }
    })
    
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector("#time").innerHTML=`${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100+"%";
    })

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        const perc=(e.offsetX/(e.target.getBoundingClientRect().width))
        currentSong.currentTime=perc*currentSong.duration;
    })

    document.querySelector("#hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    document.querySelector("#close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    vol.addEventListener("click",()=>{
        currentSong.volume = vol.value;
    })
};

main();
