# API Specifications

## 🌐 Base Configuration

### Base URL
```
Development: http://localhost:3001/api/v1
Staging: https://staging-api.insights.com/api/v1
Production: https://api.insights.com/api/v1
```

### Authentication
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Rate Limiting
- **General**: 1000 requests per hour per IP
- **Search**: 100 requests per minute per IP
- **Real-time**: 50 WebSocket connections per IP

## 🔍 Politicians API

### Search Politicians
```http
GET /politicians
```

**Query Parameters:**
```typescript
{
  q?: string;                    // Search query
  party?: string[];              // Filter by parties
  state?: string[];              // Filter by states
  level?: string[];              // Filter by political level
  gender?: string[];             // Filter by gender
  age_group?: string[];          // Filter by age group
  sort_by?: 'name' | 'sentiment' | 'mentions' | 'relevance';
  sort_order?: 'asc' | 'desc';
  page?: number;                 // Page number (default: 1)
  limit?: number;                // Items per page (default: 20, max: 100)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pol_123",
      "name": "Peter Obi",
      "firstName": "Peter",
      "lastName": "Obi",
      "imageUrl": "https://cdn.insights.com/politicians/peter-obi.jpg",
      "party": "LP",
      "position": "Presidential Candidate",
      "state": "Anambra",
      "politicalLevel": "federal",
      "gender": "male",
      "ageGroup": "56+",
      "isActive": true,
      "socialMediaHandles": {
        "twitter": "@PeterObi",
        "facebook": "PeterObiOfficial",
        "instagram": "peterobi"
      },
      "recentSentiment": {
        "score": 0.65,
        "label": "positive",
        "mentionCount": 1250,
        "trend": "up",
        "changePercentage": 12.5
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalItems": 287,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Politician Details
```http
GET /politicians/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pol_123",
    "name": "Peter Obi",
    "firstName": "Peter",
    "lastName": "Obi",
    "imageUrl": "https://cdn.insights.com/politicians/peter-obi.jpg",
    "party": "LP",
    "position": "Presidential Candidate",
    "state": "Anambra",
    "politicalLevel": "federal",
    "gender": "male",
    "ageGroup": "56+",
    "isActive": true,
    "socialMediaHandles": {
      "twitter": "@PeterObi",
      "facebook": "PeterObiOfficial",
      "instagram": "peterobi"
    },
    "biography": "Former Governor of Anambra State...",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📊 Sentiment Analysis API

### Get Politician Sentiment Insights
```http
GET /politicians/{id}/insights
```

