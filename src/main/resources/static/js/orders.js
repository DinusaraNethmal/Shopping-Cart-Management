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
            container.innerHTML = '<p>You have no past orders.</p>';
            return;
        }

        renderOrders(orders);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red">Error loading orders. Please try again.</p>';
    }
}

// 3. RENDER ORDERS TO HTML
function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    // Sort orders so the newest one is at the top
    orders.reverse();

    orders.forEach(order => {
        // Calculate date format
        const date = new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString();
        
        // Create the HTML structure
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <li class="order-item">
                    <span>${item.quantity}x <strong>${item.productName}</strong></span>
                    <span>$${item.priceAtPurchase.toFixed(2)}</span>
                </li>
            `;
        });

        orderDiv.innerHTML = `
            <div class="order-header">
                <div>
                    <strong>Order #${order.orderId}</strong><br>
                    <small>${date}</small>
                </div>
                <div style="text-align:right">
                    <span class="order-status status-${order.status}">${order.status}</span><br>
                    <strong>Total: $${order.totalAmount.toFixed(2)}</strong>
                </div>
            </div>
            <div class="order-body">
                <ul class="order-item-list">
                    ${itemsHtml}
                </ul>
            </div>
        `;
        
        container.appendChild(orderDiv);
    });
}

// Run on page load
loadOrders();