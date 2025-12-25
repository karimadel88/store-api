# E-Commerce Admin API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All admin endpoints require JWT Bearer token except `/auth/login`.

```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/login
Login and get tokens.

**Request:**
```json
{
  "email": "admin@store.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@store.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### GET /auth/profile
Get current user profile. *Requires Auth*

---

## Users (Admin Management)

### GET /admin/users
List all admin users.

### POST /admin/users
Create admin user.

**Request:**
```json
{
  "email": "staff@store.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "staff"  // "admin" | "manager" | "staff"
}
```

### GET /admin/users/:id
Get user by ID.

### PATCH /admin/users/:id
Update user.

### DELETE /admin/users/:id
Delete user.

---

## Media (File Uploads)

### POST /admin/media/upload
Upload file (multipart/form-data).

**Form Fields:**
- `file`: Image file (jpeg, png, gif, webp, max 5MB)
- `entityType`: "product" | "category" | "user" (optional)
- `entityId`: MongoDB ObjectId (optional)
- `sortOrder`: number (optional)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "1703520000000-123456789.jpg",
  "originalName": "product.jpg",
  "path": "uploads/1703520000000-123456789.jpg",
  "url": "/uploads/1703520000000-123456789.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "entityType": "product",
  "entityId": "507f1f77bcf86cd799439012",
  "sortOrder": 0
}
```

### GET /admin/media
List media files.

**Query Params:**
- `entityType`: Filter by type
- `entityId`: Filter by entity

### GET /admin/media/:id
Get media by ID.

### PATCH /admin/media/reorder
Reorder media items.

**Request:**
```json
{
  "mediaIds": ["id1", "id2", "id3"]
}
```

### DELETE /admin/media/:id
Delete media file.

---

## Categories

### GET /admin/categories
List all categories.

**Query Params:**
- `includeInactive`: "true" | "false"

### GET /admin/categories/tree
Get categories as nested tree structure.

### POST /admin/categories
Create category.

**Request:**
```json
{
  "name": "Electronics",
  "slug": "electronics",  // auto-generated if omitted
  "description": "Electronic devices",
  "imageId": "507f1f77bcf86cd799439011",
  "parentId": null,  // for nested categories
  "sortOrder": 0
}
```

### GET /admin/categories/:id
Get category by ID.

### PATCH /admin/categories/:id
Update category.

### DELETE /admin/categories/:id
Delete category (fails if has children).

---

## Products

### GET /admin/products
List products with pagination.

**Query Params:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `categoryId`: Filter by category
- `isActive`: true | false
- `isFeatured`: true | false
- `search`: Text search in name/description

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### GET /admin/products/low-stock
Get products below stock threshold.

### POST /admin/products
Create product.

**Request:**
```json
{
  "name": "iPhone 15",
  "slug": "iphone-15",
  "description": "Latest iPhone",
  "sku": "IPH15-128",
  "price": 999.99,
  "compareAtPrice": 1099.99,
  "costPrice": 750,
  "quantity": 50,
  "lowStockThreshold": 10,
  "categoryId": "507f1f77bcf86cd799439011",
  "imageIds": ["id1", "id2"],
  "isFeatured": true,
  "attributes": {
    "color": "Black",
    "storage": "128GB"
  }
}
```

### GET /admin/products/:id
Get product by ID.

### PATCH /admin/products/:id
Update product.

### PATCH /admin/products/:id/stock
Adjust stock quantity.

**Request:**
```json
{
  "quantity": 10  // positive to add, negative to subtract
}
```

### DELETE /admin/products/:id
Delete product.

---

## Countries

### GET /admin/countries
List countries.

**Query Params:**
- `includeInactive`: "true" | "false"

### POST /admin/countries
Create country.

**Request:**
```json
{
  "name": "Egypt",
  "code": "EG"
}
```

### GET /admin/countries/:id
### PATCH /admin/countries/:id
### DELETE /admin/countries/:id

---

## Cities

### GET /admin/cities
List cities.

**Query Params:**
- `countryId`: Filter by country

### POST /admin/cities
Create city.

**Request:**
```json
{
  "name": "Cairo",
  "countryId": "507f1f77bcf86cd799439011"
}
```

### GET /admin/cities/:id
### PATCH /admin/cities/:id
### DELETE /admin/cities/:id

---

## Shipping Methods

### GET /admin/shipping-methods
List shipping methods.

### GET /admin/shipping-methods/calculate?cityId=...
Calculate shipping prices for a city.

**Response:**
```json
[
  {
    "shippingMethodId": "507f1f77bcf86cd799439011",
    "name": "Standard Delivery",
    "price": 50,
    "estimatedDays": 3
  }
]
```

### POST /admin/shipping-methods
Create shipping method.

**Request:**
```json
{
  "name": "Express Delivery",
  "description": "Next day delivery",
  "basePrice": 100,
  "estimatedDays": 1,
  "cityPrices": [
    { "cityId": "...", "price": 80 },
    { "cityId": "...", "price": 120 }
  ]
}
```

### POST /admin/shipping-methods/:id/city-prices
Set city prices for shipping method.

**Request:**
```json
{
  "cityPrices": [
    { "cityId": "...", "price": 50 }
  ]
}
```

### GET /admin/shipping-methods/:id
### PATCH /admin/shipping-methods/:id
### DELETE /admin/shipping-methods/:id

---

## Customers

### GET /admin/customers
List customers.

**Query Params:**
- `search`: Search by email, first name, last name
- `isActive`: true | false

### POST /admin/customers
Create customer.

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+201234567890",
  "addresses": [
    {
      "street": "123 Main St",
      "cityId": "507f1f77bcf86cd799439011",
      "cityName": "Cairo",
      "country": "Egypt",
      "postalCode": "12345",
      "isDefault": true
    }
  ]
}
```

