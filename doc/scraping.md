# 🕷️ Social Media Data Scraping Guide

## 📋 Document Information

**Project**: Insight Intelligence Dashboard  
**Document Type**: Technical Research & Implementation Guide  
**Date**: December 2024  
**Scope**: Comprehensive social media data scraping strategies  
**Target**: Nigerian political sentiment analysis  

---

## 🎯 Executive Summary

### Scraping Strategy Overview

This document provides comprehensive research on data scraping methodologies for major social media platforms, offering both free and paid solutions with detailed technical implementation guides. The focus is on collecting political sentiment data from Nigerian social media discourse while maintaining legal compliance and technical reliability.

### Platform Accessibility Matrix

| Platform | Official API | Free Scraping | Paid Scraping | Difficulty | Legal Risk |
|----------|-------------|---------------|---------------|------------|------------|
| **Twitter/X** | Limited/Paid | Hard | Easy | High | Medium |
| **Facebook** | Restricted | Very Hard | Medium | Very High | High |
| **Instagram** | Very Limited | Hard | Medium | High | High |
| **YouTube** | Good Free Tier | Easy | Easy | Low | Low |
| **TikTok** | Research Only | Medium | Easy | Medium | Medium |
| **LinkedIn** | Limited | Hard | Medium | High | High |
| **Reddit** | Good Free | Easy | Easy | Low | Low |
| **Telegram** | Good Free | Easy | Easy | Low | Low |
| **WhatsApp** | None | Impossible | Impossible | Impossible | Very High |

---

## 🐦 Twitter/X Scraping

### 🔧 Technical Approaches

#### 1. Official API (Recommended)
**Cost**: $100-$5,000+/month  
**Reliability**: Very High  
**Legal**: Fully Compliant  

```javascript
// Twitter API v2 Implementation
const TwitterApi = require('twitter-api-v2').default;

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Search for tweets about Nigerian politicians
async function searchPoliticalTweets(politician, maxResults = 100) {
  try {
    const tweets = await client.v2.search(politician, {
      max_results: maxResults,
      'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'lang'],
      'user.fields': ['name', 'username', 'location', 'verified'],
      expansions: ['author_id']
    });
    
    return tweets.data;
  } catch (error) {
    console.error('Twitter API Error:', error);
    throw error;
  }
 }
```

#### 2. Web Scraping with Apify
**Cost**: $49-$499/month  
**Reliability**: High  
**Legal**: Gray area  

```javascript
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapeTikTokWithApify(hashtags, usernames, maxVideos = 100) {
    const input = {
        hashtags: hashtags,
        usernames: usernames,
        resultsPerPage: maxVideos,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: false
    };

    try {
        const run = await client.actor('clockworks/free-tiktok-scraper').call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        return items.map(item => ({
            ...item,
            platform: 'tiktok',
            scraped_at: new Date().toISOString(),
            political_relevance: assessPoliticalRelevance(item.text || '')
        }));
    } catch (error) {
        console.error('Apify TikTok scraping error:', error);
        throw error;
    }
}

// Usage for Nigerian political content
const nigerianPoliticalHashtags = [
    'NigerianPolitics',
    'Nigeria2023',
    'Tinubu',
    'Atiku',
    'PeterObi',
    'EndSARS'
];

const politicalAccounts = [
    '@officialmbuhari',
    '@atiku',
    '@peterobi',
    '@jidesanwoolu'
];

scrapeTikTokWithApify(nigerianPoliticalHashtags, politicalAccounts, 200)
    .then(results => console.log(`Scraped ${results.length} TikTok videos`))
    .catch(error => console.error('Error:', error));
```

---

## 💼 LinkedIn Scraping

### 🔧 Technical Approaches

#### 1. LinkedIn API (Very Limited)
**Cost**: Free with restrictions  
**Reliability**: High for available data  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class LinkedInAPI {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.linkedin.com/v2';
    }
    
    // Only works for user's own profile and connections
    async getProfile(personId = '~') {
        try {
            const response = await axios.get(`${this.baseUrl}/people/${personId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                params: {
                    projection: '(id,firstName,lastName,headline,summary,positions)'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('LinkedIn API Error:', error);
            throw error;
        }
    }
    
    async getCompanyUpdates(companyId, count = 20) {
        try {
            const response = await axios.get(`${this.baseUrl}/companies/${companyId}/updates`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                params: {
                    count: count,
                    start: 0
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('LinkedIn Company Updates Error:', error);
            throw error;
        }
    }
}
```

#### 2. Web Scraping (Difficult)
**Cost**: Free  
**Reliability**: Low  
**Legal**: Violates ToS  

```python
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class LinkedInScraper:
    def __init__(self):
        options = uc.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = uc.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.is_logged_in = False
    
    def login(self, email, password):
        """Login to LinkedIn (required for most scraping)"""
        self.driver.get('https://www.linkedin.com/login')
        
        # Enter credentials
        email_input = self.wait.until(EC.presence_of_element_located((By.ID, 'username')))
        password_input = self.driver.find_element(By.ID, 'password')
        
        email_input.send_keys(email)
        password_input.send_keys(password)
        
        # Click login
        login_button = self.driver.find_element(By.XPATH, '//button[@type="submit"]')
        login_button.click()
        
        # Wait for login to complete
        time.sleep(5)
        
        # Check if login was successful
        if 'feed' in self.driver.current_url or 'in/' in self.driver.current_url:
            self.is_logged_in = True
            print('Successfully logged in to LinkedIn')
        else:
            raise Exception('LinkedIn login failed')
    
    def search_posts(self, query, max_posts=50):
        """Search for posts on LinkedIn"""
        if not self.is_logged_in:
            raise Exception('Must be logged in to search LinkedIn')
        
        search_url = f'https://www.linkedin.com/search/results/content/?keywords={query.replace(" ", "%20")}'
        self.driver.get(search_url)
        
        posts = []
        scroll_count = 0
        max_scrolls = max_posts // 10 + 1
        
        while scroll_count < max_scrolls and len(posts) < max_posts:
            # Wait for posts to load
            time.sleep(3)
            
            # Extract posts from current view
            post_elements = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'div[data-id] .feed-shared-update-v2'
            )
            
            for element in post_elements:
                try:
                    post_data = self.extract_post_data(element)
                    if post_data and post_data not in posts:
                        posts.append(post_data)
                except Exception as e:
                    continue
            
            # Scroll down
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            scroll_count += 1
        
        return posts[:max_posts]
    
    def extract_post_data(self, element):
        """Extract data from a LinkedIn post element"""
        try:
            # Post text
            try:
                text_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '.feed-shared-text .break-words'
                )
                post_text = text_element.text
            except:
                post_text = ''
            
            # Author name
            try:
                author_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '.feed-shared-actor__name'
                )
                author_name = author_element.text
            except:
                author_name = ''
            
            # Post time
            try:
                time_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '.feed-shared-actor__sub-description'
                )
                post_time = time_element.text
            except:
                post_time = ''
            
            # Engagement metrics
            try:
                likes_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '.social-counts-reactions__count'
                )
                likes = likes_element.text
            except:
                likes = '0'
            
            try:
                comments_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '.social-counts-comments'
                )
                comments = comments_element.text
            except:
                comments = '0'
            
            return {
                'text': post_text,
                'author': author_name,
                'timestamp': post_time,
                'likes': likes,
                'comments': comments,
                'platform': 'linkedin'
            }
            
        except Exception as e:
            return None
    
    def close(self):
        self.driver.quit()
```

---

## 🤖 Reddit Scraping

### 🔧 Technical Approaches

#### 1. Reddit API (PRAW - Recommended)
**Cost**: Free  
**Reliability**: Very High  
**Legal**: Fully Compliant  

```python
import praw
import pandas as pd
from datetime import datetime, timedelta

class RedditScraper:
    def __init__(self, client_id, client_secret, user_agent):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
    
    def search_posts(self, query, subreddit='all', limit=100, time_filter='month'):
        """Search for posts across Reddit"""
        try:
            subreddit_obj = self.reddit.subreddit(subreddit)
            posts = []
            
            # Search posts
            search_results = subreddit_obj.search(
                query, 
                limit=limit, 
                time_filter=time_filter,
                sort='relevance'
            )
            
            for post in search_results:
                post_data = {
                    'id': post.id,
                    'title': post.title,
                    'text': post.selftext,
                    'author': str(post.author) if post.author else '[deleted]',
                    'subreddit': str(post.subreddit),
                    'score': post.score,
                    'upvote_ratio': post.upvote_ratio,
                    'num_comments': post.num_comments,
                    'created_utc': datetime.fromtimestamp(post.created_utc),
                    'url': post.url,
                    'permalink': f"https://reddit.com{post.permalink}"
                }
                posts.append(post_data)
            
            return posts
            
        except Exception as e:
            print(f"Error searching Reddit: {e}")
            return []
    
    def get_subreddit_posts(self, subreddit_name, limit=100, sort='hot'):
        """Get posts from a specific subreddit"""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts = []
            
            if sort == 'hot':
                post_generator = subreddit.hot(limit=limit)
            elif sort == 'new':
                post_generator = subreddit.new(limit=limit)
            elif sort == 'top':
                post_generator = subreddit.top(limit=limit, time_filter='month')
            else:
                post_generator = subreddit.hot(limit=limit)
            
            for post in post_generator:
                post_data = {
                    'id': post.id,
                    'title': post.title,
                    'text': post.selftext,
                    'author': str(post.author) if post.author else '[deleted]',
                    'subreddit': str(post.subreddit),
                    'score': post.score,
                    'upvote_ratio': post.upvote_ratio,
                    'num_comments': post.num_comments,
                    'created_utc': datetime.fromtimestamp(post.created_utc),
                    'url': post.url,
                    'permalink': f"https://reddit.com{post.permalink}"
                }
                posts.append(post_data)
            
            return posts
            
        except Exception as e:
            print(f"Error getting subreddit posts: {e}")
            return []
    
    def get_post_comments(self, post_id, limit=100):
        """Get comments from a specific post"""
        try:
            submission = self.reddit.submission(id=post_id)
            submission.comments.replace_more(limit=0)  # Remove "more comments" objects
            
            comments = []
            
            for comment in submission.comments.list()[:limit]:
                if hasattr(comment, 'body'):  # Ensure it's a comment, not a "more comments" object
                    comment_data = {
                        'id': comment.id,
                        'text': comment.body,
                        'author': str(comment.author) if comment.author else '[deleted]',
                        'score': comment.score,
                        'created_utc': datetime.fromtimestamp(comment.created_utc),
                        'parent_id': comment.parent_id,
                        'post_id': post_id
                    }
                    comments.append(comment_data)
            
            return comments
            
        except Exception as e:
            print(f"Error getting post comments: {e}")
            return []

# Usage for Nigerian political content
def scrape_nigerian_political_reddit():
    scraper = RedditScraper(
        client_id='your_client_id',
        client_secret='your_client_secret',
        user_agent='NigerianPoliticalScraper/1.0'
    )
    
    # Nigerian political subreddits
    political_subreddits = [
        'Nigeria',
        'NigerianPolitics',
        'Lagos',
        'Abuja',
        'NigerianNews'
    ]
    
    # Political search terms
    search_terms = [
        'Tinubu',
        'Atiku',
        'Peter Obi',
        'Kwankwaso',
        'Nigerian election',
        'APC',
        'PDP',
        'Labour Party',
        'NNPP'
    ]
    
    all_posts = []
    all_comments = []
    
    # Scrape subreddits
    for subreddit in political_subreddits:
        print(f"Scraping r/{subreddit}...")
        posts = scraper.get_subreddit_posts(subreddit, limit=50, sort='hot')
        all_posts.extend(posts)
        
        # Get comments for top posts
        for post in posts[:10]:  # Limit to top 10 posts per subreddit
            comments = scraper.get_post_comments(post['id'], limit=50)
            all_comments.extend(comments)
    
    # Search for specific terms
    for term in search_terms:
        print(f"Searching for '{term}'...")
        posts = scraper.search_posts(term, subreddit='all', limit=25)
        all_posts.extend(posts)
    
    return {
        'posts': all_posts,
        'comments': all_comments
    }
```

---

## 📱 Telegram Scraping

### 🔧 Technical Approaches

#### 1. Telegram API (Telethon - Recommended)
**Cost**: Free  
**Reliability**: Very High  
**Legal**: Compliant with proper permissions  

```python
from telethon import TelegramClient, events
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import PeerChannel
import asyncio
from datetime import datetime, timedelta

class TelegramScraper:
    def __init__(self, api_id, api_hash, phone_number):
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone_number = phone_number
        self.client = TelegramClient('session', api_id, api_hash)
    
    async def initialize(self):
        """Initialize and authenticate the Telegram client"""
        await self.client.start(phone=self.phone_number)
        print("Telegram client initialized successfully")
    
    async def get_channel_messages(self, channel_username, limit=100, offset_date=None):
        """Get messages from a Telegram channel"""
        try:
            entity = await self.client.get_entity(channel_username)
            messages = []
            
            async for message in self.client.iter_messages(
                entity, 
                limit=limit, 
                offset_date=offset_date
            ):
                if message.text:
                    message_data = {
                        'id': message.id,
                        'text': message.text,
                        'date': message.date,
                        'views': message.views,
                        'forwards': message.forwards,
                        'replies': message.replies.replies if message.replies else 0,
                        'channel': channel_username,
                        'media_type': 'text'
                    }
                    
                    if message.media:
                        message_data['media_type'] = str(type(message.media).__name__)
                    
                    messages.append(message_data)
            
            return messages
            
        except Exception as e:
            print(f"Error getting messages from {channel_username}: {e}")
            return []
    
    async def search_messages(self, query, channels, limit=100):
        """Search for messages containing specific keywords across channels"""
        all_messages = []
        
        for channel in channels:
            try:
                entity = await self.client.get_entity(channel)
                
                async for message in self.client.iter_messages(
                    entity, 
                    limit=limit, 
                    search=query
                ):
                    if message.text:
                        message_data = {
                            'id': message.id,
                            'text': message.text,
                            'date': message.date,
                            'views': message.views,
                            'forwards': message.forwards,
                            'replies': message.replies.replies if message.replies else 0,
                            'channel': channel,
                            'search_query': query
                        }
                        all_messages.append(message_data)
                
            except Exception as e:
                print(f"Error searching {channel} for '{query}': {e}")
                continue
        
        return all_messages
    
    async def get_channel_info(self, channel_username):
        """Get information about a Telegram channel"""
        try:
            entity = await self.client.get_entity(channel_username)
            
            channel_info = {
                'id': entity.id,
                'title': entity.title,
                'username': entity.username,
                'participants_count': entity.participants_count,
                'about': entity.about if hasattr(entity, 'about') else '',
                'verified': entity.verified if hasattr(entity, 'verified') else False
            }
            
            return channel_info
            
        except Exception as e:
            print(f"Error getting channel info for {channel_username}: {e}")
            return None
    
    async def close(self):
        """Close the Telegram client"""
        await self.client.disconnect()

# Usage for Nigerian political content
async def scrape_nigerian_political_telegram():
    scraper = TelegramScraper(
        api_id='your_api_id',
        api_hash='your_api_hash',
        phone_number='your_phone_number'
    )
    
    await scraper.initialize()
    
    # Nigerian political Telegram channels
    political_channels = [
        '@ChannelsTV',
        '@ARISEtv',
        '@TVCNewsNG',
        '@PremiumTimesng',
        '@PunchNewspapers',
        '@TheNationNews',
        '@dailytrust',
        '@SaharaReporters'
    ]
    
    # Political search terms
    search_terms = [
        'Tinubu',
        'Atiku',
        'Peter Obi',
        'Kwankwaso',
        'Nigerian politics',
        'election',
        'democracy'
    ]
    
    all_messages = []
    channel_info = []
    
    # Get channel information
    for channel in political_channels:
        info = await scraper.get_channel_info(channel)
        if info:
            channel_info.append(info)
    
    # Get recent messages from each channel
    for channel in political_channels:
        print(f"Scraping {channel}...")
        messages = await scraper.get_channel_messages(
            channel, 
            limit=100, 
            offset_date=datetime.now() - timedelta(days=30)
        )
        all_messages.extend(messages)
    
    # Search for specific terms
    for term in search_terms:
        print(f"Searching for '{term}'...")
        search_results = await scraper.search_messages(
            term, 
            political_channels, 
            limit=50
        )
        all_messages.extend(search_results)
    
    await scraper.close()
    
    return {
        'messages': all_messages,
        'channels': channel_info
    }

# Run the scraper
# asyncio.run(scrape_nigerian_political_telegram())
```

---

## 💬 WhatsApp Scraping

### 🔧 Technical Approaches

#### 1. WhatsApp Business API (Very Limited)
**Cost**: Varies by provider  
**Reliability**: High for available data  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class WhatsAppBusinessAPI {
    constructor(accessToken, phoneNumberId) {
        this.accessToken = accessToken;
        this.phoneNumberId = phoneNumberId;
        this.baseUrl = 'https://graph.facebook.com/v18.0';
    }
    
    // Note: WhatsApp Business API is primarily for sending messages
    // Reading messages requires webhook setup and user consent
    async sendMessage(to, message) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    text: { body: message }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('WhatsApp API Error:', error);
            throw error;
        }
    }
    
    // Webhook handler for receiving messages
    handleWebhook(webhookData) {
        const { entry } = webhookData;
        
        if (entry && entry[0] && entry[0].changes) {
            const changes = entry[0].changes[0];
            
            if (changes.field === 'messages') {
                const messages = changes.value.messages;
                
                return messages.map(message => ({
                    id: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    text: message.text ? message.text.body : '',
                    type: message.type,
                    platform: 'whatsapp'
                }));
            }
        }
        
        return [];
    }
}
```

#### 2. WhatsApp Web Automation (Risky)
**Cost**: Free  
**Reliability**: Very Low  
**Legal**: Violates ToS  

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import qrcode
from io import BytesIO
import base64

class WhatsAppWebScraper:
    def __init__(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--user-data-dir=./whatsapp_session')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 30)
    
    def login(self):
        """Login to WhatsApp Web (requires QR code scan)"""
        self.driver.get('https://web.whatsapp.com')
        
        try:
            # Wait for QR code or main interface
            qr_code = self.wait.until(
                EC.any_of(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'canvas')),
                    EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
                )
            )
            
            # Check if already logged in
            if self.driver.find_elements(By.CSS_SELECTOR, '[data-testid="chat-list"]'):
                print('Already logged in to WhatsApp Web')
                return True
            
            print('Please scan the QR code to login to WhatsApp Web')
            
            # Wait for login to complete
            self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
            )
            
            print('Successfully logged in to WhatsApp Web')
            return True
            
        except Exception as e:
            print(f'Login failed: {e}')
            return False
    
    def get_group_messages(self, group_name, max_messages=100):
        """Get messages from a WhatsApp group"""
        try:
            # Search for the group
            search_box = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list-search"]'))
            )
            search_box.clear()
            search_box.send_keys(group_name)
            time.sleep(2)
            
            # Click on the group
            group_element = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f'//span[@title="{group_name}"]'))
            )
            group_element.click()
            time.sleep(3)
            
            # Scroll up to load more messages
            message_container = self.driver.find_element(
                By.CSS_SELECTOR, 
                '[data-testid="conversation-panel-messages"]'
            )
            
            messages = []
            scroll_count = 0
            max_scrolls = max_messages // 20 + 1
            
            while scroll_count < max_scrolls and len(messages) < max_messages:
                # Scroll up
                self.driver.execute_script(
                    'arguments[0].scrollTop = 0;', 
                    message_container
                )
                time.sleep(2)
                
                # Extract messages
                message_elements = self.driver.find_elements(
                    By.CSS_SELECTOR, 
                    '[data-testid="msg-container"]'
                )
                
                for element in message_elements:
                    try:
                        message_data = self.extract_message_data(element)
                        if message_data and message_data not in messages:
                            messages.append(message_data)
                    except Exception as e:
                        continue
                
                scroll_count += 1
            
            return messages[:max_messages]
            
        except Exception as e:
            print(f'Error getting group messages: {e}')
            return []
    
    def extract_message_data(self, element):
        """Extract data from a WhatsApp message element"""
        try:
            # Message text
            try:
                text_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '[data-testid="msg-text"]'
                )
                message_text = text_element.text
            except:
                message_text = ''
            
            # Sender name (for group messages)
            try:
                sender_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '[data-testid="msg-meta"] span'
                )
                sender_name = sender_element.text
            except:
                sender_name = ''
            
            # Timestamp
            try:
                time_element = element.find_element(
                    By.CSS_SELECTOR, 
                    '[data-testid="msg-meta"] span[dir="auto"]'
                )
                timestamp = time_element.get_attribute('title')
            except:
                timestamp = ''
            
            return {
                'text': message_text,
                'sender': sender_name,
                'timestamp': timestamp,
                'platform': 'whatsapp'
            }
            
        except Exception as e:
            return None
    
    def close(self):
        self.driver.quit()

# Note: WhatsApp scraping is highly discouraged and may result in account bans
```

---

## 📰 News Websites Scraping

### 🔧 Technical Approaches

#### 1. News APIs (Recommended)
**Cost**: $0-$449/month  
**Reliability**: Very High  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class NewsAPIScraper {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://newsapi.org/v2';
    }
    
    async searchNews(query, sources = null, language = 'en', pageSize = 100) {
        try {
            const params = {
                q: query,
                apiKey: this.apiKey,
                language: language,
                pageSize: pageSize,
                sortBy: 'publishedAt'
            };
            
            if (sources) {
                params.sources = sources.join(',');
            }
            
            const response = await axios.get(`${this.baseUrl}/everything`, { params });
            
            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                source: article.source.name,
                author: article.author,
                publishedAt: article.publishedAt,
                platform: 'news',
                political_relevance: this.assessPoliticalRelevance(article.title + ' ' + article.description)
            }));
            
        } catch (error) {
            console.error('NewsAPI Error:', error);
            throw error;
        }
    }
    
    async getNigerianPoliticalNews() {
        const nigerianSources = [
            'punch-nigeria',
            'premium-times-nigeria'
        ];
        
        const politicalQueries = [
            'Tinubu Nigeria',
            'Atiku Nigeria',
            'Peter Obi Nigeria',
            'Nigerian politics',
            'Nigerian election',
            'APC Nigeria',
            'PDP Nigeria',
            'Labour Party Nigeria'
        ];
        
        const allArticles = [];
        
        for (const query of politicalQueries) {
            try {
                const articles = await this.searchNews(query, nigerianSources, 'en', 50);
                allArticles.push(...articles);
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error searching for "${query}":`, error);
            }
        }
        
        // Remove duplicates
        const uniqueArticles = allArticles.filter((article, index, self) => 
            index === self.findIndex(a => a.url === article.url)
        );
        
        return uniqueArticles;
    }
    
    assessPoliticalRelevance(text) {
        const politicalKeywords = [
            'election', 'politics', 'government', 'democracy', 'vote',
            'tinubu', 'atiku', 'peter obi', 'kwankwaso', 'apc', 'pdp',
            'labour party', 'nnpp', 'inec', 'president', 'governor'
        ];
        
        const lowerText = text.toLowerCase();
        const matches = politicalKeywords.filter(keyword => 
            lowerText.includes(keyword)
        );
        
        return {
            score: matches.length / politicalKeywords.length,
            keywords: matches
        };
    }
}
```

#### 2. Web Scraping Nigerian News Sites
**Cost**: Free  
**Reliability**: Medium  
**Legal**: Check robots.txt  

```python
import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import urljoin, urlparse
from datetime import datetime

class NigerianNewsScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        self.news_sites = {
            'punch': {
                'base_url': 'https://punchng.com',
                'search_url': 'https://punchng.com/?s={}',
                'selectors': {
                    'articles': '.post-item',
                    'title': '.post-title a',
                    'link': '.post-title a',
                    'excerpt': '.post-excerpt',
                    'date': '.post-date'
                }
            },
            'vanguard': {
                'base_url': 'https://www.vanguardngr.com',
                'search_url': 'https://www.vanguardngr.com/?s={}',
                'selectors': {
                    'articles': '.post',
                    'title': '.entry-title a',
                    'link': '.entry-title a',
                    'excerpt': '.entry-summary',
                    'date': '.entry-date'
                }
            },
            'thisday': {
                'base_url': 'https://www.thisdaylive.com',
                'search_url': 'https://www.thisdaylive.com/index.php/search?q={}',
                'selectors': {
                    'articles': '.article-item',
                    'title': '.article-title a',
                    'link': '.article-title a',
                    'excerpt': '.article-excerpt',
                    'date': '.article-date'
                }
            }
        }
    
    def scrape_site(self, site_name, search_terms, max_articles=50):
        """Scrape a specific news site for political content"""
        if site_name not in self.news_sites:
            raise ValueError(f"Site {site_name} not supported")
        
        site_config = self.news_sites[site_name]
        all_articles = []
        
        for term in search_terms:
            try:
                search_url = site_config['search_url'].format(term.replace(' ', '+'))
                articles = self.scrape_search_results(site_config, search_url, max_articles // len(search_terms))
                all_articles.extend(articles)
                
                # Rate limiting
                time.sleep(2)
                
            except Exception as e:
                print(f"Error scraping {site_name} for '{term}': {e}")
                continue
        
        return all_articles
    
    def scrape_search_results(self, site_config, search_url, max_articles):
        """Scrape search results from a news site"""
        try:
            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            article_elements = soup.select(site_config['selectors']['articles'])[:max_articles]
            
            for element in article_elements:
                try:
                    article_data = self.extract_article_data(element, site_config)
                    if article_data:
                        articles.append(article_data)
                except Exception as e:
                    continue
            
            return articles
            
        except Exception as e:
            print(f"Error scraping search results: {e}")
            return []
    
    def extract_article_data(self, element, site_config):
        """Extract article data from HTML element"""
        try:
            # Title
            title_element = element.select_one(site_config['selectors']['title'])
            title = title_element.get_text(strip=True) if title_element else ''
            
            # Link
            link_element = element.select_one(site_config['selectors']['link'])
            link = link_element.get('href') if link_element else ''
            
            # Make link absolute
            if link and not link.startswith('http'):
                link = urljoin(site_config['base_url'], link)
            
            # Excerpt
            excerpt_element = element.select_one(site_config['selectors']['excerpt'])
            excerpt = excerpt_element.get_text(strip=True) if excerpt_element else ''
            
            # Date
            date_element = element.select_one(site_config['selectors']['date'])
            date = date_element.get_text(strip=True) if date_element else ''
            
            return {
                'title': title,
                'url': link,
                'excerpt': excerpt,
                'date': date,
                'source': urlparse(site_config['base_url']).netloc,
                'platform': 'news',
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return None
    
    def scrape_all_sites(self, search_terms, max_articles_per_site=50):
        """Scrape all configured news sites"""
        all_articles = []
        
        for site_name in self.news_sites.keys():
            print(f"Scraping {site_name}...")
            try:
                articles = self.scrape_site(site_name, search_terms, max_articles_per_site)
                all_articles.extend(articles)
                
                # Rate limiting between sites
                time.sleep(5)
                
            except Exception as e:
                print(f"Error scraping {site_name}: {e}")
                continue
        
        return all_articles

# Usage for Nigerian political news
def scrape_nigerian_political_news():
    scraper = NigerianNewsScraper()
    
    political_search_terms = [
        'Tinubu',
        'Atiku',
        'Peter Obi',
        'Kwankwaso',
        'Nigerian politics',
        'Nigerian election',
        'APC',
        'PDP',
        'Labour Party',
        'NNPP',
        'INEC'
    ]
    
    articles = scraper.scrape_all_sites(political_search_terms, max_articles_per_site=30)
    
    # Remove duplicates based on title similarity
    unique_articles = []
    seen_titles = set()
    
    for article in articles:
        title_words = set(article['title'].lower().split())
        is_duplicate = any(
            len(title_words.intersection(seen_title)) > len(title_words) * 0.7
            for seen_title in seen_titles
        )
        
        if not is_duplicate:
            unique_articles.append(article)
            seen_titles.add(title_words)
    
    return unique_articles
```

---

## ⚖️ Legal and Ethical Considerations

### 🚨 Legal Compliance Framework

#### 1. Nigerian Legal Landscape

**Nigeria Data Protection Regulation (NDPR) 2019**
- Requires consent for personal data processing
- Mandates data protection impact assessments
- Requires data localization for certain data types
- Penalties up to 10% of annual turnover

**Cybercrimes (Prohibition, Prevention, etc.) Act 2015**
- Criminalizes unauthorized access to computer systems
- Prohibits data interception without consent
- Penalties include fines and imprisonment

#### 2. Platform-Specific Legal Considerations

```javascript
const legalCompliance = {
    twitter: {
        terms_of_service: 'https://twitter.com/tos',
        api_terms: 'https://developer.twitter.com/en/developer-terms',
        compliance_requirements: [
            'Use official API when possible',
            'Respect rate limits',
            'Do not store data beyond permitted periods',
            'Obtain user consent for personal data'
        ],
        risk_level: 'LOW' // When using official API
    },
    
    facebook: {
        terms_of_service: 'https://www.facebook.com/terms.php',
        api_terms: 'https://developers.facebook.com/terms/',
        compliance_requirements: [
            'Use official API only',
            'Automated data collection prohibited',
            'Respect user privacy settings',
            'Data retention limits apply'
        ],
        risk_level: 'HIGH' // For web scraping
    },
    
    linkedin: {
        terms_of_service: 'https://www.linkedin.com/legal/user-agreement',
        compliance_requirements: [
            'Automated data collection prohibited',
            'API access very limited',
            'Professional use only',
            'No bulk data extraction'
        ],
        risk_level: 'VERY_HIGH'
    },
    
    reddit: {
        terms_of_service: 'https://www.redditinc.com/policies/user-agreement',
        api_terms: 'https://github.com/reddit-archive/reddit/wiki/API',
        compliance_requirements: [
            'Use official API',
            'Respect rate limits (60 requests/minute)',
            'No commercial use without permission',
            'Attribution required'
        ],
        risk_level: 'LOW'
    }
};
```

#### 3. Ethical Guidelines

```python
class EthicalScrapingGuidelines:
    """
    Ethical guidelines for social media data scraping
    """
    
    @staticmethod
    def privacy_protection():
        return {
            'anonymization': {
                'remove_personal_identifiers': True,
                'hash_user_ids': True,
                'aggregate_data_only': True,
                'minimum_group_size': 5  # k-anonymity
            },
            'consent': {
                'public_data_only': True,
                'respect_privacy_settings': True,
                'opt_out_mechanism': True,
                'clear_data_usage_policy': True
            },
            'data_minimization': {
                'collect_only_necessary_data': True,
                'time_limited_storage': True,
                'purpose_limitation': True,
                'regular_data_purging': True
            }
        }
    
    @staticmethod
    def technical_safeguards():
        return {
            'rate_limiting': {
                'respect_platform_limits': True,
                'implement_backoff_strategies': True,
                'distribute_requests': True,
                'monitor_api_usage': True
            },
            'data_security': {
                'encrypt_stored_data': True,
                'secure_transmission': True,
                'access_controls': True,
                'audit_logging': True
            },
            'transparency': {
                'clear_data_collection_notice': True,
                'purpose_specification': True,
                'contact_information': True,
                'data_retention_policy': True
            }
        }
    
    @staticmethod
    def research_ethics():
        return {
            'academic_standards': {
                'institutional_review_board': True,
                'research_ethics_approval': True,
                'participant_protection': True,
                'data_sharing_agreements': True
            },
            'bias_mitigation': {
                'representative_sampling': True,
                'algorithmic_fairness': True,
                'cultural_sensitivity': True,
                'inclusive_analysis': True
            },
            'harm_prevention': {
                'avoid_surveillance': True,
                'protect_vulnerable_groups': True,
                'prevent_discrimination': True,
                'consider_societal_impact': True
            }
        }
```

---

## 🛠️ Implementation Strategies

### 📋 Recommended Implementation Approach

#### Phase 1: Foundation (Weeks 1-2)
```javascript
const phase1Implementation = {
    priority_platforms: [
        'reddit',      // Easiest, most compliant
        'news_apis',   // Professional, reliable
        'twitter_api'  // If budget allows
    ],
    
    technical_setup: {
        data_pipeline: 'Node.js + Python hybrid',
        storage: 'MongoDB for flexibility',
        processing: 'Real-time + batch processing',
        monitoring: 'Comprehensive logging and alerts'
    },
    
    compliance_framework: {
        legal_review: 'Complete before implementation',
        privacy_policy: 'Draft and publish',
        data_governance: 'Establish procedures',
        security_measures: 'Implement from day one'
    }
};
```

#### Phase 2: Expansion (Weeks 3-4)
```javascript
const phase2Implementation = {
    additional_platforms: [
        'telegram',    // If relevant channels identified
        'youtube_api', // For video content analysis
        'web_scraping' // For specific high-value sources
    ],
    
    advanced_features: {
        sentiment_analysis: 'Integrate AI/ML processing',
        trend_detection: 'Implement pattern recognition',
        real_time_alerts: 'Set up notification system',
        data_visualization: 'Create dashboard interfaces'
    }
};
```

#### Phase 3: Optimization (Weeks 5-6)
```javascript
const phase3Implementation = {
    performance_optimization: {
        caching_strategy: 'Implement Redis caching',
        load_balancing: 'Distribute scraping load',
        error_handling: 'Robust retry mechanisms',
        cost_optimization: 'Monitor and optimize API usage'
    },
    
    quality_assurance: {
        data_validation: 'Implement quality checks',
        duplicate_detection: 'Advanced deduplication',
        bias_detection: 'Monitor for sampling bias',
        accuracy_metrics: 'Establish quality KPIs'
    }
};
```

### 🔧 Technical Architecture

```python
class ScrapingArchitecture:
    """
    Recommended technical architecture for social media scraping
    """
    
    def __init__(self):
        self.components = {
            'data_collection': {
                'api_clients': 'Official platform APIs',
                'web_scrapers': 'Selenium/Puppeteer for web scraping',
                'proxy_management': 'Rotating proxies for reliability',
                'rate_limiting': 'Intelligent request throttling'
            },
            
            'data_processing': {
                'cleaning': 'Text normalization and filtering',
                'enrichment': 'Sentiment analysis and categorization',
                'deduplication': 'Content similarity detection',
                'validation': 'Quality assurance checks'
            },
            
            'data_storage': {
                'raw_data': 'MongoDB for flexible schema',
                'processed_data': 'PostgreSQL for structured queries',
                'cache': 'Redis for fast access',
                'files': 'S3-compatible storage for media'
            },
            
            'monitoring': {
                'logging': 'Structured logging with ELK stack',
                'metrics': 'Prometheus + Grafana',
                'alerts': 'PagerDuty for critical issues',
                'health_checks': 'Automated system monitoring'
            }
        }
    
    def get_recommended_stack(self):
        return {
            'backend': 'Node.js + Python',
            'databases': 'MongoDB + PostgreSQL + Redis',
            'message_queue': 'RabbitMQ or Apache Kafka',
            'containerization': 'Docker + Kubernetes',
            'cloud_platform': 'AWS, GCP, or Azure',
            'monitoring': 'Prometheus + Grafana + ELK'
        }
```

---

## 📊 Cost-Benefit Analysis

### 💰 Implementation Costs

```javascript
const implementationCosts = {
    development: {
        initial_setup: '$15,000 - $25,000',
        ongoing_maintenance: '$3,000 - $5,000/month',
        compliance_consulting: '$5,000 - $10,000'
    },
    
    operational: {
        api_costs: '$500 - $2,000/month',
        infrastructure: '$200 - $800/month',
        proxy_services: '$100 - $500/month',
        monitoring_tools: '$100 - $300/month'
    },
    
    legal_compliance: {
        legal_review: '$2,000 - $5,000',
        privacy_compliance: '$1,000 - $3,000',
        ongoing_compliance: '$500 - $1,000/month'
    }
};
```

### 📈 Expected Benefits

```javascript
const expectedBenefits = {
    data_insights: {
        political_sentiment_tracking: 'Real-time public opinion monitoring',
        trend_identification: 'Early detection of political movements',
        influence_mapping: 'Understanding of key opinion leaders',
        crisis_detection: 'Early warning for political tensions'
    },
    
    competitive_advantages: {
        comprehensive_coverage: 'Multi-platform data aggregation',
        real_time_analysis: 'Immediate insights and alerts',
        historical_tracking: 'Long-term trend analysis',
        customizable_metrics: 'Tailored KPIs and dashboards'
    },
    
    business_value: {
        informed_decision_making: 'Data-driven political analysis',
        risk_mitigation: 'Early identification of potential issues',
        stakeholder_reporting: 'Comprehensive political landscape reports',
        strategic_planning: 'Evidence-based strategy development'
    }
};
```

---

## 🎯 Best Practices Summary

### ✅ Do's

1. **Use Official APIs First**: Always prefer official APIs over web scraping
2. **Respect Rate Limits**: Implement proper throttling and backoff strategies
3. **Ensure Legal Compliance**: Review terms of service and local regulations
4. **Protect Privacy**: Anonymize data and respect user privacy settings
5. **Monitor Quality**: Implement data validation and quality checks
6. **Plan for Scale**: Design architecture to handle growing data volumes
7. **Document Everything**: Maintain clear documentation for compliance
8. **Regular Audits**: Conduct periodic reviews of data collection practices

### ❌ Don'ts

1. **Don't Ignore ToS**: Never violate platform terms of service
2. **Don't Overwhelm Servers**: Avoid aggressive scraping that impacts performance
3. **Don't Store Sensitive Data**: Minimize collection of personal information
4. **Don't Ignore Errors**: Implement proper error handling and logging
5. **Don't Skip Testing**: Thoroughly test all scraping implementations
6. **Don't Forget Maintenance**: Plan for ongoing updates and maintenance
7. **Don't Ignore Security**: Implement proper security measures from the start
8. **Don't Rush Implementation**: Take time to plan and implement properly

---

## 📞 Support and Resources

### 🔗 Useful Links

- **Twitter API Documentation**: https://developer.twitter.com/en/docs
- **Reddit API Documentation**: https://www.reddit.com/dev/api/
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api/
- **YouTube Data API**: https://developers.google.com/youtube/v3
- **NewsAPI Documentation**: https://newsapi.org/docs
- **Telegram Bot API**: https://core.telegram.org/bots/api

### 📚 Legal Resources

- **Nigeria Data Protection Regulation**: https://ndpr.gov.ng/
- **Cybercrimes Act 2015**: https://www.cert.gov.ng/ngcert/resources/CyberCrime__Prohibition_Prevention_etc__Act__2015.pdf
- **Platform Terms of Service**: Review each platform's current terms

### 🛠️ Technical Tools

- **Selenium**: https://selenium-python.readthedocs.io/
- **Puppeteer**: https://pptr.dev/
- **Beautiful Soup**: https://www.crummy.com/software/BeautifulSoup/
- **Scrapy**: https://scrapy.org/
- **Apify**: https://apify.com/
- **Bright Data**: https://brightdata.com/

---

*This document provides comprehensive guidance for social media data scraping with a focus on Nigerian political content. Always ensure compliance with local laws and platform terms of service before implementing any scraping solution.*
```

#### 2. Web Scraping (Free but Risky)
**Cost**: Free  
**Reliability**: Low-Medium  
**Legal**: Gray Area  

##### Option A: Puppeteer + Stealth
```javascript
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

class TwitterScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set realistic viewport and user agent
    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }

  async searchTweets(query, scrollCount = 5) {
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    
    await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    // Wait for tweets to load
    await this.page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    const tweets = [];
    
    for (let i = 0; i < scrollCount; i++) {
      // Extract tweets from current view
      const currentTweets = await this.page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        return Array.from(tweetElements).map(tweet => {
          const textElement = tweet.querySelector('[data-testid="tweetText"]');
          const authorElement = tweet.querySelector('[data-testid="User-Name"]');
          const timeElement = tweet.querySelector('time');
          
          return {
            text: textElement ? textElement.innerText : '',
            author: authorElement ? authorElement.innerText : '',
            timestamp: timeElement ? timeElement.getAttribute('datetime') : '',
            url: tweet.querySelector('a[href*="/status/"]')?.href || ''
          };
        });
      });
      
      tweets.push(...currentTweets);
      
      // Scroll to load more tweets
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait for new content to load
      await this.page.waitForTimeout(2000);
    }
    
    return tweets;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

##### Option B: Selenium + Undetected Chrome
```python
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

class TwitterSeleniumScraper:
    def __init__(self):
        options = uc.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = uc.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def search_tweets(self, query, max_scrolls=10):
        search_url = f"https://twitter.com/search?q={query}&src=typed_query&f=live"
        self.driver.get(search_url)
        
        # Wait for tweets to load
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="tweet"]')))
        
        tweets = []
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        
        for scroll in range(max_scrolls):
            # Extract tweets
            tweet_elements = self.driver.find_elements(By.CSS_SELECTOR, '[data-testid="tweet"]')
            
            for tweet in tweet_elements:
                try:
                    text_element = tweet.find_element(By.CSS_SELECTOR, '[data-testid="tweetText"]')
                    author_element = tweet.find_element(By.CSS_SELECTOR, '[data-testid="User-Name"]')
                    time_element = tweet.find_element(By.TAG_NAME, 'time')
                    
                    tweet_data = {
                        'text': text_element.text,
                        'author': author_element.text,
                        'timestamp': time_element.get_attribute('datetime'),
                        'engagement': self.extract_engagement(tweet)
                    }
                    
                    tweets.append(tweet_data)
                except Exception as e:
                    continue
            
            # Scroll down
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            
            # Check if new content loaded
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        return tweets
    
    def extract_engagement(self, tweet_element):
        try:
            metrics = tweet_element.find_elements(By.CSS_SELECTOR, '[role="group"] [data-testid]')
            engagement = {
                'replies': 0,
                'retweets': 0,
                'likes': 0
            }
            
            for metric in metrics:
                test_id = metric.get_attribute('data-testid')
                if 'reply' in test_id:
                    engagement['replies'] = self.parse_count(metric.text)
                elif 'retweet' in test_id:
                    engagement['retweets'] = self.parse_count(metric.text)
                elif 'like' in test_id:
                    engagement['likes'] = self.parse_count(metric.text)
            
            return engagement
        except:
            return {'replies': 0, 'retweets': 0, 'likes': 0}
    
    def parse_count(self, count_text):
        if 'K' in count_text:
            return int(float(count_text.replace('K', '')) * 1000)
        elif 'M' in count_text:
            return int(float(count_text.replace('M', '')) * 1000000)
        else:
            return int(count_text) if count_text.isdigit() else 0
    
    def close(self):
        self.driver.quit()
```

#### 3. Third-Party Scraping Services

##### Apify Twitter Scraper
**Cost**: $49-$499/month  
**Reliability**: High  
**Legal**: Service handles compliance  

```javascript
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapeTwitterWithApify(searchTerms, maxTweets = 1000) {
    const input = {
        searchTerms: searchTerms,
        maxTweets: maxTweets,
        addUserInfo: true,
        scrapeTweetReplies: false,
        includeSearchTerms: false,
        customMapFunction: (object) => {
            return {
                ...object,
                sentiment_analyzed: false,
                politician_mentioned: extractPoliticianMentions(object.text)
            };
        }
    };

    const run = await client.actor('61RPP7dywgiy0JPD0').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    return items;
}

function extractPoliticianMentions(text) {
    const nigerianPoliticians = [
        'Tinubu', 'Atiku', 'Obi', 'Kwankwaso', 'Sanwo-Olu',
        'El-Rufai', 'Wike', 'Fayemi', 'Makinde', 'Soludo'
    ];
    
    return nigerianPoliticians.filter(politician => 
        text.toLowerCase().includes(politician.toLowerCase())
    );
}
```

##### Bright Data (formerly Luminati)
**Cost**: $500-$2000/month  
**Reliability**: Very High  
**Legal**: Enterprise compliance  

```python
import requests
import json

class BrightDataTwitterScraper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.brightdata.com/datasets/v1/trigger"
    
    def trigger_collection(self, search_queries, max_results=10000):
        payload = {
            "dataset_id": "gd_l7q7dkf244hwjntr0",  # Twitter dataset ID
            "format": "json",
            "snapshot_id": "latest",
            "filters": {
                "search_terms": search_queries,
                "max_results": max_results,
                "language": "en",
                "location": "Nigeria"
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(self.base_url, 
                               data=json.dumps(payload), 
                               headers=headers)
        
        return response.json()
    
    def get_collection_status(self, snapshot_id):
        url = f"https://api.brightdata.com/datasets/v1/snapshot/{snapshot_id}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        response = requests.get(url, headers=headers)
        return response.json()
    
    def download_results(self, snapshot_id):
        url = f"https://api.brightdata.com/datasets/v1/snapshot/{snapshot_id}/download"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        response = requests.get(url, headers=headers)
        return response.json()
```

---

## 📘 Facebook Scraping

### 🔧 Technical Approaches

#### 1. Official Graph API (Limited)
**Cost**: Free with restrictions  
**Reliability**: High for available data  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class FacebookGraphAPI {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://graph.facebook.com/v18.0';
    }
    
    async getPagePosts(pageId, limit = 25) {
        try {
            const response = await axios.get(`${this.baseUrl}/${pageId}/posts`, {
                params: {
                    access_token: this.accessToken,
                    limit: limit,
                    fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Facebook API Error:', error.response?.data || error.message);
            throw error;
        }
    }
    
    async getPageInfo(pageId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${pageId}`, {
                params: {
                    access_token: this.accessToken,
                    fields: 'id,name,about,category,fan_count,talking_about_count'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Facebook API Error:', error.response?.data || error.message);
            throw error;
        }
    }
    
    // Get public posts mentioning keywords (very limited)
    async searchPublicPosts(query) {
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    access_token: this.accessToken,
                    q: query,
                    type: 'post',
                    limit: 100
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Facebook Search Error:', error.response?.data || error.message);
            return { data: [] };
        }
    }
}

// Usage for Nigerian political pages
const politicalPages = [
    'MBuhari',           // Muhammadu Buhari
    'atiku',             // Atiku Abubakar
    'PeterObi',          // Peter Obi
    'GovSanwoOlu',       // Babajide Sanwo-Olu
    'NasirElRufai'       // Nasir El-Rufai
];

async function scrapePoliticalPages() {
    const fb = new FacebookGraphAPI(process.env.FACEBOOK_ACCESS_TOKEN);
    const results = [];
    
    for (const pageId of politicalPages) {
        try {
            const posts = await fb.getPagePosts(pageId, 50);
            const pageInfo = await fb.getPageInfo(pageId);
            
            results.push({
                page: pageInfo,
                posts: posts.data
            });
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error scraping page ${pageId}:`, error.message);
        }
    }
    
    return results;
}
```

#### 2. Web Scraping (Very Difficult)
**Cost**: Free  
**Reliability**: Very Low  
**Legal**: Violates ToS  

```javascript
// Facebook scraping is extremely difficult due to:
// 1. Heavy anti-bot measures
// 2. Dynamic content loading
// 3. Login requirements
// 4. Frequent layout changes
// 5. Legal restrictions

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');

puppeteer.use(StealthPlugin());

class FacebookScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
    }
    
    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false, // Facebook detects headless browsers
            executablePath: executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Set realistic viewport and user agent
        await this.page.setViewport({ width: 1366, height: 768 });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Block images and videos to speed up loading
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            if(req.resourceType() == 'stylesheet' || req.resourceType() == 'image' || req.resourceType() == 'media'){
                req.abort();
            } else {
                req.continue();
            }
        });
    }
    
    async login(email, password) {
        try {
            await this.page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });
            
            await this.page.type('#email', email);
            await this.page.type('#pass', password);
            
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
                this.page.click('#loginbutton')
            ]);
            
            // Check if login was successful
            const currentUrl = this.page.url();
            if (currentUrl.includes('facebook.com') && !currentUrl.includes('login')) {
                this.isLoggedIn = true;
                console.log('Successfully logged in to Facebook');
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Facebook login error:', error);
            throw error;
        }
    }
    
    async scrapePublicPage(pageUrl, maxPosts = 20) {
        if (!this.isLoggedIn) {
            throw new Error('Must be logged in to scrape Facebook');
        }
        
        await this.page.goto(pageUrl, { waitUntil: 'networkidle2' });
        
        const posts = [];
        let scrollCount = 0;
        const maxScrolls = Math.ceil(maxPosts / 5); // Approximate posts per scroll
        
        while (scrollCount < maxScrolls && posts.length < maxPosts) {
            // Extract posts from current view
            const currentPosts = await this.page.evaluate(() => {
                const postElements = document.querySelectorAll('[data-pagelet="FeedUnit_0"], [data-pagelet="FeedUnit_1"], [data-pagelet="FeedUnit_2"]');
                
                return Array.from(postElements).map(post => {
                    const textElement = post.querySelector('[data-ad-preview="message"]');
                    const timeElement = post.querySelector('a[role="link"] abbr');
                    const authorElement = post.querySelector('h3 a');
                    
                    return {
                        text: textElement ? textElement.innerText : '',
                        author: authorElement ? authorElement.innerText : '',
                        timestamp: timeElement ? timeElement.getAttribute('title') : '',
                        url: post.querySelector('a[href*="/posts/"]')?.href || ''
                    };
                }).filter(post => post.text.length > 0);
            });
            
            posts.push(...currentPosts);
            
            // Scroll to load more posts
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            
            await this.page.waitForTimeout(3000);
            scrollCount++;
        }
        
        return posts.slice(0, maxPosts);
    }
    
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// WARNING: This approach is:
// 1. Against Facebook's Terms of Service
// 2. Likely to be detected and blocked
// 3. Requires valid Facebook credentials
// 4. May result in account suspension
// 5. Unreliable due to frequent UI changes
```

#### 3. Third-Party Services

##### Apify Facebook Scraper
**Cost**: $49-$499/month  
**Reliability**: Medium  
**Legal**: Gray area  

```javascript
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapeFacebookWithApify(pageUrls, maxPosts = 100) {
    const input = {
        startUrls: pageUrls.map(url => ({ url })),
        maxPosts: maxPosts,
        scrapeAbout: true,
        scrapeReviews: false,
        scrapeServices: false,
        language: 'en'
    };

    try {
        const run = await client.actor('apify/facebook-pages-scraper').call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        return items;
    } catch (error) {
        console.error('Apify Facebook scraping error:', error);
        throw error;
    }
}

// Usage
const nigerianPoliticalPages = [
    'https://www.facebook.com/MBuhari',
    'https://www.facebook.com/atiku',
    'https://www.facebook.com/PeterObi',
    'https://www.facebook.com/GovSanwoOlu'
];

scrapeFacebookWithApify(nigerianPoliticalPages, 50)
    .then(results => console.log('Facebook data:', results))
    .catch(error => console.error('Error:', error));
```

---

## 📸 Instagram Scraping

### 🔧 Technical Approaches

#### 1. Instagram Basic Display API (Very Limited)
**Cost**: Free  
**Reliability**: High for available data  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class InstagramBasicAPI {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://graph.instagram.com';
    }
    
    // Only works for user's own content or business accounts
    async getUserMedia(userId = 'me', limit = 25) {
        try {
            const response = await axios.get(`${this.baseUrl}/${userId}/media`, {
                params: {
                    access_token: this.accessToken,
                    limit: limit,
                    fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Instagram API Error:', error.response?.data || error.message);
            throw error;
        }
    }
    
    async getMediaComments(mediaId, limit = 50) {
        try {
            const response = await axios.get(`${this.baseUrl}/${mediaId}/comments`, {
                params: {
                    access_token: this.accessToken,
                    limit: limit,
                    fields: 'id,text,timestamp,username,like_count'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Instagram Comments API Error:', error.response?.data || error.message);
            throw error;
        }
    }
}
```

#### 2. Web Scraping
**Cost**: Free  
**Reliability**: Low-Medium  
**Legal**: Violates ToS  

```python
import requests
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc

class InstagramScraper:
    def __init__(self):
        options = uc.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = uc.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.session = requests.Session()
        
    def login(self, username, password):
        """Login to Instagram (required for most scraping)"""
        self.driver.get('https://www.instagram.com/accounts/login/')
        
        # Wait for login form
        username_input = self.wait.until(
            EC.presence_of_element_located((By.NAME, 'username'))
        )
        password_input = self.driver.find_element(By.NAME, 'password')
        
        username_input.send_keys(username)
        password_input.send_keys(password)
        
        # Click login button
        login_button = self.driver.find_element(By.XPATH, '//button[@type="submit"]')
        login_button.click()
        
        # Wait for login to complete
        time.sleep(5)
        
        # Handle "Save Your Login Info" popup
        try:
            not_now_button = self.driver.find_element(By.XPATH, '//button[contains(text(), "Not Now")]')
            not_now_button.click()
        except:
            pass
        
        # Handle "Turn on Notifications" popup
        try:
            not_now_button = self.driver.find_element(By.XPATH, '//button[contains(text(), "Not Now")]')
            not_now_button.click()
        except:
            pass
    
    def scrape_profile_posts(self, username, max_posts=50):
        """Scrape posts from a public Instagram profile"""
        profile_url = f'https://www.instagram.com/{username}/'
        self.driver.get(profile_url)
        
        # Wait for posts to load
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'article')))
        
        posts = []
        post_links = set()
        
        # Scroll and collect post links
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        
        while len(post_links) < max_posts:
            # Find all post links
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, 'article a[href*="/p/"]')
            
            for element in post_elements:
                href = element.get_attribute('href')
                if href:
                    post_links.add(href)
            
            # Scroll down
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Check if we've reached the bottom
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        # Scrape individual posts
        for i, post_url in enumerate(list(post_links)[:max_posts]):
            try:
                post_data = self.scrape_single_post(post_url)
                posts.append(post_data)
                
                # Rate limiting
                time.sleep(2)
                
                if i % 10 == 0:
                    print(f"Scraped {i+1}/{min(max_posts, len(post_links))} posts")
                    
            except Exception as e:
                print(f"Error scraping post {post_url}: {e}")
                continue
        
        return posts
    
    def scrape_single_post(self, post_url):
        """Scrape data from a single Instagram post"""
        self.driver.get(post_url)
        
        # Wait for post to load
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'article')))
        
        post_data = {
            'url': post_url,
            'caption': '',
            'likes': 0,
            'comments': [],
            'timestamp': '',
            'hashtags': [],
            'mentions': []
        }
        
        try:
            # Extract caption
            caption_element = self.driver.find_element(
                By.CSS_SELECTOR, 
                'article div[data-testid="post-caption"] span, article h1'
            )
            post_data['caption'] = caption_element.text
            
            # Extract hashtags and mentions
            post_data['hashtags'] = self.extract_hashtags(post_data['caption'])
            post_data['mentions'] = self.extract_mentions(post_data['caption'])
            
        except:
            pass
        
        try:
            # Extract likes count
            likes_element = self.driver.find_element(
                By.CSS_SELECTOR, 
                'section span[class*="_ac2a"] span'
            )
            likes_text = likes_element.text
            post_data['likes'] = self.parse_count(likes_text)
            
        except:
            pass
        
        try:
            # Extract timestamp
            time_element = self.driver.find_element(By.CSS_SELECTOR, 'time')
            post_data['timestamp'] = time_element.get_attribute('datetime')
            
        except:
            pass
        
        # Extract comments (limited to visible ones)
        try:
            comment_elements = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'div[data-testid="comment"] span'
            )
            
            for comment_element in comment_elements[:20]:  # Limit to first 20 comments
                comment_text = comment_element.text
                if comment_text:
                    post_data['comments'].append({
                        'text': comment_text,
                        'hashtags': self.extract_hashtags(comment_text),
                        'mentions': self.extract_mentions(comment_text)
                    })
        except:
            pass
        
        return post_data
    
    def extract_hashtags(self, text):
        """Extract hashtags from text"""
        import re
        return re.findall(r'#\w+', text)
    
    def extract_mentions(self, text):
        """Extract mentions from text"""
        import re
        return re.findall(r'@\w+', text)
    
    def parse_count(self, count_text):
        """Parse count strings like '1.2K' to numbers"""
        if 'K' in count_text:
            return int(float(count_text.replace('K', '').replace(',', '')) * 1000)
        elif 'M' in count_text:
            return int(float(count_text.replace('M', '').replace(',', '')) * 1000000)
        else:
            return int(count_text.replace(',', '')) if count_text.replace(',', '').isdigit() else 0
    
    def search_hashtag(self, hashtag, max_posts=30):
        """Search posts by hashtag"""
        search_url = f'https://www.instagram.com/explore/tags/{hashtag.replace("#", "")}/'
        self.driver.get(search_url)
        
        # Wait for posts to load
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'article')))
        
        posts = []
        post_links = set()
        
        # Scroll and collect post links
        scroll_count = 0
        max_scrolls = max_posts // 12 + 1  # Approximate posts per scroll
        
        while scroll_count < max_scrolls and len(post_links) < max_posts:
            # Find all post links
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, 'article a[href*="/p/"]')
            
            for element in post_elements:
                href = element.get_attribute('href')
                if href:
                    post_links.add(href)
            
            # Scroll down
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            scroll_count += 1
        
        # Scrape individual posts
        for post_url in list(post_links)[:max_posts]:
            try:
                post_data = self.scrape_single_post(post_url)
                posts.append(post_data)
                time.sleep(2)  # Rate limiting
            except Exception as e:
                print(f"Error scraping post {post_url}: {e}")
                continue
        
        return posts
    
    def close(self):
        self.driver.quit()

# Usage example for Nigerian political content
def scrape_nigerian_political_instagram():
    scraper = InstagramScraper()
    
    try:
        # Login (required)
        scraper.login('your_username', 'your_password')
        
        # Nigerian political figures and hashtags
        political_accounts = [
            'muhammadubuhari',
            'atiku',
            'peterobi',
            'jidesanwoolu',
            'elrufai'
        ]
        
        political_hashtags = [
            'NigerianPolitics',
            'Nigeria2023',
            'EndSARS',
            'NigeriaDecides',
            'VoteWisely'
        ]
        
        all_posts = []
        
        # Scrape political accounts
        for account in political_accounts:
            print(f"Scraping {account}...")
            posts = scraper.scrape_profile_posts(account, max_posts=20)
            all_posts.extend(posts)
            time.sleep(5)  # Rate limiting between accounts
        
        # Scrape political hashtags
        for hashtag in political_hashtags:
            print(f"Scraping #{hashtag}...")
            posts = scraper.search_hashtag(hashtag, max_posts=15)
            all_posts.extend(posts)
            time.sleep(5)  # Rate limiting between hashtags
        
        return all_posts
        
    finally:
        scraper.close()
```

#### 3. Third-Party Services

##### Apify Instagram Scraper
**Cost**: $49-$499/month  
**Reliability**: Medium-High  
**Legal**: Gray area  

```javascript
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapeInstagramWithApify(profiles, hashtags, maxPosts = 100) {
    const input = {
        directUrls: profiles.map(profile => `https://www.instagram.com/${profile}/`),
        hashtags: hashtags,
        resultsLimit: maxPosts,
        addParentData: false,
        enhanceUserSearchWithFacebookPage: false,
        isUserTaggedFeedURL: false,
        onlyPostsNewerThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        scrapePostsUntilDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // Last year
    };

    try {
        const run = await client.actor('apify/instagram-scraper').call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        return items.map(item => ({
            ...item,
            platform: 'instagram',
            scraped_at: new Date().toISOString(),
            political_relevance: assessPoliticalRelevance(item.caption || '')
        }));
    } catch (error) {
        console.error('Apify Instagram scraping error:', error);
        throw error;
    }
}

function assessPoliticalRelevance(text) {
    const politicalKeywords = [
        'politics', 'election', 'vote', 'government', 'democracy',
        'tinubu', 'atiku', 'obi', 'kwankwaso', 'buhari',
        'apc', 'pdp', 'lp', 'nnpp', 'nigeria', 'lagos', 'abuja'
    ];
    
    const lowerText = text.toLowerCase();
    const matches = politicalKeywords.filter(keyword => 
        lowerText.includes(keyword)
    );
    
    return {
        is_political: matches.length > 0,
        keywords_found: matches,
        relevance_score: matches.length / politicalKeywords.length
    };
}

// Usage
const nigerianPoliticalProfiles = [
    'muhammadubuhari',
    'atiku',
    'peterobi',
    'jidesanwoolu',
    'elrufai'
];

const politicalHashtags = [
    'NigerianPolitics',
    'Nigeria2023',
    'EndSARS',
    'NigeriaDecides'
];

scrapeInstagramWithApify(nigerianPoliticalProfiles, politicalHashtags, 200)
    .then(results => {
        console.log(`Scraped ${results.length} Instagram posts`);
        const politicalPosts = results.filter(post => post.political_relevance.is_political);
        console.log(`Found ${politicalPosts.length} politically relevant posts`);
    })
    .catch(error => console.error('Error:', error));
```

---

## 🎥 YouTube Scraping

### 🔧 Technical Approaches

#### 1. YouTube Data API v3 (Recommended)
**Cost**: Free (10,000 units/day)  
**Reliability**: Very High  
**Legal**: Fully Compliant  

```javascript
const { google } = require('googleapis');

class YouTubeDataAPI {
    constructor(apiKey) {
        this.youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        });
    }
    
    async searchVideos(query, maxResults = 50, publishedAfter = null) {
        try {
            const searchParams = {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: maxResults,
                order: 'relevance',
                regionCode: 'NG', // Nigeria
                relevanceLanguage: 'en'
            };
            
            if (publishedAfter) {
                searchParams.publishedAfter = publishedAfter;
            }
            
            const response = await this.youtube.search.list(searchParams);
            
            // Get additional video details
            const videoIds = response.data.items.map(item => item.id.videoId);
            const videoDetails = await this.getVideoDetails(videoIds);
            
            return response.data.items.map((item, index) => ({
                ...item,
                statistics: videoDetails[index]?.statistics || {},
                contentDetails: videoDetails[index]?.contentDetails || {}
            }));
            
        } catch (error) {
            console.error('YouTube search error:', error);
            throw error;
        }
    }
    
    async getVideoDetails(videoIds) {
        try {
            const response = await this.youtube.videos.list({
                part: 'statistics,contentDetails',
                id: videoIds.join(',')
            });
            
            return response.data.items;
        } catch (error) {
            console.error('YouTube video details error:', error);
            return [];
        }
    }
    
    async getVideoComments(videoId, maxResults = 100) {
        try {
            const response = await this.youtube.commentThreads.list({
                part: 'snippet,replies',
                videoId: videoId,
                maxResults: maxResults,
                order: 'relevance',
                textFormat: 'plainText'
            });
            
            const comments = [];
            
            response.data.items.forEach(item => {
                const topComment = item.snippet.topLevelComment.snippet;
                comments.push({
                    id: item.snippet.topLevelComment.id,
                    text: topComment.textDisplay,
                    author: topComment.authorDisplayName,
                    authorChannelId: topComment.authorChannelId?.value || null,
                    likeCount: topComment.likeCount,
                    publishedAt: topComment.publishedAt,
                    updatedAt: topComment.updatedAt
                });
                
                // Add replies if they exist
                if (item.replies) {
                    item.replies.comments.forEach(reply => {
                        const replySnippet = reply.snippet;
                        comments.push({
                            id: reply.id,
                            text: replySnippet.textDisplay,
                            author: replySnippet.authorDisplayName,
                            authorChannelId: replySnippet.authorChannelId?.value || null,
                            likeCount: replySnippet.likeCount,
                            publishedAt: replySnippet.publishedAt,
                            updatedAt: replySnippet.updatedAt,
                            parentId: item.snippet.topLevelComment.id
                        });
                    });
                }
            });
            
            return comments;
            
        } catch (error) {
            console.error('YouTube comments error:', error);
            return [];
        }
    }
    
    async getChannelVideos(channelId, maxResults = 50) {
        try {
            // First get the uploads playlist ID
            const channelResponse = await this.youtube.channels.list({
                part: 'contentDetails',
                id: channelId
            });
            
            const uploadsPlaylistId = channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
            
            if (!uploadsPlaylistId) {
                throw new Error('Could not find uploads playlist for channel');
            }
            
            // Get videos from uploads playlist
            const playlistResponse = await this.youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                playlistId: uploadsPlaylistId,
                maxResults: maxResults
            });
            
            return playlistResponse.data.items;
            
        } catch (error) {
            console.error('YouTube channel videos error:', error);
            throw error;
        }
    }
    
    async searchChannels(query, maxResults = 25) {
        try {
            const response = await this.youtube.search.list({
                part: 'snippet',
                q: query,
                type: 'channel',
                maxResults: maxResults,
                regionCode: 'NG'
            });
            
            return response.data.items;
            
        } catch (error) {
            console.error('YouTube channel search error:', error);
            throw error;
        }
    }
}

