import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    if(!productList || !db) {
        if(productList) productList.innerHTML = `<p style="text-align: center; width: 100%; color: var(--accent-color);">Failed to load Firebase DB.</p>`;
        return;
    }

    try {
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        
        if (productSnapshot.empty) {
            productList.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-secondary);">No products found. Add them to Firestore or wait for the seeder to finish and refresh.</p>`;
            return;
        }

        productList.innerHTML = ""; // Clear loading text
        
        productSnapshot.forEach((productDoc) => {
            const product = productDoc.data();
            const productEl = document.createElement("div");
            productEl.className = "product-card";
            productEl.innerHTML = `
                <img src="${product.imageURL}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">R ${product.price.toFixed(2)}</div>
                    <button class="btn add-to-cart-btn" data-id="${productDoc.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageURL}">Add to Cart</button>
                </div>
            `;
            productList.appendChild(productEl);
        });

        // Add to cart logic
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!auth || !auth.currentUser) {
                    window.location.href = 'login.html';
                    return;
                }

                const productId = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                const price = parseFloat(e.target.getAttribute('data-price'));
                const imageURL = e.target.getAttribute('data-image');
                
                try {
                    const userCartRef = doc(db, "users", auth.currentUser.uid);
                    const userDoc = await getDoc(userCartRef);
                    
                    const newItem = {
                        productId,
                        name,
                        price,
                        imageURL,
                        quantity: 1
                    };

                    if (userDoc.exists()) {
                        let cart = userDoc.data().cart || [];
                        const existingItemIndex = cart.findIndex(item => item.productId === productId);
                        
                        if (existingItemIndex > -1) {
                            cart[existingItemIndex].quantity += 1;
                        } else {
                            cart.push(newItem);
                        }
                        
                        await updateDoc(userCartRef, { cart });
                    } else {
                        await setDoc(userCartRef, { cart: [newItem] });
                    }
                    
                    if(window.showNotification) window.showNotification(`${name} added to cart!`);
                } catch (error) {
                    console.error("Error adding to cart:", error);
                    alert("Failed to add to cart. Check console.");
                }
            });
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        productList.innerHTML = `<p style="text-align: center; width: 100%; color: var(--accent-color);">Failed to load products. Check Firebase configuration and rules.</p>`;
    }
});
