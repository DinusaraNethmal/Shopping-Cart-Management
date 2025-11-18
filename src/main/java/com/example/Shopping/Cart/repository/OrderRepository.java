package com.example.Shopping.Cart.repository;

import com.example.Shopping.Cart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // To show a user their past orders
    List<Order> findByUserId(Long userId);
}