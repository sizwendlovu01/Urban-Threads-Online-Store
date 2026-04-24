import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("auth-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const authBtn = document.getElementById("auth-btn");
    const authTitle = document.getElementById("auth-title");
    const authError = document.getElementById("auth-error");
    const switchMode = document.getElementById("switch-mode");
    const authSwitchText = document.getElementById("auth-switch-text");
    const googleAuthBtn = document.getElementById("google-auth-btn");

    let isLoginMode = true;

    if(!authForm) return;

    function handleSwitchMode() {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = "Log In";
            authBtn.textContent = "Log In";
            authSwitchText.innerHTML = `Don't have an account? <a id="switch-mode">Sign Up</a>`;
        } else {
            authTitle.textContent = "Create Account";
            authBtn.textContent = "Sign Up";
            authSwitchText.innerHTML = `Already have an account? <a id="switch-mode">Log In</a>`;
        }
        document.getElementById("switch-mode").addEventListener("click", handleSwitchMode);
        authError.textContent = "";
    }

    switchMode.addEventListener("click", handleSwitchMode);

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        authError.textContent = "";

        if(!auth) {
            authError.textContent = "Firebase not initialized. Please configure Firebase in js/firebase-config.js";
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                if(window.showNotification) window.showNotification("Logged in successfully!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                if(window.showNotification) window.showNotification("Account created successfully!");
            }
            // Redirect to shop
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 1000);
        } catch (error) {
            console.error("Auth error:", error);
            authError.textContent = error.message;
        }
    });

    if (googleAuthBtn) {
        googleAuthBtn.addEventListener("click", async () => {
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
                if(window.showNotification) window.showNotification("Logged in with Google!");
                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 1000);
            } catch (error) {
                console.error("Google Auth error:", error);
                authError.textContent = error.message;
            }
        });
    }
});
