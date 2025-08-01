# Interaction Insights & Analytics API Documentation

## Overview
The Interaction Insights API provides comprehensive analytics and recommendations based on user behavior data. These endpoints help understand user preferences, provide personalized recommendations, and offer valuable business insights.

## Authentication
All endpoints require authentication using Laravel Sanctum. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### 1. User Activity Analytics
**GET** `/api/insights/analytics`

Provides comprehensive analytics about user activity and behavior patterns.

#### Success Response (200)
```json
{
    "total_interactions": 150,
    "recent_interactions": 45,
    "interaction_types": [
        {
            "interaction_type": "view",
            "count": 80
        },
        {
            "interaction_type": "purchase",
            "count": 15
        },
        {
            "interaction_type": "add_to_cart",
            "count": 25
        }
    ],
    "device_usage": [
        {
            "device_type": "desktop",
            "count": 100
        },
        {
            "device_type": "mobile",
            "count": 50
        }
    ],
    "most_active_days": [
        {
            "date": "2025-06-20",
            "count": 12
        },
        {
            "date": "2025-06-19",
            "count": 8
        }
    ]
}
```

### 2. Recent Interactions
**GET** `/api/insights/recent`

Retrieves the user's most recent interactions with products.

#### Success Response (200)
```json
[
    {
        "interaction_id": 1,
        "user_id": 1,
        "product_id": 5,
        "interaction_type": "view",
        "timestamp": "2025-06-21T15:30:00.000000Z",
        "product": {
            "product_id": 5,
            "product_name": "Surgical Scissors",
            "price": 150.00,
            "category": "Surgical Instruments"
        }
    }
]
```

### 3. Personalized Recommendations
**GET** `/api/insights/recommendations`

Provides personalized product recommendations based on user's viewing and purchase history.

#### Success Response (200)
```json
{
    "recommendations": [
        {
            "product_id": 10,
            "product_name": "Surgical Forceps",
            "price": 120.00,
            "category": "Surgical Instruments",
            "average_rating": 4.5
        }
    ],
    "reason": "Based on your viewing and purchase history"
}
```

### 4. You Also Viewed
**GET** `/api/insights/you-also-viewed?product_id=1`

Shows products that other users viewed after viewing the specified product.

#### Query Parameters
- `product_id` (required): ID of the product to find similar viewing patterns

#### Success Response (200)
```json
{
    "products": [
        {
            "product_id": 8,
            "product_name": "Surgical Scalpel",
            "price": 85.00,
            "view_count": 25
        }
    ],
    "reason": "Other users who viewed this product also viewed"
}
```

### 5. Frequently Viewed Products
**GET** `/api/insights/frequently-viewed`

Shows the products the user has viewed most frequently.

#### Success Response (200)
```json
{
    "products": [
        {
            "product_id": 3,
            "product_name": "Surgical Mask",
            "price": 25.00,
            "view_count": 15
        }
    ],
    "total_views": 45
}
```

### 6. Trending Products
**GET** `/api/insights/trending`

Shows products that are trending based on recent interactions across all users.

#### Success Response (200)
```json
{
    "products": [
        {
            "product_id": 12,
            "product_name": "Digital Thermometer",
            "price": 45.00,
            "interaction_count": 150
        }
    ],
    "period": "Last 30 days"
}
```

### 7. Purchase History with Insights
**GET** `/api/insights/purchase-history`

Provides detailed purchase history with analytics and insights.

#### Success Response (200)
```json
{
    "purchase_interactions": [
        {
            "interaction_id": 25,
            "product_id": 5,
            "interaction_type": "purchase",
            "quantity": 2,
            "timestamp": "2025-06-15T10:30:00.000000Z",
            "product": {
                "product_id": 5,
                "product_name": "Surgical Scissors",
                "price": 150.00
            }
        }
    ],
    "orders": [
        {
            "order_id": 1,
            "order_number": "ORD20250615ABC123",
            "total_amount": 300.00,
            "order_status": "delivered",
            "product": {
                "product_id": 5,
                "product_name": "Surgical Scissors"
            }
        }
    ],
    "insights": {
        "total_purchases": 15,
        "total_spent": 2500.00,
        "average_order_value": 166.67,
        "category_preferences": [
            {
                "category": "Surgical Instruments",
                "count": 8,
                "total_spent": 1200.00
            }
        ],
        "monthly_trends": [
            {
                "month": "2025-06",
                "orders": 5,
                "total_spent": 800.00
            }
        ]
    }
}
```

### 8. Cart Behavior Analysis
**GET** `/api/insights/cart-analysis`

Analyzes user's cart behavior and provides insights.

#### Success Response (200)
```json
{
    "cart_items": [
        {
            "product": {
                "product_id": 7,
                "product_name": "Surgical Gloves",
                "price": 35.00
            },
            "add_count": 3,
            "remove_count": 1,
            "net_adds": 2,
            "last_interaction": "2025-06-21T14:20:00.000000Z"
        }
    ],
    "total_items": 5,
    "total_value": 450.00,
    "analysis": {
        "most_added_product": {
            "product": {
                "product_id": 7,
                "product_name": "Surgical Gloves"
            },
            "add_count": 3
        },
        "recent_additions": [
            {
                "product": {
                    "product_id": 7,
                    "product_name": "Surgical Gloves"
                },
                "net_adds": 2
            }
        ]
    }
}
```

