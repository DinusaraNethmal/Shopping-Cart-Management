package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.Role;
import com.example.Shopping.Cart.model.User;
import com.example.Shopping.Cart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 1. Register a new User
    public User registerUser(String username, String email, String password, Role role) {
        // Check if username or email already exists
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email already exists!");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(password); // In a real app, we would encrypt this!
        newUser.setRole(role);

        return userRepository.save(newUser);
    }

    // 2. Login User
    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username);

        if (user != null && user.getPassword().equals(password)) {
            return user; // Login success
        }
        return null; // Login failed
    }
}