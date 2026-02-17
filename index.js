import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"
import { getDatabase,
         ref,
         push,
         onValue,
         remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://leads-tracker-app-487d3-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const referenceInDB = ref(database, "songs")

const inputEl = document.getElementById("input-el")
const nameEl = document.getElementById("name-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")

function getDisplayName(url, customName) {
    if (customName && customName.trim()) return customName.trim()
    const videoId = getYouTubeVideoId(url)
    if (videoId) return "YouTube video"
    try {
        const u = new URL(url)
        const path = u.pathname.split("/").filter(Boolean).pop()
        if (path) return decodeURIComponent(path)
    } catch (_) {}
    return "Untitled"
}

function normalizeSong(item) {
    if (typeof item === "string") return { url: item, name: getDisplayName(item) }
    return { url: item.url, name: getDisplayName(item.url, item.name) }
}

function render(entries) {
    let listItems = ""
    for (let i = 0; i < entries.length; i++) {
        const [key, item] = entries[i]
        const song = normalizeSong(item)
        const safeUrl = song.url.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
        const safeName = song.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        listItems += `
            <li class="song-item" data-url="${safeUrl}" data-key="${key}">
                <button type="button" class="play-btn">▶ Пусни</button>
                <span class="song-name">${safeName}</span>
                <button type="button" class="delete-btn" aria-label="Изтрий"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </li>
        `
    }
    ulEl.innerHTML = listItems
}

const audioPlayer = new Audio()

function getYouTubeVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/)
    return match ? match[1] : null
}

function playUrl(url) {
    const videoId = getYouTubeVideoId(url)
    if (videoId) {
        const playerEl = document.getElementById("yt-player")
        playerEl.classList.add("visible")
        playerEl.innerHTML = `
            <button type="button" class="close-player" aria-label="Close">×</button>
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `
        const closeYtPlayer = () => {
            playerEl.classList.remove("visible")
            playerEl.innerHTML = ""
        }
        playerEl.querySelector(".close-player").addEventListener("click", closeYtPlayer)
        playerEl.addEventListener("click", (e) => {
            if (e.target === playerEl) closeYtPlayer()
        })
    } else {
        const playerEl = document.getElementById("yt-player")
        if (playerEl) {
            playerEl.classList.remove("visible")
            playerEl.innerHTML = ""
        }
        audioPlayer.src = url
        audioPlayer.play().catch(() => {})
    }
}

ulEl.addEventListener("click", function(e) {
    const deleteBtn = e.target.closest(".delete-btn")
    if (deleteBtn) {
        e.stopPropagation()
        const songItem = deleteBtn.closest(".song-item")
        const key = songItem?.dataset.key
        if (key) {
            remove(ref(database, "songs/" + key))
        }
        return
    }
    const songItem = e.target.closest(".song-item")
    if (songItem) {
        e.preventDefault()
        const url = songItem.dataset.url
        playUrl(url)
    }
})

onValue(referenceInDB, function(snapshot) {
    const snapshotDoesExist = snapshot.exists()
    if (snapshotDoesExist) {
        const snapshotValues = snapshot.val()
        const entries = Object.entries(snapshotValues)
        render(entries)
    } else {
        render([])
    }
})

inputBtn.addEventListener("click", function() {
    const url = inputEl.value.trim()
    const name = nameEl.value.trim()
    if (!url) return
    push(referenceInDB, { url, name })
    inputEl.value = ""
    nameEl.value = ""
})