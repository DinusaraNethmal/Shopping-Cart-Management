package com.example.Shopping.Cart.repository;

import com.example.Shopping.Cart.model.Cart; // <--- Fixed address
import org.springframework.data.jpa.repository.JpaRepository; // <--- Fixed spelling
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // This finds a cart by the session token (for guests)
    Cart findBySessionToken(String sessionToken);

    // This finds a cart by the logged-in user's ID
    Cart findByUserId(Long userId);
}