### 9. Wishlist Items
**GET** `/api/insights/wishlist`

Retrieves all items currently in the user's wishlist.

#### Success Response (200)
```json
{
    "wishlist_items": [
        {
            "product": {
                "product_id": 9,
                "product_name": "Surgical Light",
                "price": 500.00
            },
            "added_count": 2,
            "removed_count": 0,
            "is_in_wishlist": true,
            "last_action": "add",
            "last_updated": "2025-06-20T16:45:00.000000Z"
        }
    ],
    "total_items": 3
}
```

### 10. Abandoned Cart Items
**GET** `/api/insights/abandoned-cart`

Shows products that were added to cart but not purchased in the last 30 days.

#### Success Response (200)
```json
{
    "abandoned_items": [
        {
            "product_id": 11,
            "product_name": "Surgical Drape",
            "price": 75.00,
            "abandoned_date": "2025-06-18T12:30:00.000000Z",
            "days_since_abandoned": 3
        }
    ],
    "total_abandoned": 2,
    "period": "Last 30 days"
}
```

### 11. Search History
**GET** `/api/insights/search-history`

Retrieves user's search history and popular search terms.

#### Success Response (200)
```json
{
    "search_history": [
        {
            "search_query": "surgical scissors",
            "timestamp": "2025-06-21T15:30:00.000000Z",
            "device_type": "desktop",
            "source_page": "search_results"
        }
    ],
    "popular_searches": [
        {
            "query": "surgical scissors",
            "count": 5,
            "last_searched": "2025-06-21T15:30:00.000000Z"
        }
    ],
    "total_searches": 25
}
```

### 12. User Interest Analysis
**GET** `/api/insights/interests`

Provides detailed analysis of user interests based on interaction patterns.

#### Success Response (200)
```json
{
    "category_preferences": [
        {
            "category": "Surgical Instruments",
            "views": 45,
            "cart_adds": 12,
            "purchases": 8,
            "wishlist_adds": 5,
            "total_interactions": 70,
            "engagement_score": 125
        }
    ],
    "brand_preferences": [
        {
            "brand": "Meditek",
            "interactions": 25,
            "purchases": 5,
            "preference_score": 5.0
        }
    ],
    "price_analysis": {
        "average_viewed_price": 150.00,
        "average_purchased_price": 200.00,
        "price_range_viewed": {
            "min": 25.00,
            "max": 500.00
        },
        "price_range_purchased": {
            "min": 50.00,
            "max": 400.00
        }
    },
    "top_interests": [
        {
            "category": "Surgical Instruments",
            "engagement_score": 125
        }
    ],
    "analysis_period": "Last 90 days"
}
```

### 13. Engagement Score
**GET** `/api/insights/engagement-score`

Calculates and provides user engagement metrics.

#### Success Response (200)
```json
{
    "recent_score": 85,
    "historical_score": 250,
    "engagement_level": "High",
    "recent_interactions": 25,
    "historical_interactions": 75,
    "periods": {
        "recent": "Last 30 days",
        "historical": "Last 90 days"
    }
}
```

## Business Intelligence Features

### Engagement Scoring System
- **View**: 1 point
- **Search**: 2 points  
- **Wishlist**: 3 points
- **Add to Cart**: 4 points
- **Purchase**: 10 points

### Engagement Levels
- **Very High**: 50+ points
- **High**: 30-49 points
- **Medium**: 15-29 points
- **Low**: 5-14 points
- **Very Low**: 0-4 points

### Recommendation Algorithm
1. **Category-based**: Products in same categories as user's interactions
2. **Popularity fallback**: High-rated products if insufficient category matches
3. **Cross-selling**: Products frequently bought together
4. **Seasonal**: Trending products in user's preferred categories

### Analytics Insights
- **Activity Patterns**: Most active days and times
- **Device Preferences**: Desktop vs mobile usage
- **Category Affinity**: Preferred product categories
- **Brand Loyalty**: Brand preference analysis
- **Price Sensitivity**: Price range preferences
- **Purchase Behavior**: Frequency and value patterns

## Testing Examples

### Using cURL

**Get Analytics:**
```bash
curl -X GET http://localhost:8000/api/insights/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Recommendations:**
```bash
curl -X GET http://localhost:8000/api/insights/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get You Also Viewed:**
```bash
curl -X GET "http://localhost:8000/api/insights/you-also-viewed?product_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Purchase History:**
```bash
curl -X GET http://localhost:8000/api/insights/purchase-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Set the Authorization header to `Bearer YOUR_TOKEN`
2. Use GET method with the appropriate endpoint URL
3. For endpoints with query parameters, add them to the URL

## Use Cases

### For E-commerce Applications
- **Product Recommendations**: Personalized product suggestions
- **Cross-selling**: "You also viewed" and "Frequently bought together"
- **Cart Recovery**: Abandoned cart analysis and recovery strategies
- **User Segmentation**: Engagement-based user categorization

### For Business Intelligence
- **Customer Behavior Analysis**: Understanding user preferences and patterns
- **Inventory Management**: Trending products and demand forecasting
- **Marketing Campaigns**: Targeted marketing based on user interests
- **Conversion Optimization**: Funnel analysis and optimization opportunities

### For User Experience
- **Personalized Experience**: Tailored product recommendations
- **Search Enhancement**: Improved search suggestions
- **Wishlist Management**: Easy access to saved items
- **Purchase History**: Order tracking and reordering
