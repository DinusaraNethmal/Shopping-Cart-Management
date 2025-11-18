package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.model.Order;
import com.example.Shopping.Cart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 1. Checkout Endpoint (POST /api/orders/checkout?userId=1)
    @PostMapping("/checkout")
    public Order checkout(@RequestParam Long userId) {
        return orderService.placeOrder(userId);
    }

    // 2. View My Orders (GET /api/orders/my-orders?userId=1)
    @GetMapping("/my-orders")
    public List<Order> getMyOrders(@RequestParam Long userId) {
        return orderService.getUserOrders(userId);
    }
}