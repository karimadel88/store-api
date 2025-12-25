# Front Office API Documentation

This documentation outlines the public APIs available for the store front (Front Office). These endpoints do not require authentication.

## Base URL
All API endpoints are prefixed with `/api`.
Default Development URL: `http://localhost:3000/api`

---

## 1. Homepage & Styling

### Get Banners (Sliders)
- **Endpoint:** `GET /banners`
- **Goal:** Get list of active banners for the homepage slider.
- **Response:**
  ```json
  [
    {
      "title": "Big Sale",
      "subtitle": "Up to 50% off",
      "imageId": { "url": "http://..." },
      "link": "/category/sale",
      "buttonText": "Shop Now"
    }
  ]
  ```

---

## 2. Locations

### List Countries
- **Endpoint:** `GET /countries`
- **Goal:** Get all active countries.

### List Cities
- **Endpoint:** `GET /cities`
- **Query Parameters:**
  - `countryId` (string): Filter by country ID.
- **Goal:** Get active cities, optionally filtered by country.

---

## 3. Products & Categories

### List Categories
- **Endpoint:** `GET /categories`
- **Goal:** Get all active categories for navigation.

### Category Tree
- **Endpoint:** `GET /categories/tree`
- **Goal:** Get hierarchical structure of categories.

### List Products
- **Endpoint:** `GET /products`
- **Query Parameters:**
  - `page` (number): Page number (default: 1).
  - `limit` (number): Items per page (default: 20).
  - `categoryId` (string): Filter by category ID.
  - `brand` (string): Filter by brand name.
  - `minPrice` (number): Minimum price filter.
  - `maxPrice` (number): Maximum price filter.
  - `search` (string): Text search query.
- **Goal:** List products with full filtering capabilities.

### Product Details
- **Endpoint:** `GET /products/:id`
- **Goal:** Get product by ID.

### Product by Slug
- **Endpoint:** `GET /products/slug/:slug`
- **Goal:** Get product details using URL friendly slug.

---

## 4. Cart & Shipping

### Calculate Shipping
- **Endpoint:** `GET /shipping/calculate`
- **Query Parameters:**
  - `cityId` (string): The selected city's ID.
- **Goal:** Get shipping cost based on location.

### Validate Coupon
- **Endpoint:** `POST /coupons/validate`
- **Request Body:**
  ```json
  {
    "code": "SUMMER20",
    "orderAmount": 5000
  }
  ```
- **Goal:** Verify if a coupon is valid for the current order.

---

## 5. Checkout

### Place Order
- **Endpoint:** `POST /orders`
- **Request Body:**
  ```json
  {
    "customer": {
      "firstName": "Karim",
      "lastName": "Adel",
      "email": "customer@example.com",
      "phone": "010xxxxxxxx"
    },
    "shippingAddress": {
      "street": "Al-Nasr St",
      "city": "Cairo",
      "country": "Egypt",
      "details": "Building 5 - Apt 2"
    },
    "items": [
      { "productId": "id", "quantity": 1, "price": 8500 }
    ],
    "paymentMethod": "cod",
    "couponCode": "optional",
    "notes": "Additional instructions"
  }
  ```
- **Goal:** Submit a new order.

---

## 6. Reviews & Contact

### Submit Review
- **Endpoint:** `POST /reviews`
- **Goal:** Customers rate and review products.

### Submit Contact Form
- **Endpoint:** `POST /contact`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "I have a question about my order."
  }
  ```
- **Goal:** Send customer messages to administration.

---

## 7. Store Settings

### Get Store Info
- **Endpoint:** `GET /settings`
- **Goal:** Fetch store info (contact details, social links, policies).