### GET /admin/customers/:id
Get customer with wishlist.

### PATCH /admin/customers/:id
Update customer.

### POST /admin/customers/:id/addresses
Add address.

**Request:**
```json
{
  "address": {
    "street": "456 New St",
    "cityId": "...",
    "cityName": "Alexandria",
    "country": "Egypt"
  }
}
```

### DELETE /admin/customers/:id/addresses/:index
Remove address by index.

### DELETE /admin/customers/:id
Delete customer.

---

## Coupons

### GET /admin/coupons
List coupons.

### POST /admin/coupons
Create coupon.

**Request:**
```json
{
  "code": "SUMMER20",
  "description": "Summer sale 20% off",
  "type": "percentage",  // "percentage" | "fixed"
  "value": 20,
  "minOrderAmount": 100,
  "maxUses": 1000,
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-08-31T23:59:59Z"
}
```

### POST /admin/coupons/validate
Validate coupon for order.

**Request:**
```json
{
  "code": "SUMMER20",
  "orderAmount": 500
}
```

**Response:**
```json
{
  "isValid": true,
  "discount": 100,
  "message": null
}
```

### GET /admin/coupons/:id
### PATCH /admin/coupons/:id
### DELETE /admin/coupons/:id

---

## Orders

### GET /admin/orders
List orders with pagination.

**Query Params:**
- `page`, `limit`
- `status`: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
- `paymentStatus`: "pending" | "paid" | "failed" | "refunded"
- `customerId`: Filter by customer

### POST /admin/orders
Create order (supports guest checkout).

**Request:**
```json
{
  "customerId": "...",  // optional for guest
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+201234567890"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "cityId": "...",
    "cityName": "Cairo",
    "country": "Egypt"
  },
  "items": [
    {
      "productId": "...",
      "productName": "iPhone 15",
      "sku": "IPH15-128",
      "image": "/uploads/iphone.jpg",
      "quantity": 1,
      "price": 999.99,
      "total": 999.99
    }
  ],
  "shippingMethodId": "...",
  "shippingMethodName": "Standard",
  "shippingCost": 50,
  "paymentMethod": "COD",
  "notes": "Please gift wrap"
}
```

**Response includes:**
- `orderNumber`: "ORD-XXXXXX-XXXX"
- `subtotal`, `discount`, `shippingCost`, `tax`, `total`

### GET /admin/orders/:id
Get order details with populated items.

### PATCH /admin/orders/:id/status
Update order status.

**Request:**
```json
{
  "status": "shipped"
}
```

### PATCH /admin/orders/:id/payment-status
Update payment status.

**Request:**
```json
{
  "paymentStatus": "paid"
}
```

### PATCH /admin/orders/:id/tracking
Add tracking number.

**Request:**
```json
{
  "trackingNumber": "EG123456789"
}
```

---

## Reviews

### GET /admin/reviews
List reviews.

**Query Params:**
- `productId`: Filter by product
- `customerId`: Filter by customer
- `isApproved`: true | false

### POST /admin/reviews
Create review (usually from front-office).

**Request:**
```json
{
  "productId": "...",
  "customerId": "...",
  "orderId": "...",  // optional, for verified purchase
  "rating": 5,
  "title": "Great product!",
  "comment": "Very happy with my purchase."
}
```

### GET /admin/reviews/:id
### PATCH /admin/reviews/:id/approve
Approve review (updates product rating).

### PATCH /admin/reviews/:id/reject
Reject review.

### DELETE /admin/reviews/:id
Delete review.

---

## Settings

### GET /admin/settings
Get store settings.

**Response:**
```json
{
  "storeName": "My Store",
  "currency": "EGP",
  "taxRate": 14,
  "taxName": "VAT",
  "contactInfo": {
    "email": "info@store.com",
    "phone": "+20123456789",
    "address": "Cairo, Egypt"
  },
  "socialLinks": {
    "facebook": "https://facebook.com/store",
    "instagram": "https://instagram.com/store"
  }
}
```

### PATCH /admin/settings
Update settings.

---

## Dashboard

### GET /admin/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "totalOrders": 150,
  "totalRevenue": 75000,
  "totalCustomers": 45,
  "totalProducts": 120,
  "pendingOrders": 8,
  "lowStockProducts": 5
}
```

### GET /admin/dashboard/recent-orders?limit=10
Get recent orders.

### GET /admin/dashboard/top-products?limit=10
Get top selling products.

---

## Common Response Formats

### Success
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Pagination
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |
