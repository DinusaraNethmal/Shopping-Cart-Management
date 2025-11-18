package com.example.Shopping.Cart.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- 1. ADD THIS IMPORT
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnore  // <--- 2. ADD THIS LINE. This stops the infinite loop!
    private Cart cart;

    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
    private String variant;

    // --- Getters and Setters ---
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }
}