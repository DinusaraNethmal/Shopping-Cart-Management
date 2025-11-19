// ==========================================
// 1. USER SESSION & GLOBAL VARIABLES
// ==========================================
const currentUserJSON = localStorage.getItem('currentUser');
const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;
let userId = null;
let sessionToken = null;
let allProductsCache = []; 
let currentProductDetail = null; // Store single product for detail page

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
// 2. NAVIGATION & INITIALIZATION
// ==========================================

// Inject Navigation Buttons
const navContainer = document.getElementById('nav-buttons');
if (navContainer) {
    const navDiv = document.createElement('div');
    navDiv.className = 'user-actions';

    const cartBtn = document.createElement('a');
    cartBtn.innerText = "Cart 🛒";
    cartBtn.className = 'btn btn-primary';
    cartBtn.href = 'cart.html';
    navDiv.appendChild(cartBtn);

    if (currentUser) {
        const ordersBtn = document.createElement('a');
        ordersBtn.innerText = "My Orders";
        ordersBtn.className = 'btn btn-info';
        ordersBtn.href = 'orders.html';
        
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = "Logout";
        logoutBtn.className = 'btn btn-danger';
        logoutBtn.onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        };

        navDiv.appendChild(ordersBtn);
        navDiv.appendChild(logoutBtn);
    } else {
        const loginBtn = document.createElement('a');
        loginBtn.innerText = "Login";
        loginBtn.className = 'btn btn-success';
        loginBtn.href = 'login.html';
        navDiv.appendChild(loginBtn);
    }
    navContainer.appendChild(navDiv);
}

// PAGE ROUTER
if (document.getElementById('category-list')) {
    // WE ARE ON INDEX.HTML
    loadCategories();
    loadProducts();
} else if (document.getElementById('product-content')) {
    // WE ARE ON PRODUCT-DETAIL.HTML
    loadProductDetail();
} else if (document.getElementById('cart-items')) {
    // WE ARE ON CART.HTML
    loadCart();
}

// ==========================================
// 3. HOME PAGE LOGIC
// ==========================================

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        const list = document.getElementById('category-list');
        list.innerHTML = '<li onclick="filterProducts(\'all\')" class="active">All Products</li>'; 
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerText = cat.name;
            li.onclick = () => filterProducts(cat.categoryId);
            list.appendChild(li);
        });
    } catch (error) { console.error(error); }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProductsCache = await response.json();
        renderProductList(allProductsCache);
    } catch (error) { console.error(error); }
}

function filterProducts(categoryId) {
    if (categoryId === 'all') {
        renderProductList(allProductsCache);
    } else {
        const filtered = allProductsCache.filter(p => p.category && p.category.categoryId === categoryId);
        renderProductList(filtered);
    }
}

async function renderProductList(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; 
    
    if(products.length === 0) {
        productList.innerHTML = '<p style="text-align:center; width:100%;">No products found.</p>';
        return;
    }

    for (const product of products) {
        const imgSrc = product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : 'https://placehold.co/300x300?text=No+Image';

        const div = document.createElement('div');
        div.className = 'product-card'; 
        // Make the card clickable to go to detail page
        div.style.cursor = 'pointer';
        div.onclick = (e) => {
            // Don't navigate if they clicked the "Add" button directly
            if(e.target.tagName === 'BUTTON') return;
            window.location.href = `product-detail.html?id=${product.productId}`;
        };
        
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
// 4. PRODUCT DETAIL PAGE LOGIC
// ==========================================

async function loadProductDetail() {
    // Get ID from URL (e.g., ?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert("Product not found.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        if (!response.ok) throw new Error("Product fetch failed");
        
        const product = await response.json();
        currentProductDetail = product; // Store globally for "Add to Cart" button

        // Fill HTML elements
        document.getElementById('p-img').src = product.imageUrl || 'https://placehold.co/400';
        document.getElementById('p-name').innerText = product.name;
        document.getElementById('p-category').innerText = product.category ? product.category.name : 'General';
        document.getElementById('p-sku').innerText = product.sku || 'N/A';
        document.getElementById('p-price').innerText = product.price.toFixed(2);
        document.getElementById('p-desc').innerText = product.description || "No description provided.";

        // Stock Badge Logic
        const stockBadge = document.getElementById('p-stock-badge');
        if (product.stockQuantity > 0) {
            stockBadge.innerText = `In Stock (${product.stockQuantity})`;
            stockBadge.className = "detail-stock in-stock";
        } else {
            stockBadge.innerText = "Out of Stock";
            stockBadge.className = "detail-stock out-stock";
            document.querySelectorAll('.buy-btn').forEach(btn => btn.disabled = true);
        }

        // Show content
        document.getElementById('loading-msg').style.display = 'none';
        document.getElementById('product-content').style.display = 'grid';

    } catch (error) {
        console.error(error);
        document.getElementById('loading-msg').innerText = "Error loading product.";
    }
}

// Wrapper to add from detail page using the quantity input
function addToCartFromDetail() {
    if (!currentProductDetail) return;
    const qty = parseInt(document.getElementById('p-qty').value) || 1;
    
    addToCart(
        currentProductDetail.productId, 
        currentProductDetail.name, 
        currentProductDetail.price, 
        'Standard',
        qty
    );
}

function buyNow() {
    addToCartFromDetail();
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}


// ==========================================
// 5. CART & API FUNCTIONS
// ==========================================

async function addToCart(pId, pName, price, variant, qty = 1) {
    const formData = new FormData();
    if(userId) formData.append('userId', userId);
    else formData.append('sessionToken', sessionToken);
    
    formData.append('productId', pId);
    formData.append('productName', pName);
    formData.append('quantity', qty);
    formData.append('price', price);
    formData.append('variant', variant);

    try {
        const response = await fetch(`${API_URL}/cart/add`, { method: 'POST', body: formData });
        if(response.ok) {
            alert("Item added to cart!");
        } else {
            const err = await response.json();
            alert("Error: " + err.message);
        }
    } catch(e) { console.error(e); }
}

async function loadCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    const response = await fetch(`${API_URL}/cart/view?${query}`);
    const cart = await response.json();
    renderCart(cart);
}

