import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"
import {
    getDatabase,
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js"

import { firebaseConfig } from "./firebaseConfig.js"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

const inputEl = document.getElementById("input-el")
const nameEl = document.getElementById("name-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const userEl = document.getElementById("user-el")
const logoutBtn = document.getElementById("logout-btn")
const authLink = document.getElementById("auth-link")
const inputContainer = document.getElementById("input-container")

let songsRef = null
let stopSongsListener = null

function getDisplayName(url, customName) {
    if (customName && customName.trim()) return customName.trim()
    const videoId = getYouTubeVideoId(url)
    if (videoId) return "YouTube video"
    try {
        const u = new URL(url)
        const path = u.pathname.split("/").filter(Boolean).pop()
        if (path) return decodeURIComponent(path)
    } catch (_) { }
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
                <div class="settings-container">
                    <button type="button" class="settings-btn" aria-label="Настройки">⚙️</button>
                    <div class="settings-menu" hidden>
                        <button type="button" class="menu-item edit-name-btn">Промени име</button>
                        <button type="button" class="menu-item edit-url-btn">Промени URL</button>
                    </div>
                </div>
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
        audioPlayer.play().catch(() => { })
    }
}

ulEl.addEventListener("click", function (e) {
    const deleteBtn = e.target.closest(".delete-btn")
    if (deleteBtn) {
        e.stopPropagation()
        const songItem = deleteBtn.closest(".song-item")
        const key = songItem?.dataset.key
        if (key && songsRef) {
            const uid = auth.currentUser?.uid
            if (!uid) return
            remove(ref(database, `users/${uid}/songs/${key}`))
        }
        return
    }

    // Settings Button
    const settingsBtn = e.target.closest(".settings-btn")
    if (settingsBtn) {
        e.stopPropagation()
        const menu = settingsBtn.nextElementSibling
        // Close all other menus
        document.querySelectorAll(".settings-menu").forEach(el => {
            if (el !== menu) el.hidden = true
        })
        menu.hidden = !menu.hidden
        return
    }

    // Edit Name
    const editNameBtn = e.target.closest(".edit-name-btn")
    if (editNameBtn) {
        e.stopPropagation()
        const songItem = editNameBtn.closest(".song-item")
        const key = songItem?.dataset.key
        const currentName = songItem.querySelector(".song-name").textContent.trim()

        const newName = prompt("Въведете ново име:", currentName)
        if (newName !== null && newName.trim() !== "" && key && songsRef) {
            const uid = auth.currentUser?.uid
            if (uid) {
                update(ref(database, `users/${uid}/songs/${key}`), { name: newName.trim() })
            }
        }
        editNameBtn.closest(".settings-menu").hidden = true
        return
    }

    // Edit URL
    const editUrlBtn = e.target.closest(".edit-url-btn")
    if (editUrlBtn) {
        e.stopPropagation()
        const songItem = editUrlBtn.closest(".song-item")
        const key = songItem?.dataset.key
        const currentUrl = songItem.dataset.url

        const newUrl = prompt("Въведете нов URL:", currentUrl)
        if (newUrl !== null && newUrl.trim() !== "" && key && songsRef) {
            const uid = auth.currentUser?.uid
            if (uid) {
                update(ref(database, `users/${uid}/songs/${key}`), { url: newUrl.trim() })
            }
        }
        editUrlBtn.closest(".settings-menu").hidden = true
        return
    }

    const songItem = e.target.closest(".song-item")
    if (songItem) {
        e.preventDefault()
        const url = songItem.dataset.url
        playUrl(url)
    }
})

// Close menus when clicking outside
document.addEventListener("click", function (e) {
    if (!e.target.closest(".settings-container")) {
        document.querySelectorAll(".settings-menu").forEach(menu => menu.hidden = true)
    }
})

function setSignedOutUi() {
    userEl.textContent = "Не сте влезли"
    logoutBtn.hidden = true
    authLink.hidden = false
    inputContainer.hidden = true
    inputBtn.disabled = true
    songsRef = null
    if (stopSongsListener) {
        stopSongsListener()
        stopSongsListener = null
    }
    render([])
}

function setSignedInUi(user) {
    userEl.textContent = user.email || "Влезли сте"
    logoutBtn.hidden = false
    authLink.hidden = true
    inputContainer.hidden = false
    inputBtn.disabled = false

    songsRef = ref(database, `users/${user.uid}/songs`)
    if (stopSongsListener) stopSongsListener()
    stopSongsListener = onValue(songsRef, function (snapshot) {
        if (snapshot.exists()) {
            render(Object.entries(snapshot.val()))
        } else {
            render([])
        }
    })
}

onAuthStateChanged(auth, function (user) {
    if (user) setSignedInUi(user)
    else setSignedOutUi()
})

logoutBtn.addEventListener("click", function () {
    signOut(auth)
})

inputBtn.addEventListener("click", function () {
    const url = inputEl.value.trim()
    const name = nameEl.value.trim()
    if (!url) return
    if (!songsRef) return
    push(songsRef, { url, name })
    inputEl.value = ""
    nameEl.value = ""
})