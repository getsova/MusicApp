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

const AUTH_ERRORS = {
    "auth/operation-not-allowed": "Имейл/парола влезът не е активиран. Отидете в Firebase Console → Authentication → Sign-in method и включете Email/Password.",
    "auth/email-already-in-use": "Този имейл вече е регистриран. Използвайте вход.",
    "auth/invalid-email": "Невалиден имейл адрес.",
    "auth/weak-password": "Паролата трябва да е поне 6 символа.",
    "auth/user-not-found": "Няма акаунт с този имейл.",
    "auth/wrong-password": "Грешна парола.",
    "auth/invalid-credential": "Грешен имейл или парола.",
}

function setMessage(text, isError = false) {
    msgEl.textContent = text
    msgEl.className = "msg" + (isError ? " msg-error" : "")
}

function getAuthErrorMessage(err) {
    const code = err?.code || ""
    const mapped = AUTH_ERRORS[code]
    if (mapped) return mapped
    if (code) return `${code}: ${err?.message || "Грешка."}`
    return err?.message || "Грешка. Опитай пак."
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
        submitBtn.disabled = true
        setMessage("")
        if (mode === "signup") {
            if (password !== confirm) {
                setMessage("Паролите не съвпадат.")
                submitBtn.disabled = false
                return
            }
            await createUserWithEmailAndPassword(auth, email, password)
            setMessage("Акаунтът е създаден. Пренасочване…")
            window.location.href = "index.html"
        } else {
            await signInWithEmailAndPassword(auth, email, password)
            setMessage("Успешен вход. Пренасочване…")
            window.location.href = "index.html"
        }
    } catch (err) {
        console.error("Auth error:", err)
        setMessage(getAuthErrorMessage(err), true)
    } finally {
        submitBtn.disabled = false
    }
})

onAuthStateChanged(auth, (user) => {
    if (user) {
        setMessage(`Вече сте влезли като ${user.email || "потребител"}.`)
    }
})

setMode("signup")

