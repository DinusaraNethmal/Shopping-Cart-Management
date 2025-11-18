package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.model.Review;
import com.example.Shopping.Cart.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 1. Add Review (POST /api/reviews/add)
    @PostMapping("/add")
    public Review addReview(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = body.get("comment").toString();

        return reviewService.addReview(userId, productId, rating, comment);
    }

    // 2. Get Reviews for Product (GET /api/reviews/product/1)
    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return reviewService.getProductReviews(productId);
    }
}