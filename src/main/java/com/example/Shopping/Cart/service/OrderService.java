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

    @Transactional // This ensures that if saving the order fails, the cart won't be cleared!
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
        order.setStatus(OrderStatus.PENDING); // Default status

        // 3. Move items from Cart to Order
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order); // Link to the main order
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setProductName(cartItem.getProductName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getPrice());
            
            order.getItems().add(orderItem);
        }

        // 4. Save the Order to Database
        Order savedOrder = orderRepository.save(order);

        // 5. CLEAR THE CART (Because they just bought it!)
        cartService.clearCart(userId, null);

        return savedOrder;
    }
    
    // Helper to see past orders
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}