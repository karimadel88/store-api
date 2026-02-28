# Frontend Implementation Prompt & API Guide

**Prompt to give to the Frontend AI/Developer:**

> "We have added four new features to our backend: **Transfer Brokerage with Customer Auth**, **FAQ**, **Blog**, and **Offers**. 
> Please implement the required frontend pages, components, and API integrations for both the **Admin Dashboard** and the **Public Store**. 
> Below is the complete API documentation for these new features. 
> 
> *Key requirements for the Frontend:*
> 1. **Transfer System:** Transfer customers have a *separate authentication system* from admins. Implement a login/register flow strictly for transfer customers. Send the returned `accessToken` via `Authorization: Bearer <token>` for all protected `/api/transfer/...` endpoints. 
> 2. **Admin Dashboard:** Implement CRUD tables and forms for `Transfer Methods`, `Fee Rules`, `Transfer Customers`, `Transfer Orders`, `FAQs`, `Blogs`, and `Offers`. The admin uses the existing global dashboard authentication.
> 3. **Storefront:** Implement public pages to view `FAQs`, `Blogs`, and `Offers`. Implement the transfer flow: users register/login -> view methods -> get quote -> confirm transfer -> view their order history."

---

## Complete API Documentation

### Base URL: `/api`

---

## 1. Transfer Customer Authentication (Public)

Transfer customers have their own auth tokens separate from admins.

- **Register:** `POST /transfer/auth/register`
  - Body: `{ "name": "...", "phone": "010...", "password": "...", "whatsapp": "..." }`
  - Returns: `{ "accessToken": "...", "refreshToken": "...", "customer": { "id": "...", "name": "...", "phone": "..." } }`

- **Login:** `POST /transfer/auth/login`
  - Body: `{ "phone": "010...", "password": "..." }`
  - Returns: `{ "accessToken": "...", "refreshToken": "...", "customer": { ... } }`

- **Get Profile:** `GET /transfer/auth/profile`
  - Headers: `Authorization: Bearer <transfer_access_token>`
  - Returns: Customer object

---

## 2. Transfer Brokerage (Store/Customer Endpoints)

- **Get Enabled Methods (Public):** `GET /transfer/methods`
  - Returns: List of active transfer methods (Vodafone Cash, InstaPay, etc.)

*(The following require Transfer Customer Auth Token)*

- **Get Quote:** `POST /transfer/quote`
  - Body: `{ "fromMethodId": "...", "toMethodId": "...", "amount": 1000 }`
  - Returns: `{ "available": true, "fee": 15, "total": 1015, "feeRuleId": "..." }`

- **Confirm Transfer:** `POST /transfer/confirm`
  - Body: `{ "fromMethodId": "...", "toMethodId": "...", "amount": 1000, "customerName": "...", "customerPhone": "...", "customerWhatsapp": "..." }`
  - Returns: `{ "order": { ... }, "whatsapp": { "whatsappUrl": "..." } }`

- **My Orders:** `GET /transfer/orders`
  - Query Params: `?page=1&limit=20&status=SUBMITTED`
  - Returns: Paginated list of the authenticated user's transfer orders

- **Get Single Order:** `GET /transfer/orders/:id`
  - Returns: Order details

---

## 3. FAQ, Blog, and Offers (Public Store Endpoints)

*(No auth required)*

- **FAQs:**
  - List all active FAQs: `GET /faqs`

- **Blogs:**
  - List all active Blogs: `GET /blogs`
  - Get Single Blog: `GET /blogs/:id`
  - *Note: Responses populate the `imageId` property with the full `Media` object.*

- **Offers:**
  - List all active Offers: `GET /offers`
  - Get Single Offer: `GET /offers/:id`
  - *Note: Responses populate the `imageId` property with the full `Media` object.*

---

## 4. Admin Management Endpoints

*(All admin endpoints require the Admin `Authorization: Bearer <token>`)*

### Transfer Management
- **Methods:** `CRUD /admin/transfer/methods`
  - Create/Update Body: `{ "name": "...", "code": "...", "category": "wallet/bank", "enabled": true, "sortOrder": 1 }`
- **Fee Rules:** `CRUD /admin/transfer/fee-rules`
  - Create/Update Body: `{ "fromMethodId": "...", "toMethodId": "...", "feeType": "PERCENT|FIXED", "feeValue": 1.5, "minFee": 5, "maxFee": 100, "priority": 10, "enabled": true }`
- **Customers:** 
  - List: `GET /admin/transfer/customers`
  - Get One: `GET /admin/transfer/customers/:id`
  - Toggle Active: `PATCH /admin/transfer/customers/:id/toggle-active` (Body: `{ "isActive": false }`)
- **Orders:**
  - List: `GET /admin/transfer/orders?status=...&phone=...`
  - Get One: `GET /admin/transfer/orders/:id` (Returns order + whatsapp data)
  - Update Status: `PATCH /admin/transfer/orders/:id/status` (Body: `{ "status": "IN_PROGRESS" }`)
  - Update Notes: `PATCH /admin/transfer/orders/:id/notes` (Body: `{ "adminNotes": "..." }`)

### FAQs Management
- `CRUD /admin/faqs`
  - Create/Update Body: `{ "question": "...", "answer": "...", "isActive": true, "sortOrder": 1 }`

### Blogs Management
- `CRUD /admin/blogs`
  - Create/Update Body: `{ "title": "...", "description": "...", "imageId": "...", "isActive": true, "sortOrder": 1 }`
  - *Note: `imageId` is optional and expects the `_id` of an uploaded Media item.*

### Offers Management
- `CRUD /admin/offers`
  - Create/Update Body: `{ "title": "...", "offer": "...", "imageId": "...", "isActive": true, "sortOrder": 1 }`
  - *Note: `imageId` is optional and expects the `_id` of an uploaded Media item.*
