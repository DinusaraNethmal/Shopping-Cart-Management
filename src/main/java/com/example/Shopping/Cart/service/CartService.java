package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.Cart;
import com.example.Shopping.Cart.model.CartItem;
import com.example.Shopping.Cart.repository.CartRepository;
import com.example.Shopping.Cart.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    // 1. Get or Create a Cart (for both Guests and Users)
    public Cart getCart(Long userId, String sessionToken) {
        Cart cart = null;

        // If user is logged in, try to find their cart
        if (userId != null) {
            cart = cartRepository.findByUserId(userId);
        }
        // If no user cart, try to find by session token (for guests)
        else if (sessionToken != null) {
            cart = cartRepository.findBySessionToken(sessionToken);
        }

        // If cart still doesn't exist, create a new one
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            // Generate a token if it's a guest
            cart.setSessionToken(sessionToken != null ? sessionToken : UUID.randomUUID().toString());
            cart.setTotalPrice(BigDecimal.ZERO);
            cartRepository.save(cart);
        }
        return cart;
    }

    // 2. Add Item to Cart
    public Cart addToCart(Long userId, String sessionToken, Long productId, String productName, int quantity, BigDecimal price, String variant) {
        Cart cart = getCart(userId, sessionToken);
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId) && 
                        (variant == null || variant.equals(item.getVariant())))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity if exists
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Create new item if not exists
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(productId);
            newItem.setProductName(productName);
            newItem.setQuantity(quantity);
            newItem.setPrice(price);
            newItem.setVariant(variant);
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem); // Save item first
        }

        return updateCartTotal(cart);
    }

    // 3. Remove Item from Cart
    public Cart removeFromCart(Long userId, String sessionToken, Long itemId) {
        Cart cart = getCart(userId, sessionToken);
        // Find the item and ensure it belongs to this cart
        Optional<CartItem> itemToRemove = cartItemRepository.findById(itemId);
        
        if (itemToRemove.isPresent() && itemToRemove.get().getCart().getCartId().equals(cart.getCartId())) {
            cart.getItems().remove(itemToRemove.get());
            cartItemRepository.delete(itemToRemove.get());
            return updateCartTotal(cart);
        }
        
        return cart;
    }

    // 4. Clear Entire Cart
    public void clearCart(Long userId, String sessionToken) {
        Cart cart = getCart(userId, sessionToken);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        updateCartTotal(cart);
    }

    // Helper: Calculate Total Price
    private Cart updateCartTotal(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
            total = total.add(itemTotal);
        }
        cart.setTotalPrice(total);
        return cartRepository.save(cart);
    }
}