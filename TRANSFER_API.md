# Manual Transfer Brokerage API Documentation

## Overview

The Transfer Brokerage system allows users to request manual money exchange between configurable transfer methods (e.g., Vodafone Cash → InstaPay). The system calculates commission, creates an order, and generates a WhatsApp message for manual execution by a broker.

**Base URL:** `/api`

---

## Public Endpoints (No Auth Required)

### GET `/api/transfer/methods`

List all enabled transfer methods.

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Vodafone Cash",
    "code": "VODAFONE_CASH",
    "category": "wallet",
    "enabled": true,
    "sortOrder": 1,
    "createdAt": "2026-02-27T00:00:00.000Z",
    "updatedAt": "2026-02-27T00:00:00.000Z"
  }
]
```

---

### POST `/api/transfer/quote`

Get a fee quote for a transfer.

**Request:**
```json
{
  "fromMethodId": "507f1f77bcf86cd799439011",
  "toMethodId": "507f1f77bcf86cd799439012",
  "amount": 1000
}
```

**Success Response (200):**
```json
{
  "available": true,
  "fromMethod": { "id": "...", "name": "Vodafone Cash", "code": "VODAFONE_CASH" },
  "toMethod": { "id": "...", "name": "InstaPay", "code": "INSTAPAY" },
  "amount": 1000,
  "fee": 15,
  "total": 1015,
  "feeRuleId": "..."
}
```

**Not Available Response (200):**
```json
{
  "available": false,
  "fromMethod": { "id": "...", "name": "...", "code": "..." },
  "toMethod": { "id": "...", "name": "...", "code": "..." },
  "amount": 1000,
  "fee": 0,
  "total": 0,
  "feeRuleId": null,
  "message": "This transfer route is not available at the moment"
}
```

**Error Responses:**
- `400` — Invalid amount, same from/to, disabled method

---

### POST `/api/transfer/confirm`

Confirm and create a transfer order.

**Request:**
```json
{
  "fromMethodId": "507f1f77bcf86cd799439011",
  "toMethodId": "507f1f77bcf86cd799439012",
  "amount": 1000,
  "customerName": "Ahmed Ali",
  "customerPhone": "01012345678",
  "customerWhatsapp": "01012345678"
}
```

**Response (201):**
```json
{
  "order": {
    "_id": "...",
    "orderNumber": "TRF-M1ABC2-X3Y4",
    "fromMethodId": { "_id": "...", "name": "Vodafone Cash", "code": "VODAFONE_CASH" },
    "toMethodId": { "_id": "...", "name": "InstaPay", "code": "INSTAPAY" },
    "amount": 1000,
    "fee": 15,
    "total": 1015,
    "status": "SUBMITTED",
    "customerName": "Ahmed Ali",
    "customerPhone": "01012345678",
    "customerWhatsapp": "01012345678",
    "createdAt": "2026-02-27T00:00:00.000Z"
  },
  "whatsapp": {
    "messageText": "📋 Order #TRF-M1ABC2-X3Y4\n💰 Amount: 1000\n...",
    "encodedMessage": "...",
    "whatsappUrl": "https://wa.me/201234567890?text=...",
    "brokerPhone": "201234567890"
  }
}
```

---

### GET `/api/transfer/orders?phone=01012345678`

List orders by phone number. **Phone query param is required.**

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `phone` | string | ✅ | Customer phone number |
| `page` | number | ❌ | Page number (default: 1) |
| `limit` | number | ❌ | Items per page (default: 20) |
| `status` | string | ❌ | Filter by status |

**Response:**
```json
{
  "data": [...],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/transfer/orders/:id?phone=01012345678`

Get single order detail. **Phone query param is required for ownership verification.**

---

## Admin Endpoints (JWT Required)

All admin endpoints require `Authorization: Bearer <token>` header.

### Transfer Methods CRUD

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/transfer/methods` | Create transfer method |
| `GET` | `/api/admin/transfer/methods` | List all methods |
| `GET` | `/api/admin/transfer/methods/:id` | Get single method |
| `PATCH` | `/api/admin/transfer/methods/:id` | Update method |
| `DELETE` | `/api/admin/transfer/methods/:id` | Delete method |

**Create/Update Request:**
```json
{
  "name": "Vodafone Cash",
  "code": "VODAFONE_CASH",
  "category": "wallet",
  "enabled": true,
  "sortOrder": 1
}
```

---

### Fee Rules CRUD

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/transfer/fee-rules` | Create fee rule |
| `GET` | `/api/admin/transfer/fee-rules` | List all rules |
| `GET` | `/api/admin/transfer/fee-rules/:id` | Get single rule |
| `PATCH` | `/api/admin/transfer/fee-rules/:id` | Update rule |
| `DELETE` | `/api/admin/transfer/fee-rules/:id` | Delete rule |

**Create/Update Request:**
```json
{
  "fromMethodId": "507f1f77bcf86cd799439011",
  "toMethodId": "507f1f77bcf86cd799439012",
  "feeType": "PERCENT",
  "feeValue": 1.5,
  "minFee": 5,
  "maxFee": 100,
  "enabled": true,
  "priority": 10
}
```

`feeType` values: `PERCENT` | `FIXED`

---

### Transfer Orders Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/transfer/orders` | List all orders |
| `GET` | `/api/admin/transfer/orders/:id` | Get order + WhatsApp message |
| `PATCH` | `/api/admin/transfer/orders/:id/status` | Update order status |
| `PATCH` | `/api/admin/transfer/orders/:id/notes` | Update admin notes |

**Update Status Request:**
```json
{ "status": "IN_PROGRESS" }
```

**Allowed Status Transitions:**
```
SUBMITTED → IN_PROGRESS | CANCELLED
IN_PROGRESS → COMPLETED | REJECTED
COMPLETED → (none)
CANCELLED → (none)
REJECTED → (none)
```

**Update Notes Request:**
```json
{ "adminNotes": "Waiting for customer confirmation" }
```

---

## Configuration

| Variable | Description | Example |
|---|---|---|
| `BROKER_WHATSAPP_PHONE` | Broker's WhatsApp number (with country code, no +) | `201234567890` |

## Status Enum Values

| Status | Description |
|---|---|
| `PENDING_CONFIRMATION` | Initial state (reserved for future use) |
| `SUBMITTED` | Order created and ready for processing |
| `IN_PROGRESS` | Broker is processing the transfer |
| `COMPLETED` | Transfer completed successfully |
| `CANCELLED` | Order cancelled by user or admin |
| `REJECTED` | Order rejected by broker |
