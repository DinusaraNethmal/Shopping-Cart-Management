// ==========================================
// 1. USER SESSION & GLOBAL VARIABLES
// ==========================================
const currentUserJSON = localStorage.getItem('currentUser');
const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;
let userId = null;
let sessionToken = null;
let allProductsCache = []; // Stores products locally for filtering

if (currentUser) {
    userId = currentUser.userId;
    console.log("Logged in as: " + currentUser.username);
} else {
    sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
        sessionToken = 'guest-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionToken', sessionToken);
    }
    console.log("Browsing as Guest: " + sessionToken);
}

const API_URL = 'http://localhost:8080/api'; // Base URL

// Add Nav Buttons
if (currentUser) {
    const navDiv = document.createElement('div');
    navDiv.style = "position:absolute; top:10px; right:10px; display:flex; gap:10px;";
    
    const ordersBtn = document.createElement('button');
    ordersBtn.innerText = "My Orders";
    ordersBtn.style = "padding:5px 10px; background:#28a745; color:white; border:none; cursor:pointer; border-radius:4px;";
    ordersBtn.onclick = () => window.location.href = 'orders.html';
    
    const logoutBtn = document.createElement('button');
    logoutBtn.innerText = "Logout (" + currentUser.username + ")";
    logoutBtn.style = "padding:5px 10px; background:#dc3545; color:white; border:none; cursor:pointer; border-radius:4px;";
    logoutBtn.onclick = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    navDiv.appendChild(ordersBtn);
    navDiv.appendChild(logoutBtn);
    document.body.appendChild(navDiv);
} else {
    const loginBtn = document.createElement('button');
    loginBtn.innerText = "Login";
    loginBtn.style = "position:absolute; top:10px; right:10px; padding:5px 10px; background:#007bff; color:white; border:none; cursor:pointer; border-radius:4px;";
    loginBtn.onclick = () => window.location.href = 'login.html';
    document.body.appendChild(loginBtn);
}

// ==========================================
// 2. PRODUCT & CATEGORY LOGIC
// ==========================================

// Load Categories for Sidebar
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        const list = document.getElementById('category-list');
        
        // Keep "All Products" and clear the "Loading..." text
        list.innerHTML = '<li onclick="filterProducts(\'all\')">All Products</li>'; 

        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerText = cat.name;
            li.onclick = () => filterProducts(cat.categoryId);
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Fetch Products from DB
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProductsCache = await response.json(); // Save to cache
        renderProductList(allProductsCache); // Show all initially
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Filter Logic
function filterProducts(categoryId) {
    if (categoryId === 'all') {
        renderProductList(allProductsCache);
    } else {
        const filtered = allProductsCache.filter(p => p.category && p.category.categoryId === categoryId);
        renderProductList(filtered);
    }
}