**Query Parameters:**
```typescript
{
  platform?: string[];           // Filter by platforms
  start_date?: string;           // ISO date string
  end_date?: string;             // ISO date string
  timeframe?: 'hour' | 'day' | 'week' | 'month';
  age_group?: string[];
  gender?: string[];
  state?: string[];
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "politicianId": "pol_123",
    "overallSentiment": {
      "score": 0.65,
      "label": "positive",
      "confidence": 0.87,
      "breakdown": {
        "positive": 65.2,
        "neutral": 22.8,
        "negative": 12.0
      }
    },
    "totalMentions": 1250,
    "totalEngagement": 45670,
    "platformBreakdown": [
      {
        "platform": "Twitter",
        "sentimentScore": 0.72,
        "mentionCount": 680,
        "engagementCount": 25400,
        "sentimentBreakdown": {
          "positive": 72.1,
          "neutral": 18.9,
          "negative": 9.0
        }
      },
      {
        "platform": "Facebook",
        "sentimentScore": 0.58,
        "mentionCount": 320,
        "engagementCount": 12800,
        "sentimentBreakdown": {
          "positive": 58.4,
          "neutral": 26.2,
          "negative": 15.4
        }
      }
    ],
    "demographicBreakdown": {
      "byGender": [
        {
          "gender": "male",
          "sentimentScore": 0.68,
          "mentionCount": 750,
          "percentage": 60.0
        },
        {
          "gender": "female",
          "sentimentScore": 0.61,
          "mentionCount": 500,
          "percentage": 40.0
        }
      ],
      "byAgeGroup": [
        {
          "ageGroup": "18-35",
          "sentimentScore": 0.75,
          "mentionCount": 625,
          "percentage": 50.0
        },
        {
          "ageGroup": "36-55",
          "sentimentScore": 0.58,
          "mentionCount": 437,
          "percentage": 35.0
        },
        {
          "ageGroup": "56+",
          "sentimentScore": 0.52,
          "mentionCount": 188,
          "percentage": 15.0
        }
      ],
      "byState": [
        {
          "state": "Lagos",
          "sentimentScore": 0.71,
          "mentionCount": 312,
          "percentage": 25.0
        },
        {
          "state": "Anambra",
          "sentimentScore": 0.82,
          "mentionCount": 187,
          "percentage": 15.0
        }
      ]
    },
    "trendData": [
      {
        "date": "2024-01-08",
        "sentimentScore": 0.62,
        "mentionCount": 180,
        "engagementCount": 6500
      },
      {
        "date": "2024-01-09",
        "sentimentScore": 0.68,
        "mentionCount": 195,
        "engagementCount": 7200
      }
    ],
    "topKeywords": ["leadership", "economy", "youth", "development", "change"],
    "lastUpdated": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Aggregated Sentiment Data
```http
GET /sentiments/aggregate
```

**Query Parameters:**
```typescript
{
  politician_ids?: string[];     // Specific politicians
  party?: string[];              // Filter by parties
  state?: string[];              // Filter by states
  platform?: string[];           // Filter by platforms
  start_date?: string;
  end_date?: string;
  timeframe?: 'hour' | 'day' | 'week' | 'month';
  group_by?: 'politician' | 'party' | 'state' | 'platform' | 'date';
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aggregationType": "party",
    "timeRange": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    },
    "results": [
      {
        "groupKey": "LP",
        "groupLabel": "Labour Party",
        "overallSentiment": {
          "score": 0.68,
          "breakdown": {
            "positive": 68.2,
            "neutral": 21.8,
            "negative": 10.0
          }
        },
        "totalMentions": 5420,
        "totalEngagement": 187650,
        "topPoliticians": [
          {
            "id": "pol_123",
            "name": "Peter Obi",
            "mentionCount": 1250,
            "sentimentScore": 0.72
          }
        ]
      }
    ],
    "summary": {
      "totalMentions": 25680,
      "averageSentiment": 0.54,
      "mostPositive": "LP",
      "mostNegative": "APC"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏛️ Party Analytics API

### Get Party Insights
```http
GET /parties/insights
```

**Query Parameters:**
```typescript
{
  parties?: string[];            // Specific parties to include
  start_date?: string;
  end_date?: string;
  platform?: string[];
  state?: string[];
  include_politicians?: boolean; // Include top politicians data
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "party": "LP",
      "partyName": "Labour Party",
      "overallSentiment": {
        "score": 0.68,
        "breakdown": {
          "positive": 68.2,
          "neutral": 21.8,
          "negative": 10.0
        }
      },
      "totalMentions": 5420,
      "totalEngagement": 187650,
      "platformBreakdown": [
        {
          "platform": "Twitter",
          "sentimentScore": 0.72,
          "mentionCount": 2980,
          "percentage": 55.0
        }
      ],
      "topPoliticians": [
        {
          "id": "pol_123",
          "name": "Peter Obi",
          "mentionCount": 1250,
          "sentimentScore": 0.72,
          "engagementCount": 45670
        }
      ],
      "trendData": [
        {
          "date": "2024-01-08",
          "sentimentScore": 0.65,
          "mentionCount": 380
        }
      ],
      "stateBreakdown": [
        {
          "state": "Lagos",
          "sentimentScore": 0.71,
          "mentionCount": 812,
          "percentage": 15.0
        }
      ]
    }
  ],
  "comparison": {
    "mostPositive": "LP",
    "mostMentioned": "APC",
    "mostEngaging": "PDP",
    "fastestGrowing": "NNPP"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Compare Parties
```http
GET /parties/compare
```

**Query Parameters:**
```typescript
{
  parties: string[];             // Required: parties to compare
  metrics?: string[];            // sentiment, mentions, engagement
  start_date?: string;
  end_date?: string;
  platform?: string[];
}
```

## 📈 Dashboard API

### Get Dashboard Overview
```http
GET /dashboard/overview
```

**Query Parameters:**
```typescript
{
  timeframe?: 'day' | 'week' | 'month';
  platform?: string[];
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPoliticians": 287,
      "totalMentions": 125680,
      "totalEngagement": 2456780,
      "overallSentiment": {
        "score": 0.54,
        "breakdown": {
          "positive": 54.2,
          "neutral": 28.8,
          "negative": 17.0
        }
      }
    },
    "trendingPoliticians": [
      {
        "politician": {
          "id": "pol_123",
          "name": "Peter Obi",
          "party": "LP",
          "imageUrl": "https://cdn.insights.com/politicians/peter-obi.jpg"
        },
        "mentionCount": 1250,
        "sentimentScore": 0.72,
        "sentimentChange": 12.5,
        "engagementRate": 0.036,
        "topPlatform": "Twitter"
      }
    ],
    "platformStats": [
      {
        "platform": "Twitter",
        "sentimentBreakdown": {
          "positive": 58.4,
          "neutral": 26.2,
          "negative": 15.4
        },
        "totalMentions": 68420,
        "averageEngagement": 1250,
        "topPoliticians": ["pol_123", "pol_456"]
      }
    ],
    "sentimentTrend": [
      {
        "date": "2024-01-08",
        "value": 0.52,
        "metadata": {
          "mentionCount": 8420,
          "engagementCount": 156780
        }
      }
    ],
    "partyComparison": [
      {
        "party": "LP",
        "sentimentScore": 0.68,
        "mentionCount": 5420,
        "changePercentage": 8.5
      }
    ],
    "lastUpdated": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Trending Politicians
```http
GET /dashboard/trending
```

**Query Parameters:**
```typescript
{
  timeframe?: 'hour' | 'day' | 'week';
  limit?: number;                // Default: 10, Max: 50
  platform?: string[];
  metric?: 'mentions' | 'sentiment' | 'engagement';
}
```

## 📱 Social Posts API

### Get Recent Posts
```http
GET /posts
```

**Query Parameters:**
```typescript
{
  politician_id?: string;
  platform?: string[];
  sentiment?: string[];          // positive, neutral, negative
  start_date?: string;
  end_date?: string;
  limit?: number;                // Default: 20, Max: 100
  offset?: number;
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post_789",
      "politicianId": "pol_123",
      "platform": "Twitter",
      "content": "Great discussion on economic policies...",
      "authorHandle": "@citizen_voice",
      "authorFollowers": 15420,
      "sentimentScore": 0.75,
      "sentimentLabel": "positive",
      "engagementMetrics": {
        "likes": 245,
        "shares": 67,
        "comments": 89,
        "views": 12500
      },
      "publishedAt": "2024-01-15T08:30:00Z",
      "extractedAt": "2024-01-15T08:35:00Z",
      "isVerified": false,
      "language": "en",
      "location": {
        "state": "Lagos",
        "city": "Lagos"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 125,
    "totalItems": 2487,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔧 Utility APIs

### Get Filter Options
```http
GET /filters/options
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parties": [
      {"value": "APC", "label": "All Progressives Congress", "count": 89},
      {"value": "PDP", "label": "Peoples Democratic Party", "count": 76},
      {"value": "LP", "label": "Labour Party", "count": 45}
    ],
    "states": [
      {"value": "Lagos", "label": "Lagos", "count": 34},
      {"value": "Kano", "label": "Kano", "count": 28}
    ],
    "platforms": [
      {"value": "Twitter", "label": "Twitter", "count": 287},
      {"value": "Facebook", "label": "Facebook", "count": 245}
    ],
    "politicalLevels": [
      {"value": "federal", "label": "Federal", "count": 156},
      {"value": "state", "label": "State", "count": 98},
      {"value": "local", "label": "Local", "count": 33}
    ],
    "ageGroups": [
      {"value": "18-35", "label": "Youth (18-35)", "count": 89},
      {"value": "36-55", "label": "Middle-aged (36-55)", "count": 134},
      {"value": "56+", "label": "Senior (56+)", "count": 64}
    ],
    "genders": [
      {"value": "male", "label": "Male", "count": 198},
      {"value": "female", "label": "Female", "count": 89}
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Search Autocomplete
```http
GET /search/autocomplete
```

**Query Parameters:**
```typescript
{
  q: string;                     // Required: search query
  limit?: number;                // Default: 10, Max: 20
  type?: 'politician' | 'party' | 'all';
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "politician",
        "id": "pol_123",
        "text": "Peter Obi",
        "subtitle": "Labour Party • Presidential Candidate",
        "imageUrl": "https://cdn.insights.com/politicians/peter-obi.jpg"
      },
      {
        "type": "party",
        "id": "LP",
        "text": "Labour Party",
        "subtitle": "45 politicians"
      }
    ],
    "query": "peter",
    "totalResults": 2
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔄 Real-time APIs

### WebSocket Connection
```
ws://localhost:3001/ws
wss://api.insights.com/ws
```

**Connection Parameters:**
```typescript
{
  token: string;                 // JWT token
  subscriptions?: string[];      // politician IDs to subscribe to
}
```

**Message Types:**
```json
{
  "type": "sentiment_update",
  "payload": {
    "politicianId": "pol_123",
    "newSentimentScore": 0.68,
    "previousSentimentScore": 0.65,
    "platform": "Twitter",
    "changePercentage": 4.6,
    "mentionCount": 45
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "POLITICIAN_NOT_FOUND",
    "message": "The requested politician could not be found",
    "details": {
      "politicianId": "pol_999"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes
- `POLITICIAN_NOT_FOUND` (404)
- `INVALID_PARAMETERS` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

## 📊 Mock Data Endpoints

### Development Mode
All endpoints support a `mock=true` query parameter for development:

```http
GET /politicians?mock=true
GET /politicians/pol_123/insights?mock=true
GET /dashboard/overview?mock=true
```

This returns realistic mock data for UI development without requiring a full backend implementation.