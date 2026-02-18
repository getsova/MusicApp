import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"

import { firebaseConfig } from "./firebaseConfig.js"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const tabSignup = document.getElementById("tab-signup")
const tabLogin = document.getElementById("tab-login")
const form = document.getElementById("auth-form")
const emailEl = document.getElementById("email-el")
const passwordEl = document.getElementById("password-el")
const confirmLabel = document.getElementById("confirm-label")
const confirmEl = document.getElementById("confirm-el")
const submitBtn = document.getElementById("submit-btn")
const msgEl = document.getElementById("auth-msg")

let mode = "signup"

function setMode(nextMode) {
    mode = nextMode
    const isSignup = mode === "signup"

    tabSignup.classList.toggle("active", isSignup)
    tabLogin.classList.toggle("active", !isSignup)

    confirmLabel.hidden = !isSignup
    confirmEl.hidden = !isSignup
    confirmEl.required = isSignup
    confirmEl.value = ""

    passwordEl.autocomplete = isSignup ? "new-password" : "current-password"
    submitBtn.textContent = isSignup ? "Създай акаунт" : "Вход"

    msgEl.textContent = ""
}

function setMessage(text) {
    msgEl.textContent = text
}

tabSignup.addEventListener("click", () => setMode("signup"))
tabLogin.addEventListener("click", () => setMode("login"))

form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    const confirm = confirmEl.value

    if (!email || !password) return

    try {
        if (mode === "signup") {
            if (password !== confirm) {
                setMessage("Паролите не съвпадат.")
                return
            }
            await createUserWithEmailAndPassword(auth, email, password)
            setMessage("Акаунтът е създаден. Пренасочване…")
            window.location.href = "/"
        } else {
            await signInWithEmailAndPassword(auth, email, password)
            setMessage("Успешен вход. Пренасочване…")
            window.location.href = "/"
        }
    } catch (err) {
        setMessage(err?.message || "Грешка. Опитай пак.")
    }
})

onAuthStateChanged(auth, (user) => {
    if (user) {
        setMessage(`Вече сте влезли като ${user.email || "потребител"}.`)
    }
})

setMode("signup")

