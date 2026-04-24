import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const userInfoEl = document.getElementById("user-info");
    const loginLink = document.getElementById("login-link");
    const logoutBtn = document.getElementById("logout-btn");
    const cartLink = document.getElementById("cart-link");

    if(auth) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in.
                if(userInfoEl) userInfoEl.textContent = `Hello, ${user.email.split('@')[0]}`;
                if(loginLink) loginLink.style.display = 'none';
                if(logoutBtn) logoutBtn.style.display = 'inline-block';
                if(cartLink) cartLink.style.display = 'inline-block';
            } else {
                // User is signed out.
                if(userInfoEl) userInfoEl.textContent = '';
                if(loginLink) loginLink.style.display = 'inline-block';
                if(logoutBtn) logoutBtn.style.display = 'none';
                if(cartLink) cartLink.style.display = 'none';
                
                // Protect cart route
                if(window.location.pathname.includes('cart.html')) {
                    window.location.href = 'login.html';
                }
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    await signOut(auth);
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error("Error signing out:", error);
                }
            });
        }
    }
});

// Helper for notifications
window.showNotification = function(message) {
    let notif = document.getElementById('notification');
    if(!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.className = 'notification';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}
