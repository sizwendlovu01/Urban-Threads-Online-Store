import { db, auth } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-items-container");
    const cartSummary = document.getElementById("cart-summary");
    const cartTotalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    if(!auth) return;

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        await loadCart(user.uid);
    });

    async function loadCart(uid) {
        if(!db) return;
        
        try {
            const userCartRef = doc(db, "users", uid);
            const userDoc = await getDoc(userCartRef);
            
            if (userDoc.exists() && userDoc.data().cart && userDoc.data().cart.length > 0) {
                renderCart(userDoc.data().cart, uid);
            } else {
                cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty. <br><br> <a href="shop.html" class="btn">Go Shopping</a></p>`;
                cartSummary.style.display = 'none';
            }
        } catch (error) {
            console.error("Error loading cart:", error);
            cartContainer.innerHTML = `<p class="empty-cart error-message">Failed to load cart. Check permissions.</p>`;
        }
    }

    function renderCart(cart, uid) {
        cartContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            
            const itemEl = document.createElement("div");
            itemEl.className = "cart-item";
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.imageURL}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R ${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-color); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
                        <button class="btn btn-outline decrease-btn" data-index="${index}" style="padding: 0 0.5rem; border: none; font-size: 1.2rem;">-</button>
                        <span style="min-width: 20px; text-align: center; font-weight: 600;">${item.quantity}</span>
                        <button class="btn btn-outline increase-btn" data-index="${index}" style="padding: 0 0.5rem; border: none; font-size: 1.2rem;">+</button>
                    </div>
                    <span style="font-weight: 800; min-width: 80px; text-align: right;">R ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn btn-outline remove-btn" data-index="${index}">Remove</button>
                </div>
            `;
            cartContainer.appendChild(itemEl);
        });

        cartTotalEl.textContent = `Total: R ${total.toFixed(2)}`;
        cartSummary.style.display = 'block';

        // Add remove listeners
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                await removeFromCart(uid, cart, indexToRemove);
            });
        });

        // Add quantity listeners
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const indexToUpdate = parseInt(e.target.getAttribute('data-index'));
                await updateQuantity(uid, cart, indexToUpdate, 1);
            });
        });

        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const indexToUpdate = parseInt(e.target.getAttribute('data-index'));
                await updateQuantity(uid, cart, indexToUpdate, -1);
            });
        });
    }

    async function removeFromCart(uid, currentCart, indexToRemove) {
        try {
            currentCart.splice(indexToRemove, 1);
            const userCartRef = doc(db, "users", uid);
            await updateDoc(userCartRef, { cart: currentCart });
            
            if(window.showNotification) window.showNotification("Item removed from cart");
            
            // Reload cart display
            if (currentCart.length > 0) {
                renderCart(currentCart, uid);
            } else {
                cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty. <br><br> <a href="shop.html" class="btn">Go Shopping</a></p>`;
                cartSummary.style.display = 'none';
            }
        } catch (error) {
            console.error("Error removing item:", error);
            alert("Failed to remove item.");
        }
    }

    async function updateQuantity(uid, currentCart, index, change) {
        try {
            currentCart[index].quantity += change;
            
            if (currentCart[index].quantity <= 0) {
                currentCart.splice(index, 1);
            }
            
            const userCartRef = doc(db, "users", uid);
            await updateDoc(userCartRef, { cart: currentCart });
            
            if (currentCart.length > 0) {
                renderCart(currentCart, uid);
            } else {
                cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty. <br><br> <a href="shop.html" class="btn">Go Shopping</a></p>`;
                cartSummary.style.display = 'none';
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update quantity.");
        }
    }

    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert("Checkout functionality is not implemented in this demo.");
        });
    }
});
