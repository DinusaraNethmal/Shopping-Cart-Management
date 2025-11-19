// 1. CHECK USER LOGIN
const currentUserJSON = localStorage.getItem('currentUser');
const currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;

if (!currentUser) {
    alert("You must be logged in to view orders.");
    window.location.href = 'login.html';
}

const API_URL = 'http://localhost:8080/api/orders';

// 2. FETCH ORDERS
async function loadOrders() {
    const container = document.getElementById('orders-container');
    
    try {
        const response = await fetch(`${API_URL}/my-orders?userId=${currentUser.userId}`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        const orders = await response.json();
        
        if (orders.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:60px;"><h3>No orders yet 🛍️</h3><p>Go buy something nice!</p></div>';
            return;
        }
        renderOrders(orders);
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Error loading orders.</p>';
    }
}

// 3. RENDER ORDERS (CREATIVE CARD)
function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';
    orders.reverse(); // Newest first

    orders.forEach(order => {
        // --- SMART DATE FORMATTER ---
        const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
        const dateString = dateObj.toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
        const timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // --- STATUS ICON LOGIC ---
        let statusIcon = '🕒'; // Default Pending
        if (order.status === 'SHIPPED') statusIcon = '🚚';
        if (order.status === 'DELIVERED') statusIcon = '✅';
        if (order.status === 'CONFIRMED') statusIcon = '👍';

        // --- ITEM SUMMARY LOGIC ---
        let itemsHtml = '';
        // Show max 2 items to keep card neat
        const displayItems = order.items.slice(0, 2); 
        
        displayItems.forEach(item => {
            itemsHtml += `
                <div class="item-row">
                    <span class="item-name">${item.quantity}x ${item.productName}</span>
                    <span style="font-weight:bold;">$${item.priceAtPurchase.toFixed(2)}</span>
                </div>
            `;
        });

        // If more than 2 items, show count
        if (order.items.length > 2) {
            itemsHtml += `<div style="font-size:0.85em; color:#007bff; text-align:center; margin-top:8px; font-weight:600;">+ ${order.items.length - 2} other items</div>`;
        }

        // --- CARD HTML ---
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        
        orderDiv.innerHTML = `
            <div class="order-header">
                <div class="order-id-row">
                    <div class="order-title">Order #${order.orderId}</div>
                </div>
                <div class="order-date">📅 ${dateString} &nbsp;•&nbsp; ${timeString}</div>
                <span class="order-status status-${order.status}">${statusIcon} ${order.status}</span>
            </div>
            
            <div class="order-body">
                ${itemsHtml}
            </div>

            <div class="order-footer">
                <span class="total-label">Total Amount</span>
                <span class="total-amount">$${order.totalAmount.toFixed(2)}</span>
            </div>
        `;
        
        container.appendChild(orderDiv);
    });
}

loadOrders();