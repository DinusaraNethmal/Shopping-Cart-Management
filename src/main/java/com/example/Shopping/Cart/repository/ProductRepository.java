package com.example.Shopping.Cart.repository;

import com.example.Shopping.Cart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // We can add search later, e.g., findByNameContaining(String name)
}