// 1. CHECK FOR LOGGED IN USER
const currentUserJSON = localStorage.getItem('currentUser');
const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;
let userId = null;
let sessionToken = null;

if (currentUser) {
    // If user is logged in, use their ID
    userId = currentUser.userId;
    console.log("Logged in as: " + currentUser.username);
} else {
    // If not logged in, check for guest token
    sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
        sessionToken = 'guest-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionToken', sessionToken);
    }
    console.log("Browsing as Guest: " + sessionToken);
}

if (currentUser) {
    const navDiv = document.createElement('div');
    navDiv.style = "position:absolute; top:10px; right:10px; display:flex; gap:10px;";
    
    // 1. My Orders Button
    const ordersBtn = document.createElement('button');
    ordersBtn.innerText = "My Orders";
    ordersBtn.style = "padding:5px 10px; background:#28a745; color:white; border:none; cursor:pointer; border-radius:4px;";
    ordersBtn.onclick = function() {
        window.location.href = 'orders.html';
    };
    
    // 2. Logout Button
    const logoutBtn = document.createElement('button');
    logoutBtn.innerText = "Logout (" + currentUser.username + ")";
    logoutBtn.style = "padding:5px 10px; background:#dc3545; color:white; border:none; cursor:pointer; border-radius:4px;";
    logoutBtn.onclick = function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    navDiv.appendChild(ordersBtn);
    navDiv.appendChild(logoutBtn);
    document.body.appendChild(navDiv);
}

const API_URL = 'http://localhost:8080/api/cart';

// 2. LOAD CART
async function loadCart() {
    try {
        // We send BOTH userId and sessionToken. The backend decides which to use.
        const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
        const response = await fetch(`${API_URL}/view?${query}`);
        const cart = await response.json();
        renderCart(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// 3. RENDER CART TO HTML
function renderCart(cart) {
    const list = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
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
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="updateQuantity(${item.itemId}, ${item.quantity - 1})" 
                            style="background:#ddd; border:none; px:5px; cursor:pointer;">-</button>
                    
                    <span>${item.quantity}</span>
                    
                    <button onclick="updateQuantity(${item.itemId}, ${item.quantity + 1})" 
                            style="background:#ddd; border:none; px:5px; cursor:pointer;">+</button>
                    
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn-remove" onclick="removeItem(${item.itemId})">Remove</button>
                </div>
            `;
            list.appendChild(li);
        });
        totalSpan.textContent = cart.totalPrice.toFixed(2);
    } else {
        list.innerHTML = '<p style="text-align:center; color:#666;">Your cart is empty</p>';
        totalSpan.textContent = '0.00';
    }
}

// 4. ADD TO CART FUNCTION
async function addToCart(pId, pName, price, variant) {
    const formData = new FormData();
    if(userId) formData.append('userId', userId);
    if(!userId) formData.append('sessionToken', sessionToken);
    
    formData.append('productId', pId);
    formData.append('productName', pName);
    formData.append('quantity', 1);
    formData.append('price', price);
    formData.append('variant', variant);

    await fetch(`${API_URL}/add`, { method: 'POST', body: formData });
    loadCart(); 
}

// 5. REMOVE ITEM FUNCTION
async function removeItem(itemId) {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/remove/${itemId}?${query}`, { method: 'DELETE' });
    loadCart();
}

// 6. UPDATE QUANTITY FUNCTION
async function updateQuantity(itemId, newQty) {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/update/${itemId}?${query}&quantity=${newQty}`, { method: 'PUT' });
    loadCart();
}

// 7. CLEAR CART FUNCTION
async function clearCart() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    await fetch(`${API_URL}/clear?${query}`, { method: 'DELETE' });
    loadCart();
}

// 8. CHECKOUT (REAL BACKEND INTEGRATION)
async function proceedToCheckout() {
    // We require a User ID for orders (Guests must login first in this flow)
    if (!userId) {
        alert("Please Login to Checkout!");
        window.location.href = 'login.html';
        return;
    }

    if (confirm("Are you sure you want to place this order?")) {
        try {
            const response = await fetch(`http://localhost:8080/api/orders/checkout?userId=${userId}`, { 
                method: 'POST' 
            });

            if (response.ok) {
                const order = await response.json();
                alert("Order Placed Successfully! Order ID: " + order.orderId);
                
                // Refresh the cart (it should be empty now)
                loadCart();
            } else {
                alert("Checkout failed. Please try again.");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Something went wrong connecting to the server.");
        }
    }
}

// Load cart on page load
loadCart();

// --- LOAD PRODUCTS + REVIEWS ---
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:8080/api/products');
        const products = await response.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; 

        for (const product of products) {
            // Fetch reviews for this specific product to verify average rating
            const reviewRes = await fetch(`http://localhost:8080/api/reviews/product/${product.productId}`);
            const reviews = await reviewRes.json();
            const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "New";

            const div = document.createElement('div');
            div.className = 'product';
            // We add a unique ID for the review section so we can toggle it later
            div.innerHTML = `
                <div style="flex-grow:1;">
                    <strong>${product.name}</strong> <span style="color:#f39c12;">★ ${avgRating}</span><br>
                    <small>$${product.price.toFixed(2)} | Stock: ${product.stockQuantity}</small>
                    <br><em style="font-size:0.8em; color:#666;">${product.description}</em>
                    
                    <div id="review-section-${product.productId}" style="display:none; margin-top:10px; padding:10px; background:#f9f9f9; border-left:3px solid #007bff;">
                        <small><strong>Reviews:</strong></small>
                        <ul style="padding-left:20px; margin:5px 0; font-size:0.9em;">
                            ${reviews.map(r => `<li><strong>${r.username}</strong> (${r.rating}★): ${r.comment}</li>`).join('')}
                        </ul>
                        
                        <div style="margin-top:5px;">
                            <select id="rate-${product.productId}">
                                <option value="5">5 ★</option>
                                <option value="4">4 ★</option>
                                <option value="3">3 ★</option>
                                <option value="2">2 ★</option>
                                <option value="1">1 ★</option>
                            </select>
                            <input type="text" id="comment-${product.productId}" placeholder="Write a review..." style="width:60%; padding:5px;">
                            <button onclick="submitReview(${product.productId})" style="padding:5px; background:#333; color:white; border:none; cursor:pointer;">Post</button>
                        </div>
                    </div>
                    
                    <div style="margin-top:5px;">
                        <a onclick="toggleReviews(${product.productId})" style="color:#007bff; cursor:pointer; font-size:0.8em;">View/Add Reviews</a>
                    </div>
                </div>
                <button class="btn-add" onclick="addToCart(${product.productId}, '${product.name}', ${product.price}, 'Standard')">Add to Cart</button>
            `;
            productList.appendChild(div);
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// --- NEW HELPER FUNCTIONS ---
function toggleReviews(productId) {
    const section = document.getElementById(`review-section-${productId}`);
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function submitReview(productId) {
    if (!userId) {
        alert("Please login to write a review.");
        return;
    }
    const rating = document.getElementById(`rate-${productId}`).value;
    const comment = document.getElementById(`comment-${productId}`).value;

    await fetch('http://localhost:8080/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, rating, comment })
    });
    
    alert("Review submitted!");
    loadProducts(); // Refresh to see the new review
}

// Call this at the bottom of the file!
loadProducts();