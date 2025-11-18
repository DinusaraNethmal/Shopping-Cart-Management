const API_URL = 'http://localhost:8080/api/products';

async function addProduct(event) {
    event.preventDefault(); // Stop page refresh

    // 1. Gather data from form
    const product = {
        name: document.getElementById('p-name').value,
        description: document.getElementById('p-desc').value,
        price: parseFloat(document.getElementById('p-price').value),
        stockQuantity: parseInt(document.getElementById('p-stock').value),
        sku: document.getElementById('p-sku').value,
        imageUrl: document.getElementById('p-image').value
    };

    try {
        // 2. Send to Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert("Product Added Successfully!");
            document.getElementById('add-product-form').reset(); // Clear form
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server Error");
    }
}

// Optional: Preview image when URL is pasted
document.getElementById('p-image').addEventListener('input', function(e) {
    const img = document.getElementById('img-preview');
    if (e.target.value) {
        img.src = e.target.value;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
});