package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.model.Cart;
import com.example.Shopping.Cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController // This tells Spring: "I am ready to listen for web requests"
@RequestMapping("/api/cart") // All URLs here start with /api/cart
@CrossOrigin(origins = "*") // Allows your frontend (HTML) to talk to this backend
public class CartController {

    @Autowired
    private CartService cartService;

    // 1. View Cart (GET http://localhost:8080/api/cart/view?sessionToken=xyz)
    @GetMapping("/view")
    public Cart viewCart(@RequestParam(required = false) Long userId,
                         @RequestParam(required = false) String sessionToken) {
        return cartService.getCart(userId, sessionToken);
    }

    // 2. Add Item (POST http://localhost:8080/api/cart/add)
    @PostMapping("/add")
    public Cart addToCart(@RequestParam(required = false) Long userId,
                          @RequestParam(required = false) String sessionToken,
                          @RequestParam Long productId,
                          @RequestParam String productName,
                          @RequestParam int quantity,
                          @RequestParam BigDecimal price,
                          @RequestParam(required = false) String variant) {
        
        return cartService.addToCart(userId, sessionToken, productId, productName, quantity, price, variant);
    }

    // 3. Remove Item (DELETE http://localhost:8080/api/cart/remove/1)
    @DeleteMapping("/remove/{itemId}")
    public Cart removeFromCart(@RequestParam(required = false) Long userId,
                               @RequestParam(required = false) String sessionToken,
                               @PathVariable Long itemId) {
        
        return cartService.removeFromCart(userId, sessionToken, itemId);
    }

    // 4. Clear Cart (DELETE http://localhost:8080/api/cart/clear)
    @DeleteMapping("/clear")
    public String clearCart(@RequestParam(required = false) Long userId,
                            @RequestParam(required = false) String sessionToken) {
        
        cartService.clearCart(userId, sessionToken);
        return "Cart cleared successfully";
    }

    // 5. Update Quantity (PUT http://localhost:8080/api/cart/update/1?quantity=3)
@PutMapping("/update/{itemId}")
public Cart updateQuantity(@RequestParam(required = false) Long userId,
                           @RequestParam(required = false) String sessionToken,
                           @PathVariable Long itemId,
                           @RequestParam int quantity) {
    return cartService.updateQuantity(userId, sessionToken, itemId, quantity);
    }
}