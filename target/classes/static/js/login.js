const API_URL = 'http://localhost:8080/api/users';

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('form-title').innerText = 'Register';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('form-title').innerText = 'Login';
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role: 'CUSTOMER' })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert('Registration failed. Username or Email might be taken.');
        }
    } catch (error) {
        console.error(error);
        alert("Server error during registration.");
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            
            // SAVE THE USER TO BROWSER STORAGE
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('sessionToken', null); // Clear guest token
            
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to the shop
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        alert("Server error during login.");
    }
}