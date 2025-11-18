package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.Review;
import com.example.Shopping.Cart.model.User;
import com.example.Shopping.Cart.repository.ReviewRepository;
import com.example.Shopping.Cart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Review addReview(Long userId, Long productId, int rating, String comment) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = new Review();
        review.setUserId(userId);
        review.setUsername(user.getUsername());
        review.setProductId(productId);
        review.setRating(rating);
        review.setComment(comment);
        
        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }
}