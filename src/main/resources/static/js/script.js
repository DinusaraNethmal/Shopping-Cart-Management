// ==========================================
// 1. USER SESSION & GLOBAL VARIABLES
// ==========================================
const currentUserJSON = localStorage.getItem('currentUser');
const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;
let userId = null;
let sessionToken = null;
let allProductsCache = []; 

if (currentUser) {
    userId = currentUser.userId;
} else {
    sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
        sessionToken = 'guest-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionToken', sessionToken);
    }
}

const API_URL = 'http://localhost:8080/api';

// ==========================================
// 2. HEADER & NAVIGATION LOGIC
// ==========================================

// Inject Navigation Buttons (Login/Orders/Logout)
const navContainer = document.getElementById('nav-buttons');
if (navContainer) {
    const navDiv = document.createElement('div');
    navDiv.className = 'user-actions';

    // Cart Button (Always visible)
    const cartBtn = document.createElement('a');
    cartBtn.innerText = "Cart 🛒";
    cartBtn.className = 'btn btn-primary'; // Yellow style
    cartBtn.href = 'cart.html';
    navDiv.appendChild(cartBtn);

    if (currentUser) {
        const ordersBtn = document.createElement('a');
        ordersBtn.innerText = "My Orders";
        ordersBtn.className = 'btn btn-info'; // Blue style
        ordersBtn.href = 'orders.html';
        
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = "Logout";
        logoutBtn.className = 'btn btn-danger'; // Red style
        logoutBtn.onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        };

        navDiv.appendChild(ordersBtn);
        navDiv.appendChild(logoutBtn);
    } else {
        const loginBtn = document.createElement('a');
        loginBtn.innerText = "Login";
        loginBtn.className = 'btn btn-success'; // Green style
        loginBtn.href = 'login.html';
        navDiv.appendChild(loginBtn);
    }
    navContainer.appendChild(navDiv);
}

// ==========================================
// 3. SEARCH FUNCTIONALITY (New!)
// ==========================================
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

if (searchInput && searchButton) {
    // Search when button clicked
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // Search when 'Enter' key pressed
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

function performSearch(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = allProductsCache.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
    renderProductList(filtered);
}


// ==========================================
// 4. PRODUCT DISPLAY LOGIC
// ==========================================

// Load Categories
if (document.getElementById('category-list')) {
    loadCategories();
    loadProducts();
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        const list = document.getElementById('category-list');
        
        list.innerHTML = '<li onclick="filterProducts(\'all\')" class="active">All Products</li>'; 
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerText = cat.name;
            li.onclick = (e) => {
                // Visual active state
                document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                filterProducts(cat.categoryId);
            };
            list.appendChild(li);
        });
    } catch (error) { console.error(error); }
}

// Fetch Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProductsCache = await response.json();
        renderProductList(allProductsCache);
    } catch (error) { console.error(error); }
}

// Filter by Category
function filterProducts(categoryId) {
    if (categoryId === 'all') {
        renderProductList(allProductsCache);
    } else {
        const filtered = allProductsCache.filter(p => p.category && p.category.categoryId === categoryId);
        renderProductList(filtered);
    }
}

// RENDER THE GRID (Updated Look)
async function renderProductList(products) {
    const productList = document.getElementById('product-list');
    if(!productList) return;
    
    productList.innerHTML = ''; 
    
    if(products.length === 0) {
        productList.innerHTML = '<p style="text-align:center; width:100%;">No products found.</p>';
        return;
    }

    for (const product of products) {
        // Use the URL from Admin, or a default placeholder if empty
        const imgSrc = product.imageUrl && product.imageUrl.trim() !== '' 
            ? product.imageUrl 
            : 'https://placehold.co/300x300?text=No+Image';

        const div = document.createElement('div');
        div.className = 'product-card'; // Uses new CSS class
        
        div.innerHTML = `
            <div class="product-card-image-container">
                <img src="${imgSrc}" alt="${product.name}" class="product-card-image">
            </div>
            <div class="product-card-details">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-category">${product.category ? product.category.name : 'General'}</div>
                <div class="product-card-price">$${product.price.toFixed(2)}</div>
                
                <div class="product-card-actions">
                     <button class="btn-add" onclick="addToCart(${product.productId}, '${product.name}', ${product.price}, 'Standard')">Add to Cart</button>
                </div>
            </div>
        `;
        productList.appendChild(div);
    }
}

// ==========================================
// 5. CART LOGIC (Same as before)
// ==========================================

// Initialize Cart Page if existing
if (document.getElementById('cart-items')) {
    loadCart();
}

async function loadCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    const response = await fetch(`${API_URL}/cart/view?${query}`);
    const cart = await response.json();
    renderCart(cart);
}

function renderCart(cart) {
    const list = document.getElementById('cart-items');
    if(!list) return;

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
        
        document.querySelector('.total-box').innerHTML = `
            <div style="margin-bottom:10px; font-size:0.8em;">
                <input type="text" id="coupon-code" placeholder="Code" style="padding:5px; width:80px;">
                <button onclick="applyCoupon()">Apply</button>
            </div>
            <div>Total: $${cart.totalPrice.toFixed(2)}</div>
        `;
    } else {
        list.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty.</p>';
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

    const response = await fetch(`${API_URL}/cart/add`, { method: 'POST', body: formData });
    
    if(response.ok) {
        alert("Added to cart!");
    } else {
        const err = await response.json();
        alert("Error: " + err.message);
    }
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
            window.location.href = 'orders.html';
        } else {
            alert("Inventory Error or Cart Empty");
        }
    }
}