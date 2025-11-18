const API_URL = 'http://localhost:8080/api/orders';

// 1. Load All Orders
async function loadAllOrders() {
    try {
        const response = await fetch(`${API_URL}/all`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error(error);
        document.getElementById('orders-container').innerHTML = '<p style="color:red; text-align:center;">Error loading orders.</p>';
    }
}

// 2. Render Orders (NEW CARD LAYOUT)
function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    // Sort: Newest first
    orders.reverse();

    orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        
        // Calculate item count for summary
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const firstItem = order.items[0].productName;
        const summaryText = order.items.length > 1 
            ? `${firstItem} + ${itemCount - 1} others` 
            : firstItem;

        let actionButton = '';

        // LOGIC: 
        // If Pending -> Show Ship
        // If Shipped -> Show Deliver
        // If Delivered -> Show DELETE (Trash Icon)
        if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
            actionButton = `<button class="action-btn btn-ship" onclick="updateStatus(${order.orderId}, 'SHIPPED')">Mark Shipped 🚚</button>`;
        } else if (order.status === 'SHIPPED') {
            actionButton = `<button class="action-btn btn-deliver" onclick="updateStatus(${order.orderId}, 'DELIVERED')">Mark Delivered ✅</button>`;
        } else if (order.status === 'DELIVERED') {
            actionButton = `<button class="action-btn btn-delete" onclick="deleteOrder(${order.orderId})">Delete 🗑️</button>`;
        }

        const div = document.createElement('div');
        div.className = 'order-card'; 
        div.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.orderId}</div>
                    <span class="order-date">${date}</span>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-body">
                <div class="order-summary">
                    <strong>Customer ID:</strong> ${order.userId}<br>
                    <strong>Items:</strong> ${summaryText}<br>
                    <small style="color:#888;">(${itemCount} items total)</small>
                </div>
                <div class="order-total">$${order.totalAmount.toFixed(2)}</div>
            </div>

            <div class="order-actions">
                ${actionButton}
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. Update Status Function
async function updateStatus(orderId, newStatus) {
    if(!confirm(`Change order #${orderId} status to ${newStatus}?`)) return;

    try {
        await fetch(`${API_URL}/${orderId}/status?status=${newStatus}`, { method: 'PUT' });
        loadAllOrders(); 
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status");
    }
}

// 4. NEW: Delete Order Function
async function deleteOrder(orderId) {
    if(!confirm(`⚠️ Are you sure you want to DELETE Order #${orderId}?\nThis cannot be undone.`)) return;

    try {
        const response = await fetch(`${API_URL}/${orderId}`, { method: 'DELETE' });
        if(response.ok) {
            // Remove the element visually (faster than reloading all)
            loadAllOrders(); 
        } else {
            alert("Failed to delete order");
        }
    } catch (error) {
        console.error("Error deleting order:", error);
    }
}

loadAllOrders();