import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyD44QX1h6pTCmyPaQmHUDH8nUarlj2pgw4",
  authDomain: "urban-threads-7fd28.firebaseapp.com",
  projectId: "urban-threads-7fd28",
  storageBucket: "urban-threads-7fd28.firebasestorage.app",
  messagingSenderId: "387888443629",
  appId: "1:387888443629:web:9b529589066aa879345ce4"
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase not properly configured yet. Please update firebaseConfig in js/firebase-config.js", error);
}

const dummyProducts = [
  { name: "Black Oversized Hoodie", price: 899.99, category: "Hoodies", description: "Soft cotton hoodie in oversized fit. Classic black.", imageURL: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
  { name: "Grey Essential Hoodie", price: 849.99, category: "Hoodies", description: "Premium fleece hoodie in heather grey.", imageURL: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop" },
  { name: "Olive Green Hoodie", price: 899.99, category: "Hoodies", description: "Streetwear staple olive green hoodie.", imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop" },
  { name: "Graphic T-Shirt (White)", price: 450.00, category: "T-shirts", description: "Heavyweight cotton with streetwear graphic.", imageURL: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop" },
  { name: "Vintage Wash T-Shirt", price: 499.00, category: "T-shirts", description: "Acid wash distressed vintage tee.", imageURL: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop" },
  { name: "High-Top Sneakers (Vans)", price: 1499.00, category: "Sneakers", description: "Classic high-top sneakers with durable sole.", imageURL: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop" },
  { name: "Chunky Street Sneakers", price: 1899.00, category: "Sneakers", description: "90s inspired chunky streetwear trainers.", imageURL: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop" },
  { name: "Cargo Pants (Black)", price: 1100.00, category: "Pants", description: "Relaxed fit cargo pants with utility pockets.", imageURL: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop" },
  { name: "Streetwear Shirt", price: 250.00, category: "Accessories", description: "Warm knit beanie with subtle logo.", imageURL: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop" }
];

async function seedProducts() {
  if (!db) return;
  try {
    const productsCol = collection(db, "products");
    const productSnapshot = await getDocs(productsCol);

    // If snapshot length doesn't match dummy products length, wipe and reseed
    if (productSnapshot.size !== dummyProducts.length) {
      console.log("Updating dummy products in Firestore...");
      // Delete old products
      const promises = productSnapshot.docs.map(docSnap => deleteDoc(doc(db, "products", docSnap.id)));
      await Promise.all(promises);

      // Add new products
      for (const product of dummyProducts) {
        await addDoc(productsCol, product);
      }
      console.log("Products updated successfully. Please refresh the page if items don't appear.");
    }
  } catch (error) {
    console.warn("Could not seed products. Ensure Firestore is enabled and rules allow read/write.", error);
  }
}

// Automatically try to seed on load
seedProducts();

export { auth, db };
