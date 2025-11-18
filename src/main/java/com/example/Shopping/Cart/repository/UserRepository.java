package com.example.Shopping.Cart.repository;

import com.example.Shopping.Cart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Helper to find user for login
    User findByUsername(String username);
    User findByEmail(String email);
}