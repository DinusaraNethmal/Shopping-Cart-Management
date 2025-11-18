package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.model.Role;
import com.example.Shopping.Cart.model.User;
import com.example.Shopping.Cart.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // 1. Register Endpoint
    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        // Default to CUSTOMER role
        Role role = Role.valueOf(body.getOrDefault("role", "CUSTOMER")); 

        return userService.registerUser(username, email, password, role);
    }

    // 2. Login Endpoint
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = userService.loginUser(username, password);
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }
}