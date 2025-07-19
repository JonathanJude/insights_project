# 🧠 Insight Intelligence Dashboard – Technical Research Document

## 📋 Executive Summary

This document provides comprehensive technical research for building a React-based social media sentiment analysis dashboard focused on Nigerian politicians. The research covers data access methods, sentiment analysis APIs, demographic enrichment, visualization libraries, and ethical considerations.

---

## 🔗 1. Social Media Data Access

### 🐦 Twitter/X API v2

**Current Status (2024):**
- **Free Tier**: Eliminated in 2023
- **Basic Plan**: $100/month
  - 10,000 tweets/month
  - Real-time search
  - Tweet lookup
- **Pro Plan**: $5,000/month
  - 1M tweets/month
  - Full archive search
  - Advanced filtering

**Key Endpoints for Political Sentiment:**
```
GET /2/tweets/search/recent
GET /2/tweets/search/all (Pro+)
GET /2/users/by/username/{username}
GET /2/tweets/{id}/retweeted_by
GET /2/tweets/{id}/liking_users
```

**Rate Limits:**
- 300 requests/15min (Basic)
- 450 requests/15min (Pro)

**Nigerian Context Considerations:**
- Search for politician names, handles, hashtags
- Monitor trending political hashtags (#EndSARS, #2023Elections)
- Track mentions of political parties (APC, PDP, LP)

### 📸 Instagram Graph API

**Access Requirements:**
- Instagram Business Account
- Facebook Developer Account
- App Review for advanced permissions

**Available Data:**
- **Basic Display API**: User's own content only
- **Instagram Graph API**: Business accounts can access:
  - Media objects (posts, stories)
  - Comments on own posts
  - Hashtag search (limited)
  - User insights

**Limitations for Political Analysis:**
- Cannot search public posts by keyword
- Cannot access comments on other users' posts
- Hashtag search requires business account ownership

**Recommendation**: Limited utility for comprehensive political sentiment analysis

### 📘 Facebook Graph API

**Current Capabilities:**
- **Pages API**: Access to public page posts
- **Page Insights**: Engagement metrics for owned pages
- **Public Content**: Severely restricted since Cambridge Analytica

**Political Use Cases:**
- Monitor official politician Facebook pages
- Track engagement on political party pages
- Analyze comments on public political posts (if page owner)

**Key Endpoints:**
```
GET /{page-id}/posts
GET /{page-id}/insights
GET /{post-id}/comments
```

### 🧵 Threads (Meta)

**Current Status:**
- No official public API (as of 2024)
- Limited to web scraping (against ToS)
- Meta may release API in future

**Recommendation**: Monitor for API release, consider for future integration

### 🎵 TikTok API

**Research API:**
- Extremely limited access
- Academic researchers only
- Requires institutional affiliation
- Application process with 6-month review

**Commercial API:**
- TikTok for Business API
- Limited to advertising data
- No public content search

**Alternative Approaches:**
- Third-party scraping tools (Apify, Bright Data)
- Ethical considerations and ToS compliance

### 📺 YouTube Data API v3

**Access:**
- Free tier: 10,000 units/day
- Paid tiers available

**Relevant Endpoints:**
```
GET /search (videos by keyword)
GET /commentThreads (video comments)
GET /channels (channel information)
```

**Nigerian Political Use Cases:**
- Search for politician names in video titles/descriptions
- Analyze comments on political videos
- Track political channel engagement

**Rate Limits:**
- 10,000 units/day (free)
- Search costs 100 units per request
- Comment threads cost 1 unit per request

### 📰 News APIs

#### NewsAPI.org
- **Free**: 1,000 requests/month
- **Paid**: Starting at $449/month
- **Coverage**: Nigerian news sources included
- **Endpoints**: Everything, top headlines, sources

#### GNews API
- **Free**: 100 requests/day
- **Paid**: Starting at $9/month
- **Features**: Real-time news, search by keyword

#### Nigerian-Specific Sources
- Punch, Vanguard, ThisDay, Premium Times
- RSS feeds available for most major outlets

---

## 🤖 2. Sentiment Analysis APIs

### 🔵 Google Cloud Natural Language API

**Capabilities:**
- Sentiment analysis (score: -1 to 1, magnitude: 0+)
- Entity recognition
- Content classification
- Syntax analysis

**Nigerian English Support:**
- Good performance with Nigerian English
- Handles code-switching (English-Pidgin)
- May struggle with heavy Pidgin or local languages

**Pricing:**
- First 5,000 units/month: Free
- $1 per 1,000 units thereafter

**API Example:**
```javascript
const request = {
  document: {
    content: 'Buhari don try for this country',
    type: 'PLAIN_TEXT',
  },
  encodingType: 'UTF8',
};
```

### 🔷 Microsoft Azure Text Analytics

**Features:**
- Sentiment analysis with confidence scores
- Opinion mining (aspect-based sentiment)
- Language detection
- Key phrase extraction

**Nigerian Context:**
- Supports English language variants
- Good performance with informal text
- Opinion mining useful for political analysis

**Pricing:**
- Free tier: 5,000 transactions/month
- Standard: $1 per 1,000 transactions

### 🟢 OpenAI GPT Models

**Advantages:**
- Excellent context understanding
- Can handle Nigerian Pidgin with proper prompting
- Custom sentiment categories possible
- Reasoning about political context

**Considerations:**
- Higher cost per request
- Rate limits
- Requires careful prompt engineering

**Example Prompt:**
```
Analyze the sentiment of this Nigerian political comment: "{text}"
Consider Nigerian context, slang, and political references.
Return: positive/negative/neutral with confidence score.
```

### 🐒 MonkeyLearn

**Features:**
- Pre-built sentiment models
- Custom model training
- Batch processing
- Good documentation

**Nigerian Adaptation:**
- Can train custom models with Nigerian political data
- Supports text preprocessing
- Handles social media text well

**Pricing:**
- Free: 300 queries/month
- Paid: Starting at $299/month

### 🏆 Recommendation

**Primary**: Google Cloud Natural Language API
- Best balance of accuracy, cost, and Nigerian English support
- Reliable infrastructure
- Good documentation

**Secondary**: OpenAI GPT-4 for complex cases
- Use for ambiguous or context-heavy posts
- Custom political sentiment categories

---

## 📊 3. Demographic Tagging & Enrichment

### 👤 Gender Detection

**Name-Based Analysis:**
- **Genderize.io API**: $9/month for 10,000 requests
- **Gender API**: $19/month for 10,000 requests
- **Custom Nigerian Names Database**: Build from INEC voter data patterns

**Profile Image Analysis:**
- **AWS Rekognition**: $1 per 1,000 images
- **Google Vision API**: $1.50 per 1,000 images
- **Face++ API**: Free tier available

**Bio Text Analysis:**
- Extract gender indicators from bio text
- Keywords: "father", "mother", "husband", "wife"
- Pronouns: "he/him", "she/her"

### 🎂 Age Group Estimation

**Profile Image Analysis:**
- AWS Rekognition age range detection
- Accuracy: ±5 years typically
- Categories: 18-25, 26-35, 36-45, 46-55, 55+

**Bio Analysis:**
- Graduation years
- Career milestones
- Family status indicators

### 🗺️ Location/State Detection

**Profile Location Field:**
- Parse location strings
- Map to Nigerian states
- Handle variations ("Lagos", "Eko", "Lagos State")

**Bio Text Analysis:**
- Extract location mentions
- School/university affiliations
- Local language indicators

**Tweet Geolocation:**
- Very limited (most users disable)
- When available, highly accurate

### 🔧 Implementation Strategy

```javascript
const enrichUser = async (userData) => {
  const enriched = {
    ...userData,
    demographics: {
      gender: await detectGender(userData.name, userData.profileImage),
      ageGroup: await estimateAge(userData.profileImage, userData.bio),
      state: await detectLocation(userData.location, userData.bio),
      confidence: calculateConfidence()
    }
  };
  return enriched;
};
```

---

## 🗳️ 4. Politician Metadata Sources

### 🏛️ Official Sources

**INEC (Independent National Electoral Commission):**
- Candidate lists for elections
- Party affiliations
- Constituency information
- No direct API, requires web scraping

**National Assembly Website:**
- Current senators and representatives
- Committee memberships
- Biographical information

**State Government Websites:**
- Governor and deputy governor information
- State assembly members
- Commissioner lists

### 📚 Public Databases

**Wikipedia:**
- Comprehensive politician profiles
- Structured data via Wikidata API
- Regular updates by community

**Wikidata API Example:**
```javascript
const query = `
SELECT ?politician ?politicianLabel ?party ?partyLabel WHERE {
  ?politician wdt:P31 wd:Q5 .
  ?politician wdt:P27 wd:Q1033 .
  ?politician wdt:P102 ?party .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
`;
```

### 🏢 Civic Tech Platforms

**BudgIT:**
- Government official tracking
- Budget analysis
- Performance metrics

**Enough is Enough Nigeria:**
- Politician scorecards
- Election data
- Civic engagement metrics

**YiagaAfrica:**
- Election monitoring data
- Candidate information
- Voter education resources

### 📋 Custom Database Structure

```javascript
const politicianSchema = {
  id: 'string',
  name: 'string',
  party: 'string',
  position: 'string', // Governor, Senator, Rep, etc.
  state: 'string',
  constituency: 'string',
  gender: 'string',
  age: 'number',
  profileImage: 'string',
  socialMedia: {
    twitter: 'string',
    facebook: 'string',
    instagram: 'string'
  },
  biography: 'string',
  achievements: ['string'],
  controversies: ['string'],
  lastUpdated: 'date'
};
```

---

## 📦 5. Visualization Libraries

### 📊 Recharts

**Pros:**
- React-native integration
- Declarative API
- Good documentation
- TypeScript support
- Responsive by default

**Cons:**
- Limited chart types
- Performance issues with large datasets (>1000 points)
- Less customization than D3

**Best For:**
- Standard charts (line, bar, pie)
- Quick implementation
- React ecosystem integration

### 📈 Apache ECharts (with echarts-for-react)

**Pros:**
- Extensive chart types
- High performance
- Rich interactions
- Mobile optimized
- Large dataset handling

**Cons:**
- Steeper learning curve
- Larger bundle size
- Configuration-heavy

**Best For:**
- Complex visualizations
- Real-time data
- Interactive dashboards

### 🎨 Nivo

**Pros:**
- Beautiful defaults
- D3.js powered
- Rich animations
- Responsive design
- Good TypeScript support

**Cons:**
- Larger bundle size
- Performance concerns with large data
- Limited real-time capabilities

**Best For:**
- Static dashboards
- Presentation-quality charts
- Data exploration

### 🏆 Recommendation

**Primary**: Apache ECharts
- Best performance for real-time sentiment data
- Handles large datasets well
- Rich interaction capabilities
- Good mobile experience

**Secondary**: Recharts for simple charts
- Quick implementation
- Good for MVP development

---

## 🧰 6. NLP Tooling & Enrichment

### 🏷️ Topic Clustering

**Approach 1: Keyword-Based**
```javascript
const politicalTopics = {
  economy: ['economy', 'inflation', 'naira', 'fuel', 'subsidy'],
  security: ['boko haram', 'bandit', 'kidnap', 'police', 'army'],
  corruption: ['corruption', 'efcc', 'icpc', 'fraud', 'embezzle'],
  education: ['asuu', 'strike', 'school', 'university', 'education'],
  infrastructure: ['road', 'power', 'electricity', 'water', 'transport']
};
```

**Approach 2: ML-Based Topic Modeling**
- **Latent Dirichlet Allocation (LDA)**
- **BERT Topic Modeling**
- **Top2Vec**

### 🔖 Named Entity Recognition (NER)

**spaCy Nigerian Model:**
- Train custom model for Nigerian entities
- Recognize politician names, parties, locations
- Extract political organizations

**Google Cloud NLP:**
- Pre-trained entity recognition
- Custom entity extraction
- Good for general entities

### #️⃣ Hashtag Analysis

**Trending Detection:**
```javascript
const detectTrending = (hashtags, timeWindow) => {
  return hashtags
    .filter(tag => tag.timestamp > timeWindow)
    .reduce((acc, tag) => {
      acc[tag.text] = (acc[tag.text] || 0) + 1;
      return acc;
    }, {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
```

**Political Hashtag Categories:**
- Campaign hashtags: #Tinubu2023, #PeterObi, #Atiku
- Issue hashtags: #EndSARS, #RevolutionNow, #BringBackOurGirls
- Event hashtags: #NigeriaDecides, #Debate2023

---

## ⚖️ 7. Ethical, Legal, and Privacy Considerations

### 📜 Data Usage Limits

**Twitter/X API:**
- Rate limits strictly enforced
- Data retention policies
- Commercial use restrictions

**Facebook/Instagram:**
- Limited public data access
- User consent required for personal data
- Platform policy changes frequent

**YouTube:**
- Fair use policies
- Comment data considered public
- Rate limiting prevents abuse

### 🇳🇬 Nigerian Legal Compliance

**Nigeria Data Protection Regulation (NDPR):**
- Consent required for personal data processing
- Data subject rights (access, deletion, portability)
- Local data storage requirements for certain data types

**Cybercrime Act 2015:**
- Prohibits unauthorized access to computer systems
- Defines acceptable use of public data
- Penalties for data misuse

### 🤝 Ethical Guidelines

**Public Interest:**
- Focus on public figures and political discourse
- Avoid private citizen targeting
- Transparent methodology

**Bias Mitigation:**
- Acknowledge algorithm limitations
- Diverse data sources
- Regular bias audits

**Transparency:**
- Open about data sources
- Clear sentiment analysis methodology
- User ability to verify claims

### 🛡️ Privacy Protection

**Data Minimization:**
- Collect only necessary data
- Aggregate personal information
- Regular data purging

**Anonymization:**
- Remove personally identifiable information
- Use statistical aggregation
- Protect individual privacy

---

## 🔧 8. Technical Implementation Recommendations

### 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│   Data Pipeline  │───▶│   React App     │
│                 │    │                  │    │                 │
│ • Twitter API   │    │ • Data Ingestion │    │ • Dashboard     │
│ • News APIs     │    │ • Sentiment      │    │ • Visualizations│
│ • Web Scraping  │    │ • Enrichment     │    │ • Filters       │
│ • Manual Data   │    │ • Storage        │    │ • Export        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 💾 Data Storage Strategy

**Time-Series Database:**
- InfluxDB for sentiment time-series
- Efficient storage and querying
- Built-in aggregation functions

**Document Database:**
- MongoDB for politician profiles
- Flexible schema for varying data
- Good performance for read-heavy workloads

**Cache Layer:**
- Redis for frequently accessed data
- API response caching
- Real-time data buffering

### 🔄 Data Pipeline

**Batch Processing:**
- Daily politician data updates
- Historical sentiment analysis
- Demographic enrichment

**Real-Time Processing:**
- Live social media monitoring
- Trending topic detection
- Alert system for significant events

### 📱 Frontend Considerations

**Performance:**
- Virtual scrolling for large datasets
- Lazy loading of charts
- Progressive web app features

**Accessibility:**
- Screen reader compatibility
- Keyboard navigation
- Color-blind friendly palettes

---

## 🎯 9. Success Metrics & KPIs

### 📊 Technical Metrics

**Data Quality:**
- Sentiment accuracy: >85%
- Data freshness: <1 hour lag
- API uptime: >99.5%

**Performance:**
- Page load time: <3 seconds
- Chart render time: <1 second
- Search response: <500ms

### 👥 User Engagement

**Usage Metrics:**
- Daily active users
- Session duration
- Feature adoption rates
- Export/share frequency

**Content Metrics:**
- Politicians tracked
- Sentiment data points
- User-generated insights

---

## 🚀 10. Implementation Roadmap

### Phase 1: MVP (Months 1-2)
- Basic politician database
- Twitter API integration
- Simple sentiment analysis
- Core dashboard UI

### Phase 2: Enhancement (Months 3-4)
- Additional social platforms
- Advanced sentiment analysis
- Demographic enrichment
- Mobile optimization

### Phase 3: Scale (Months 5-6)
- Real-time processing
- Advanced analytics
- API for third parties
- Performance optimization

---

*This research document provides the foundation for building a comprehensive Nigerian political sentiment analysis platform. Regular updates will be needed as APIs and political landscape evolve.*