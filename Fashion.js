// ======================
// FIREBASE INITIALIZATION
// ======================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBG2uIP7b_qCiFKHhP_h8mydghzuGD6UDw",
  authDomain: "dresscode-6932f.firebaseapp.com",
  projectId: "dresscode-6932f",
  storageBucket: "dresscode-6932f.firebasestorage.app",
  messagingSenderId: "375713565567",
  appId: "1:375713565567:web:b521bf1291dfb5542a684a",
  measurementId: "G-YRWVQN3QRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ======================
// CORE FUNCTIONALITY
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize page-specific features
  if (document.getElementById('apply-filters')) initGallery();
  if (document.querySelector('.upload-form')) initUpload();
  if (document.getElementById('poll-options')) initCommunity();
  if (document.getElementById('user-outfits')) initAccount();
  initAuth(); // Always initialize auth
});

// ======================
// GALLERY PAGE
// ======================
function initGallery() {
  // Real filtering
  document.getElementById('apply-filters').addEventListener('click', async () => {
    const category = document.getElementById('category-filter').value;
    const color = document.getElementById('color-filter').value;
    
    const q = query(
      collection(db, "outfits"),
      where("tags", "array-contains", category === 'all' ? '' : category),
      where("color", "==", color === 'all' ? '' : color)
    );

    onSnapshot(q, (snapshot) => {
      const gallery = document.querySelector('.gallery-container');
      gallery.innerHTML = '';
      snapshot.forEach(doc => {
        gallery.innerHTML += createOutfitCard(doc.data());
      });
    });
  });

  // Like functionality
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('like-btn')) {
      const outfitId = e.target.dataset.id;
      await updateDoc(doc(db, "outfits", outfitId), {
        likes: firebase.firestore.FieldValue.increment(1)
      });
    }
  });
}

function createOutfitCard(outfit) {
  return `
    <article class="gallery-item">
      <img src="${outfit.imageUrl}" alt="${outfit.title}">
      <h3>${outfit.title}</h3>
      <button class="like-btn" data-id="${outfit.id}">
        ❤️ ${outfit.likes || 0}
      </button>
    </article>
  `;
}

// ======================
// UPLOAD PAGE
// ======================
function initUpload() {
  document.querySelector('.upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = document.getElementById('outfit-image').files[0];
    const title = document.getElementById('outfit-title').value;
    const tags = [...document.querySelectorAll('[name="category"]:checked')].map(el => el.value);

    // Upload to Firebase
    const storageRef = ref(storage, `outfits/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "outfits"), {
      title,
      imageUrl,
      tags,
      likes: 0,
      userId: auth.currentUser?.uid,
      createdAt: new Date()
    });

    alert('Outfit uploaded successfully!');
  });
}

// ======================
// COMMUNITY PAGE
// ======================
function initCommunity() {
  // Poll voting
  document.getElementById('poll-options').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selected = document.querySelector('input[name="summer-trend"]:checked').value;
    
    await updateDoc(doc(db, "polls", "summer2025"), {
      [selected]: firebase.firestore.FieldValue.increment(1)
    });
  });

  // Real-time challenge updates
  onSnapshot(doc(db, "challenges", "current"), (doc) => {
    const challenge = doc.data();
    document.querySelector('.challenge-info').innerHTML = `
      <p>${challenge.description}</p>
      <p><strong>Deadline:</strong> ${challenge.deadline}</p>
      <p>${challenge.participants} participants</p>
    `;
  });
}

// ======================
// ACCOUNT PAGE
// ======================
function initAccount() {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    
    // Profile info
    document.getElementById('user-name').textContent = user.displayName;
    document.getElementById('user-email').textContent = user.email;
    if (user.photoURL) document.getElementById('user-photo').src = user.photoURL;

    // User's outfits
    const q = query(collection(db, "outfits"), where("userId", "==", user.uid));
    onSnapshot(q, (snapshot) => {
      let totalLikes = 0;
      const outfitsGrid = document.getElementById('user-outfits');
      outfitsGrid.innerHTML = '';
      
      snapshot.forEach(doc => {
        const outfit = doc.data();
        totalLikes += outfit.likes || 0;
        outfitsGrid.innerHTML += createOutfitCard(outfit);
      });

      document.getElementById('outfits-count').textContent = snapshot.size;
      document.getElementById('likes-count').textContent = totalLikes;
    });
  });
}

// ======================
// AUTH SYSTEM
// ======================
function initAuth() {
  // Auth state listener
  onAuthStateChanged(auth, (user) => {
    const accountButton = document.getElementById('account-button');
    if (!accountButton) return;

    if (user) {
      accountButton.textContent = user.displayName || user.email.split('@')[0];
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('signup-link').style.display = 'none';
      document.getElementById('account-link').style.display = 'block';
      document.getElementById('logout-link').style.display = 'block';
    } else {
      accountButton.textContent = 'Signup/Login';
      document.getElementById('login-link').style.display = 'block';
      document.getElementById('signup-link').style.display = 'block';
      document.getElementById('account-link').style.display = 'none';
      document.getElementById('logout-link').style.display = 'none';
    }
  });

  // Auth event listeners
  document.getElementById('login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('login');
  });

  document.getElementById('signup-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('signup');
  });

  document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth);
  });
}

function showAuthModal(type) {
  // Your modal implementation
  console.log(`Showing ${type} modal`);
  // Would include:
  // - Email/password fields
  // - Form submission handlers
  // - Error display
}