// Render Products to HTML
async function renderProductList(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; 
    
    if(products.length === 0) {
        productList.innerHTML = '<p style="text-align:center;">No products found in this category.</p>';
        return;
    }

    for (const product of products) {
        // Fetch reviews (simplified for speed)
        const reviewRes = await fetch(`${API_URL}/reviews/product/${product.productId}`);
        const reviews = await reviewRes.json();
        const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "New";

        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <div style="flex-grow:1;">
                <strong>${product.name}</strong> <span style="color:#f39c12;">★ ${avgRating}</span><br>
                <small style="color:#666;">${product.category ? product.category.name : 'General'}</small> | 
                <small>$${product.price.toFixed(2)}</small>
                <br><em style="font-size:0.8em; color:#666;">${product.description}</em>
                
                <div id="review-section-${product.productId}" style="display:none; margin-top:10px; padding:10px; background:#f9f9f9; font-size:0.9em;">
                    <strong>Reviews:</strong>
                    <ul style="padding-left:20px; margin:5px 0;">
                        ${reviews.map(r => `<li>${r.rating}★: ${r.comment}</li>`).join('')}
                    </ul>
                    <button onclick="submitReview(${product.productId})" style="font-size:0.8em;">Add Review</button>
                </div>
                
                <div style="margin-top:5px;">
                    <a onclick="toggleReviews(${product.productId})" style="color:#007bff; cursor:pointer; font-size:0.8em;">View Reviews</a>
                </div>
            </div>
            <button class="btn-add" onclick="addToCart(${product.productId}, '${product.name}', ${product.price}, 'Standard')">Add</button>
        `;
        productList.appendChild(div);
    }
}

// ==========================================
// 3. CART & CHECKOUT LOGIC
// ==========================================

async function loadCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    const response = await fetch(`${API_URL}/cart/view?${query}`);
    const cart = await response.json();
    renderCart(cart);
}

function renderCart(cart) {
    const list = document.getElementById('cart-items');
    list.innerHTML = '';
    
    if (cart && cart.items && cart.items.length > 0) {
        cart.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div>
                    <strong>${item.productName}</strong> <br>
                    <small>${item.variant}</small>
                </div>
                <div style="display:flex; align-items:center; gap:5px;">
                    <button onclick="updateQuantity(${item.itemId}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.itemId}, ${item.quantity + 1})">+</button>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn-remove" onclick="removeItem(${item.itemId})">x</button>
                </div>
            `;
            list.appendChild(li);
        });
        
        // Coupon Box
        document.querySelector('.total-box').innerHTML = `
            <div style="margin-bottom:10px; font-size:0.8em;">
                <input type="text" id="coupon-code" placeholder="Code" style="padding:5px; width:80px;">
                <button onclick="applyCoupon()">Apply</button>
            </div>
            <div>Total: $${cart.totalPrice.toFixed(2)}</div>
        `;
    } else {
        list.innerHTML = '<p style="text-align:center;">Cart is empty</p>';
        document.querySelector('.total-box').innerHTML = 'Total: $0.00';
    }
}

async function addToCart(pId, pName, price, variant) {
    const formData = new FormData();
    if(userId) formData.append('userId', userId);
    else formData.append('sessionToken', sessionToken);
    
    formData.append('productId', pId);
    formData.append('productName', pName);
    formData.append('quantity', 1);
    formData.append('price', price);
    formData.append('variant', variant);

    await fetch(`${API_URL}/cart/add`, { method: 'POST', body: formData });
    loadCart(); 
}

async function removeItem(itemId) {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/cart/remove/${itemId}?${query}`, { method: 'DELETE' });
    loadCart();
}

async function updateQuantity(itemId, newQty) {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/cart/update/${itemId}?${query}&quantity=${newQty}`, { method: 'PUT' });
    loadCart();
}

async function clearCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/cart/clear?${query}`, { method: 'DELETE' });
    loadCart();
}

async function applyCoupon() {
    const code = document.getElementById('coupon-code').value;
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    
    const response = await fetch(`${API_URL}/cart/apply-coupon?${query}&code=${code}`, { method: 'POST' });
    if (response.ok) {
        alert("Discount Applied!");
        loadCart();
    } else {
        alert("Invalid or Used Coupon");
    }
}

async function proceedToCheckout() {
    if (!userId) return alert("Please login first.");
    
    if (confirm("Place order?")) {
        const response = await fetch(`${API_URL}/orders/checkout?userId=${userId}`, { method: 'POST' });
        if (response.ok) {
            const order = await response.json();
            alert("Success! Order ID: " + order.orderId);
            loadCart();
        }
    }
}

// --- Review Helpers ---
function toggleReviews(productId) {
    const section = document.getElementById(`review-section-${productId}`);
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function submitReview(productId) {
    if (!userId) return alert("Login required.");
    const comment = prompt("Enter your review comment:");
    const rating = prompt("Enter rating (1-5):");
    
    if(comment && rating) {
        await fetch(`${API_URL}/reviews/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId, rating, comment })
        });
        alert("Posted!");
        loadProducts();
    }
}

// INITIALIZE
loadCategories();
loadProducts();
loadCart();