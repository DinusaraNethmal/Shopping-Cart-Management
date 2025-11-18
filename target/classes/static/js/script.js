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

// Add a "Logout" button if logged in, or "Login" button if guest
const container = document.querySelector('.container');
if (currentUser) {
    const logoutBtn = document.createElement('button');
    logoutBtn.innerText = "Logout (" + currentUser.username + ")";
    logoutBtn.style = "position:absolute; top:10px; right:10px; padding:5px 10px; background:#dc3545; color:white; border:none; cursor:pointer; border-radius:4px;";
    logoutBtn.onclick = function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };
    document.body.appendChild(logoutBtn);
} else {
    const loginBtn = document.createElement('button');
    loginBtn.innerText = "Login / Register";
    loginBtn.style = "position:absolute; top:10px; right:10px; padding:5px 10px; background:#007bff; color:white; border:none; cursor:pointer; border-radius:4px;";
    loginBtn.onclick = function() {
        window.location.href = 'login.html';
    };
    document.body.appendChild(loginBtn);
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

// 8. CHECKOUT (Hand-off)
async function proceedToCheckout() {
    const query = userId ? `userId=${userId}` : `sessionToken=${sessionToken}`;
    const response = await fetch(`${API_URL}/view?${query}`);
    const cart = await response.json();

    if (!cart.items || cart.items.length === 0) {
        alert("Cart is empty! Add items first.");
        return;
    }

    const orderData = {
        customerId: cart.userId || "GUEST_USER",
        items: cart.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        })),
        totalAmount: cart.totalPrice,
        orderDate: new Date().toISOString()
    };

    console.log("--------------------------------");
    console.log("SENDING TO ORDER MANAGEMENT SYSTEM (Member 4):");
    console.log(JSON.stringify(orderData, null, 2));
    console.log("--------------------------------");

    alert("Checkout Successful! Check the Console.");
}

// Load cart on page load
loadCart();

// --- NEW: LOAD PRODUCTS FROM DB ---
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:8080/api/products');
        const products = await response.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear the hardcoded HTML

        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <div>
                    <strong>${product.name}</strong><br>
                    <small>$${product.price.toFixed(2)} | Stock: ${product.stockQuantity}</small>
                    <br><em style="font-size:0.8em; color:#666;">${product.description}</em>
                </div>
                <button class="btn-add" onclick="addToCart(${product.productId}, '${product.name}', ${product.price}, 'Standard')">Add to Cart</button>
            `;
            productList.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Call this at the bottom of the file!
loadProducts();