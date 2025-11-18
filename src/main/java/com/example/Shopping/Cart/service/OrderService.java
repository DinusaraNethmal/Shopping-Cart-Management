package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.*;
import com.example.Shopping.Cart.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private com.example.Shopping.Cart.repository.ProductRepository productRepository; // Add this!

    @Transactional
    public Order placeOrder(Long userId) {
        // 1. Get the User's Cart
        Cart cart = cartService.getCart(userId, null);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order: Cart is empty");
        }

        // 2. Create the Order Object
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(cart.getTotalPrice());
        order.setStatus(OrderStatus.PENDING);

        // 3. Move items from Cart to Order AND UPDATE INVENTORY
        for (CartItem cartItem : cart.getItems()) {
            // A. Fetch the real product from DB to check stock
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // B. Check if we have enough stock
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            // C. Reduce the stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product); // Save the new stock level

            // D. Create Order Item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setProductName(cartItem.getProductName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getPrice());
            
            order.getItems().add(orderItem);
        }

        // 4. Save the Order
        Order savedOrder = orderRepository.save(order);

        // 5. Clear the Cart
        cartService.clearCart(userId, null);

        return savedOrder;
    }
    
    // Helper to see past orders
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // 1. Get ALL orders (For Admin)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. Update Order Status
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // 3. Delete Order
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }
}