// Usage for Nigerian political content
async function scrapeNigerianPoliticalYouTube() {
    const youtube = new YouTubeDataAPI(process.env.YOUTUBE_API_KEY);
    
    const politicalQueries = [
        'Tinubu Nigeria politics',
        'Atiku Abubakar campaign',
        'Peter Obi Labour Party',
        'Kwankwaso NNPP',
        'Nigeria election 2023',
        'Lagos state government',
        'Nigerian democracy',
        'EndSARS Nigeria'
    ];
    
    const politicalChannels = [
        'UCKy3vK-eLxoYX8DdxKZqk8g', // Channels Television
        'UC1dBHeMdQdOOOw_tNdXzTBg', // TVC News Nigeria
        'UCOmOKlB4-Gd8LjkGBjmhQsg', // Arise News
        'UCNkCFRGEd_9_KLhzrp6rGdw'  // Politics Nigeria
    ];
    
    const allData = {
        videos: [],
        comments: [],
        channels: []
    };
    
    try {
        // Search for political videos
        for (const query of politicalQueries) {
            console.log(`Searching for: ${query}`);
            
            const videos = await youtube.searchVideos(
                query, 
                25, 
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
            );
            
            allData.videos.push(...videos);
            
            // Get comments for each video
            for (const video of videos.slice(0, 5)) { // Limit to first 5 videos per query
                try {
                    const comments = await youtube.getVideoComments(video.id.videoId, 50);
                    allData.comments.push(...comments.map(comment => ({
                        ...comment,
                        videoId: video.id.videoId,
                        videoTitle: video.snippet.title
                    })));
                    
                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Error getting comments for video ${video.id.videoId}:`, error.message);
                }
            }
            
            // Rate limiting between queries
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Get videos from political channels
        for (const channelId of politicalChannels) {
            try {
                console.log(`Getting videos from channel: ${channelId}`);
                
                const channelVideos = await youtube.getChannelVideos(channelId, 20);
                allData.videos.push(...channelVideos);
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error getting videos from channel ${channelId}:`, error.message);
            }
        }
        
        return allData;
        
    } catch (error) {
        console.error('YouTube scraping error:', error);
        throw error;
    }
}

