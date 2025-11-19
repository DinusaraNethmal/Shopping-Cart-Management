package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.Product;
import com.example.Shopping.Cart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    
    // (Optional) Member 2 would also have addProduct, updateProduct, deleteProduct here
    // Save a new product to the database
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // Delete product by ID
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}