function renderCart(cart) {
    const list = document.getElementById('cart-items');
    const summarySection = document.querySelector('.cart-summary-section');
    const contentArea = document.getElementById('cart-content-area');

    // Safety check: If we are on the Shop page, do nothing
    if (!list) return;

    list.innerHTML = '';
    
    if (cart && cart.items && cart.items.length > 0) {
        // 1. Show Summary Panel
        summarySection.style.display = 'block';
        
        // 2. Render Items
        cart.items.forEach(item => {
            // --- CRITICAL FIX: This code MUST be INSIDE the loop ---
            const imgSrc = item.product && item.product.imageUrl 
                ? item.product.imageUrl 
                : 'https://placehold.co/100?text=No+Img';
            // -------------------------------------------------------

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="item-info">
                    <img src="${imgSrc}" alt="${item.productName}" class="item-image">
                    <div class="item-details">
                        <h4>${item.productName}</h4>
                        <small style="color:#888;">SKU: ${item.product ? item.product.sku : 'N/A'}</small>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:20px;">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.itemId}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.itemId}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="btn-remove" onclick="removeItem(${item.itemId})" title="Remove">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        });
        
        // 3. Update Totals in the Right Panel
        let subtotal = 0;
        cart.items.forEach(i => subtotal += (i.price * i.quantity));
        
        document.getElementById('summary-subtotal').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-total').innerText = `$${cart.totalPrice.toFixed(2)}`;
        
        // Calculate Discount
        let discount = subtotal - cart.totalPrice;
        if(discount > 0.01) {
            document.getElementById('summary-discount').innerText = `-$${discount.toFixed(2)}`;
        } else {
            document.getElementById('summary-discount').innerText = `$0.00`;
        }

    } else {
        // EMPTY STATE
        summarySection.style.display = 'none'; 
        contentArea.innerHTML = `
            <div class="empty-cart-state">
                <span class="empty-icon">🛒</span>
                <h3>Your cart is empty</h3>
                <p style="color:#666; margin-bottom:20px;">Looks like you haven't added anything yet.</p>
                <a href="index.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
    }
}

async function removeItem(itemId) {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/cart/remove/${itemId}?${query}`, { method: 'DELETE' });
    loadCart();
}

async function clearCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/cart/clear?${query}`, { method: 'DELETE' });
    loadCart();
}

async function proceedToCheckout() {
    if (!userId) return alert("Please login first.");
    if (confirm("Place order?")) {
        const response = await fetch(`${API_URL}/orders/checkout?userId=${userId}`, { method: 'POST' });
        if (response.ok) {
            alert("Success!");
            loadCart();
            window.location.href = 'orders.html';
        } else {
            alert("Inventory Error or Cart Empty");
        }
    }
}

// ==========================================
// 6. SEARCH FUNCTIONALITY
// ==========================================
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

if (searchInput && searchButton) {
    // 1. Click "Search" Button
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // 2. Press "Enter" Key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

function performSearch(query) {
    if (!query) {
        // If empty, show everything
        renderProductList(allProductsCache);
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filter the cache
    const filtered = allProductsCache.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
    
    renderProductList(filtered);
}