// Advanced filtering and analysis
function analyzeYouTubeData(data) {
    const analysis = {
        totalVideos: data.videos.length,
        totalComments: data.comments.length,
        politicalKeywords: {},
        sentimentDistribution: {
            positive: 0,
            negative: 0,
            neutral: 0
        },
        topChannels: {},
        engagementMetrics: {
            averageViews: 0,
            averageLikes: 0,
            averageComments: 0
        }
    };
    
    const politicalKeywords = [
        'tinubu', 'atiku', 'obi', 'kwankwaso', 'buhari',
        'apc', 'pdp', 'lp', 'nnpp', 'election', 'democracy',
        'corruption', 'economy', 'security', 'education'
    ];
    
    // Analyze videos
    data.videos.forEach(video => {
        const title = video.snippet.title.toLowerCase();
        const description = video.snippet.description.toLowerCase();
        const text = `${title} ${description}`;
        
        // Count keyword mentions
        politicalKeywords.forEach(keyword => {
            const count = (text.match(new RegExp(keyword, 'g')) || []).length;
            analysis.politicalKeywords[keyword] = (analysis.politicalKeywords[keyword] || 0) + count;
        });
        
        // Track channels
        const channelTitle = video.snippet.channelTitle;
        analysis.topChannels[channelTitle] = (analysis.topChannels[channelTitle] || 0) + 1;
        
        // Calculate engagement metrics
        if (video.statistics) {
            analysis.engagementMetrics.averageViews += parseInt(video.statistics.viewCount || 0);
            analysis.engagementMetrics.averageLikes += parseInt(video.statistics.likeCount || 0);
            analysis.engagementMetrics.averageComments += parseInt(video.statistics.commentCount || 0);
        }
    });
    
    // Calculate averages
    if (data.videos.length > 0) {
        analysis.engagementMetrics.averageViews /= data.videos.length;
        analysis.engagementMetrics.averageLikes /= data.videos.length;
        analysis.engagementMetrics.averageComments /= data.videos.length;
    }
    
    // Analyze comments for sentiment (basic keyword-based)
    data.comments.forEach(comment => {
        const text = comment.text.toLowerCase();
        
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'support', 'best'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'corrupt', 'useless'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) {
            analysis.sentimentDistribution.positive++;
        } else if (negativeCount > positiveCount) {
            analysis.sentimentDistribution.negative++;
        } else {
            analysis.sentimentDistribution.neutral++;
        }
    });
    
    return analysis;
}

// Export functions
module.exports = {
    YouTubeDataAPI,
    scrapeNigerianPoliticalYouTube,
    analyzeYouTubeData
};
```

#### 2. Web Scraping (Alternative)
**Cost**: Free  
**Reliability**: Medium  
**Legal**: Gray area  

```python
import requests
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc
import time

class YouTubeScraper:
    def __init__(self):
        options = uc.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = uc.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def search_videos(self, query, max_results=50):
        """Search for videos on YouTube"""
        search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
        self.driver.get(search_url)
        
        # Wait for videos to load
        self.wait.until(EC.presence_of_element_located((By.ID, 'contents')))
        
        videos = []
        last_height = self.driver.execute_script("return document.documentElement.scrollHeight")
        
        while len(videos) < max_results:
            # Extract video data from current page
            video_elements = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'div#contents ytd-video-renderer, div#contents ytd-rich-item-renderer'
            )
            
            for element in video_elements:
                try:
                    video_data = self.extract_video_data(element)
                    if video_data and video_data not in videos:
                        videos.append(video_data)
                except Exception as e:
                    continue
            
            # Scroll down to load more videos
            self.driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
            time.sleep(2)
            
            # Check if new content loaded
            new_height = self.driver.execute_script("return document.documentElement.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        return videos[:max_results]
    
    def extract_video_data(self, element):
        """Extract data from a video element"""
        try:
            # Video title and URL
            title_element = element.find_element(By.CSS_SELECTOR, 'a#video-title, h3 a')
            title = title_element.get_attribute('title') or title_element.text
            url = title_element.get_attribute('href')
            
            if not url or not title:
                return None
            
            # Extract video ID from URL
            video_id_match = re.search(r'watch\?v=([^&]+)', url)
            video_id = video_id_match.group(1) if video_id_match else None
            
            # Channel name
            try:
                channel_element = element.find_element(
                    By.CSS_SELECTOR, 
                    'a.yt-simple-endpoint.style-scope.yt-formatted-string'
                )
                channel_name = channel_element.text
            except:
                channel_name = ''
            
            # View count
            try:
                views_element = element.find_element(
                    By.CSS_SELECTOR, 
                    'span.style-scope.ytd-video-meta-block:first-child'
                )
                views = views_element.text
            except:
                views = ''
            
            # Upload time
            try:
                time_element = element.find_element(
                    By.CSS_SELECTOR, 
                    'span.style-scope.ytd-video-meta-block:last-child'
                )
                upload_time = time_element.text
            except:
                upload_time = ''
            
            # Duration
            try:
                duration_element = element.find_element(
                    By.CSS_SELECTOR, 
                    'span.style-scope.ytd-thumbnail-overlay-time-status-renderer'
                )
                duration = duration_element.text
            except:
                duration = ''
            
            return {
                'video_id': video_id,
                'title': title,
                'url': f"https://www.youtube.com{url}" if url.startswith('/') else url,
                'channel_name': channel_name,
                'views': views,
                'upload_time': upload_time,
                'duration': duration
            }
            
        except Exception as e:
            return None
    
    def get_video_comments(self, video_url, max_comments=100):
        """Get comments from a YouTube video"""
        self.driver.get(video_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Scroll down to load comments
        self.driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(2)
        
        comments = []
        last_height = self.driver.execute_script("return document.documentElement.scrollHeight")
        
        while len(comments) < max_comments:
            # Extract comments from current view
            comment_elements = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'ytd-comment-thread-renderer #content-text'
            )
            
            for element in comment_elements:
                try:
                    comment_text = element.text
                    if comment_text and comment_text not in [c['text'] for c in comments]:
                        comments.append({
                            'text': comment_text,
                            'timestamp': time.time()
                        })
                except:
                    continue
            
            # Scroll down to load more comments
            self.driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
            time.sleep(2)
            
            # Check if new content loaded
            new_height = self.driver.execute_script("return document.documentElement.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        return comments[:max_comments]
    
    def close(self):
        self.driver.quit()
```

---

## 🎵 TikTok Scraping

### 🔧 Technical Approaches

#### 1. TikTok Research API (Limited)
**Cost**: Free for research  
**Reliability**: High for available data  
**Legal**: Fully Compliant  

```javascript
const axios = require('axios');

class TikTokResearchAPI {
    constructor(clientKey, clientSecret) {
        this.clientKey = clientKey;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.baseUrl = 'https://open.tiktokapis.com/v2';
    }
    
    async authenticate() {
        try {
            const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
                client_key: this.clientKey,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('TikTok authentication error:', error);
            throw error;
        }
    }
    
    async searchVideos(query, maxCount = 100, startDate = null, endDate = null) {
        if (!this.accessToken) {
            await this.authenticate();
        }
        
        try {
            const searchParams = {
                query: {
                    and: [
                        {
                            operation: 'IN',
                            field_name: 'keyword',
                            field_values: [query]
                        }
                    ]
                },
                max_count: maxCount,
                is_random: false
            };
            
            if (startDate && endDate) {
                searchParams.query.and.push({
                    operation: 'GTE',
                    field_name: 'create_date',
                    field_values: [startDate]
                });
                searchParams.query.and.push({
                    operation: 'LTE',
                    field_name: 'create_date',
                    field_values: [endDate]
                });
            }
            
            const response = await axios.post(`${this.baseUrl}/research/video/query/`, 
                searchParams,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('TikTok search error:', error);
            throw error;
        }
    }
    
    async getVideoComments(videoId, maxCount = 100) {
        if (!this.accessToken) {
            await this.authenticate();
        }
        
        try {
            const response = await axios.post(`${this.baseUrl}/research/video/comment/list/`, 
                {
                    video_id: videoId,
                    max_count: maxCount
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('TikTok comments error:', error);
            throw error;
        }
    }
}