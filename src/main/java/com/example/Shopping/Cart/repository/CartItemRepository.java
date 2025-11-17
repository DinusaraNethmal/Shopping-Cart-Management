package com.example.Shopping.Cart.repository;

import com.example.Shopping.Cart.model.CartItem; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // We don't need special methods here yet. 
    // JpaRepository already gives us save(), delete(), findAll(), etc.
}