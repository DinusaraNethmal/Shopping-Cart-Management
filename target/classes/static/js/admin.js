const API_URL = 'http://localhost:8080/api';

// 1. INITIALIZE
loadCategories();
loadInventory();

// 2. LOAD CATEGORIES (Dropdown)
async function loadCategories() {
    const select = document.getElementById('p-category');
    select.innerHTML = '<option value="">Select a Category...</option>';

    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.categoryId;
            option.innerText = cat.name;
            select.appendChild(option);
        });
    } catch (error) { console.error(error); }
}

// 3. LOAD INVENTORY (Bottom List)
async function loadInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '<p style="text-align:center; color:#999;">Refreshing inventory...</p>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        list.innerHTML = ''; // Clear loading message

        if(products.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding:20px;">Store is empty.</p>';
            return;
        }

        products.reverse(); // Show newest first

        products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            
            const imgSrc = p.imageUrl || 'https://placehold.co/50';

            div.innerHTML = `
                <img src="${imgSrc}" class="item-img">
                <div class="item-details">
                    <span class="item-name">${p.name}</span>
                    <span class="item-meta">Stock: ${p.stockQuantity} | Price: $${p.price.toFixed(2)} | SKU: ${p.sku}</span>
                </div>
                <button class="btn-delete" onclick="deleteProduct(${p.productId})">Remove</button>
            `;
            list.appendChild(div);
        });

    } catch (error) { console.error(error); }
}

// 4. ADD PRODUCT
// 4. ADD PRODUCT (DEBUG VERSION)
async function addProduct(event) {
    event.preventDefault(); 
    console.log("Button clicked! Starting validation...");

    // Helper to safely get values
    const getValue = (id) => {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`CRITICAL ERROR: Could not find HTML element with ID '${id}'`);
            alert(`Error: Missing HTML element '${id}'. Check your admin.html`);
            return null;
        }
        return el.value;
    };

    // 1. Gather Values safely
    const name = getValue('p-name');
    const categoryId = getValue('p-category');
    const description = getValue('p-desc');
    const priceStr = getValue('p-price');
    const stockStr = getValue('p-stock');
    const sku = getValue('p-sku');
    const imageUrl = getValue('p-image');

    // 2. Check for Critical Missing HTML Elements
    if (name === null || priceStr === null || stockStr === null) return;

    // 3. Check for Empty Required Fields
    if (!categoryId || categoryId === "") {
        alert("Please select a Category!");
        return;
    }

    // 4. Construct Object
    const product = {
        name: name,
        description: description,
        price: parseFloat(priceStr),
        stockQuantity: parseInt(stockStr),
        sku: sku,
        imageUrl: imageUrl,
        category: { categoryId: categoryId } 
    };

    console.log("Sending Product Data:", product);

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert("Product Added Successfully!");
            document.getElementById('add-product-form').reset(); 
            const preview = document.getElementById('img-preview');
            if(preview) preview.style.display = 'none';
            loadInventory(); 
        } else {
            // If Server fails, try to read the error message
            const errorData = await response.text(); // Read raw text in case JSON fails
            console.error("Server Error Details:", errorData);
            alert("Server rejected the product. Check Console for details.");
        }
    } catch (error) { 
        console.error("Network/Code Error:", error);
        alert("A code error occurred. Check Console (F12).");
    }
}

// 5. DELETE PRODUCT (The new feature)
async function deleteProduct(id) {
    if(!confirm("Are you sure you want to remove this item from the store? Customers will no longer see it.")) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if(response.ok) {
            loadInventory(); // Refresh list
        } else {
            alert("Error deleting product.");
        }
    } catch (error) { console.error(error); }
}

// 6. CREATE CATEGORY
async function createCategory() {
    const nameInput = document.getElementById('new-cat-name');
    const name = nameInput.value;
    if (!name) return alert("Enter category name");

    await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, description: "Admin Created" })
    });

    alert("Category Created!");
    nameInput.value = '';
    loadCategories();
}

// Image Preview Logic
document.getElementById('p-image').addEventListener('input', function(e) {
    const img = document.getElementById('img-preview');
    if (e.target.value) {
        img.src = e.target.value;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
});