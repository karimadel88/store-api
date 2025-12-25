# Banners API Documentation

This document outlines the API endpoints for managing the Homepage Sliders (Banners).

## Base URL
Default: `http://localhost:3000/api`

---

## 1. Public API (Front Office)
*No authentication required.*

### Get Active Banners
Retrieves a list of all active banners to be displayed on the homepage slider.

- **Endpoint:** `GET /banners`
- **Response Example:**
  ```json
  [
    {
      "_id": "658a1b9c...",
      "title": "Big Sale",
      "subtitle": "Up to 50% off",
      "imageId": {
        "_id": "658a1a...",
        "url": "http://localhost:3000/uploads/banner1.jpg"
      },
      "link": "/category/sale",
      "buttonText": "Shop Now",
      "sortOrder": 0,
      "isActive": true
    }
  ]
  ```

---

## 2. Admin API (Back Office)
*Authentication required: Bearer Token (JWT)*

### Create Banner
- **Endpoint:** `POST /admin/banners`
- **Body:**
  ```json
  {
    "title": "New Collection",
    "subtitle": "Spring 2026",
    "imageId": "658a1a...",  // ID from Media upload
    "link": "/category/new",
    "buttonText": "Discover",
    "sortOrder": 1,
    "isActive": true
  }
  ```

### List All Banners (Admin)
Retrieves all banners (active and inactive).

- **Endpoint:** `GET /admin/banners`

### Get Banner Details
- **Endpoint:** `GET /admin/banners/:id`

### Update Banner
- **Endpoint:** `PATCH /admin/banners/:id`
- **Body:** (All fields are optional)
  ```json
  {
    "title": "Updated Title",
    "isActive": false
  }
  ```

### Delete Banner
- **Endpoint:** `DELETE /admin/banners/:id`
