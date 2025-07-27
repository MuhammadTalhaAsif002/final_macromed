# Order API Documentation

## Overview
The Order API provides endpoints for managing customer orders in the Macromed Backend system. This includes creating orders, viewing order history, updating orders, and canceling orders.

## Authentication
All order endpoints require authentication using Laravel Sanctum. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### 1. Make Order (Create New Order)
**POST** `/api/orders/make-order`

Creates a new order for the authenticated user.

#### Request Body
```json
{
    "product_id": 1,
    "quantity": 2,
    "shipping_address": "123 Main St, City, State 12345",
    "billing_address": "123 Main St, City, State 12345",
    "contact_phone": "+1234567890",
    "contact_email": "customer@example.com",
    "special_instructions": "Please deliver during business hours",
    "payment_method": "credit_card"
}
```

#### Required Fields
- `product_id` (integer): ID of the product to order
- `quantity` (integer, min: 1): Quantity of the product
- `shipping_address` (string): Delivery address
- `contact_phone` (string, max: 20): Contact phone number
- `contact_email` (email, max: 255): Contact email address

#### Optional Fields
- `billing_address` (string): Billing address (defaults to shipping address if not provided)
- `special_instructions` (string): Special delivery instructions
- `payment_method` (string, max: 50): Payment method (e.g., "credit_card", "paypal", "bank_transfer")

#### Success Response (201)
```json
{
    "success": true,
    "message": "Order placed successfully",
    "data": {
        "order": {
            "order_id": 1,
            "user_id": 1,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 150.00,
            "total_amount": 300.00,
            "order_status": "pending",
            "order_number": "ORD20250621ABC123",
            "shipping_address": "123 Main St, City, State 12345",
            "billing_address": "123 Main St, City, State 12345",
            "contact_phone": "+1234567890",
            "contact_email": "customer@example.com",
            "special_instructions": "Please deliver during business hours",
            "payment_method": "credit_card",
            "payment_status": "pending",
            "order_date": "2025-06-21T18:45:00.000000Z",
            "created_at": "2025-06-21T18:45:00.000000Z",
            "updated_at": "2025-06-21T18:45:00.000000Z",
            "product": {
                "product_id": 1,
                "product_name": "Surgical Scissors",
                "price": 150.00,
                // ... other product details
            },
            "user": {
                "user_id": 1,
                "first_name": "John",
                "last_name": "Doe",
                // ... other user details
            }
        },
        "order_summary": {
            "order_number": "ORD20250621ABC123",
            "total_amount": 300.00,
            "estimated_delivery": "2025-06-28 18:45:00"
        }
    }
}
```

#### Error Responses

