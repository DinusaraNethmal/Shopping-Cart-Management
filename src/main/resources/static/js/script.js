// Generate a random session token for the guest user
let sessionToken = localStorage.getItem('sessionToken');
if (!sessionToken) {
    sessionToken = 'guest-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionToken', sessionToken);
}

const API_URL = 'http://localhost:8080/api/cart';

// 1. LOAD CART
async function loadCart() {
    try {
        const response = await fetch(`${API_URL}/view?sessionToken=${sessionToken}`);
        const cart = await response.json();
        renderCart(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// 2. RENDER CART TO HTML
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

// 3. ADD TO CART FUNCTION
async function addToCart(pId, pName, price, variant) {
    const formData = new FormData();
    formData.append('sessionToken', sessionToken);
    formData.append('productId', pId);
    formData.append('productName', pName);
    formData.append('quantity', 1);
    formData.append('price', price);
    formData.append('variant', variant);

    await fetch(`${API_URL}/add`, { method: 'POST', body: formData });
    loadCart(); 
}

// 4. REMOVE ITEM FUNCTION
async function removeItem(itemId) {
    await fetch(`${API_URL}/remove/${itemId}?sessionToken=${sessionToken}`, { method: 'DELETE' });
    loadCart();
}

// 5. UPDATE QUANTITY FUNCTION
async function updateQuantity(itemId, newQty) {
    await fetch(`${API_URL}/update/${itemId}?sessionToken=${sessionToken}&quantity=${newQty}`, { method: 'PUT' });
    loadCart();
}

// 6. CLEAR CART FUNCTION
async function clearCart() {
    await fetch(`${API_URL}/clear?sessionToken=${sessionToken}`, { method: 'DELETE' });
    loadCart();
}

// Load cart on page load
loadCart();