**422 - Validation Error**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "quantity": ["Insufficient stock. Available: 1"],
        "product_id": ["The selected product id is invalid."]
    }
}
```

**500 - Server Error**
```json
{
    "success": false,
    "message": "Failed to place order",
    "error": "Database connection error"
}
```

### 2. Get User Orders
**GET** `/api/orders`

Retrieves all orders for the authenticated user.

#### Success Response (200)
```json
[
    {
        "order_id": 1,
        "user_id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 150.00,
        "total_amount": 300.00,
        "order_status": "pending",
        "order_number": "ORD20250621ABC123",
        "shipping_address": "123 Main St, City, State 12345",
        "billing_address": "123 Main St, City, State 12345",
        "contact_phone": "+1234567890",
        "contact_email": "customer@example.com",
        "special_instructions": "Please deliver during business hours",
        "payment_method": "credit_card",
        "payment_status": "pending",
        "order_date": "2025-06-21T18:45:00.000000Z",
        "created_at": "2025-06-21T18:45:00.000000Z",
        "updated_at": "2025-06-21T18:45:00.000000Z",
        "product": {
            "product_id": 1,
            "product_name": "Surgical Scissors",
            "price": 150.00
        },
        "user": {
            "user_id": 1,
            "first_name": "John",
            "last_name": "Doe"
        }
    }
]
```

### 3. Get Specific Order
**GET** `/api/orders/{order_id}`

Retrieves a specific order by ID (only if owned by the authenticated user).

#### Success Response (200)
```json
{
    "order_id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "unit_price": 150.00,
    "total_amount": 300.00,
    "order_status": "pending",
    "order_number": "ORD20250621ABC123",
    "shipping_address": "123 Main St, City, State 12345",
    "billing_address": "123 Main St, City, State 12345",
    "contact_phone": "+1234567890",
    "contact_email": "customer@example.com",
    "special_instructions": "Please deliver during business hours",
    "payment_method": "credit_card",
    "payment_status": "pending",
    "order_date": "2025-06-21T18:45:00.000000Z",
    "created_at": "2025-06-21T18:45:00.000000Z",
    "updated_at": "2025-06-21T18:45:00.000000Z",
    "product": {
        "product_id": 1,
        "product_name": "Surgical Scissors",
        "price": 150.00
    },
    "user": {
        "user_id": 1,
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

**403 - Unauthorized**
```json
{
    "message": "Unauthorized"
}
```

### 4. Update Order
**PUT** `/api/orders/{order_id}`

Updates an existing order (only if owned by the authenticated user).

#### Request Body
```json
{
    "shipping_address": "456 New St, City, State 12345",
    "contact_phone": "+1987654321",
    "contact_email": "newemail@example.com",
    "special_instructions": "Updated delivery instructions"
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Order updated successfully",
    "data": {
        "order_id": 1,
        "shipping_address": "456 New St, City, State 12345",
        "contact_phone": "+1987654321",
        "contact_email": "newemail@example.com",
        "special_instructions": "Updated delivery instructions",
        // ... other order details
    }
}
```

### 5. Cancel Order
**POST** `/api/orders/{order_id}/cancel`

Cancels an existing order (only if owned by the authenticated user and status is 'pending').

#### Success Response (200)
```json
{
    "success": true,
    "message": "Order cancelled successfully",
    "data": {
        "order_id": 1,
        "order_status": "cancelled",
        // ... other order details
    }
}
```

**400 - Cannot Cancel**
```json
{
    "success": false,
    "message": "Order cannot be cancelled. Current status: shipped"
}
```

### 6. Delete Order
**DELETE** `/api/orders/{order_id}`

Deletes an order (only if owned by the authenticated user).

#### Success Response (200)
```json
{
    "success": true,
    "message": "Order deleted successfully"
}
```

## Order Status Values
- `pending`: Order is placed but not yet confirmed
- `confirmed`: Order has been confirmed
- `processing`: Order is being processed
- `shipped`: Order has been shipped
- `delivered`: Order has been delivered
- `cancelled`: Order has been cancelled

## Payment Status Values
- `pending`: Payment is pending
- `paid`: Payment has been received
- `failed`: Payment has failed

## Business Logic

### Stock Management
- When an order is placed, the product stock quantity is automatically decremented
- When an order is cancelled, the product stock quantity is automatically restored
- Orders cannot be placed if insufficient stock is available

### Order Number Generation
- Each order gets a unique order number in the format: `ORD{YYYYMMDD}{6-char-random}`
- Example: `ORD20250621ABC123`

### Security
- Users can only access their own orders
- All order operations require authentication
- Order updates and cancellations are restricted to the order owner

### Error Handling
- Comprehensive validation for all input fields
- Database transactions ensure data consistency
- Proper error messages for different failure scenarios

## Testing Examples

### Using cURL

**Make Order:**
```bash
curl -X POST http://localhost:8000/api/orders/make-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2,
    "shipping_address": "123 Main St, City, State 12345",
    "contact_phone": "+1234567890",
    "contact_email": "customer@example.com"
  }'
```

**Get Orders:**
```bash
curl -X GET http://localhost:8000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Cancel Order:**
```bash
curl -X POST http://localhost:8000/api/orders/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Set the Authorization header to `Bearer YOUR_TOKEN`
2. Use the appropriate HTTP method and URL
3. For POST/PUT requests, set Content-Type to `application/json`
4. Include the required request body for POST/PUT requests 