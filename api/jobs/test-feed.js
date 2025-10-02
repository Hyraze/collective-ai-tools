/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

// Import the same functions from the main jobs API
import { RSS_FEEDS, fetchAPIJobs, fetchRSSFeed } from './index.js';

/**
 * Test individual feed endpoint
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { feed } = req.query;
    
    if (!feed) {
      res.status(400).json({ 
        error: 'Feed parameter is required',
        availableFeeds: RSS_FEEDS.map(f => ({ name: f.name, type: f.type }))
      });
      return;
    }
    
    const selectedFeed = RSS_FEEDS.find(f => 
      f.name.toLowerCase().includes(feed.toLowerCase()) || 
      f.type.toLowerCase().includes(feed.toLowerCase())
    );
    
    if (!selectedFeed) {
      res.status(404).json({ 
        error: 'Feed not found',
        availableFeeds: RSS_FEEDS.map(f => ({ name: f.name, type: f.type }))
      });
      return;
    }
    
    // Testing individual feed
    
    let jobs = [];
    if (selectedFeed.isAPI) {
      jobs = await fetchAPIJobs(selectedFeed.url, selectedFeed.name, selectedFeed.type, selectedFeed.searchTerms || []);
    } else {
      jobs = await fetchRSSFeed(selectedFeed.url, selectedFeed.name, selectedFeed.searchTerms || []);
    }
    
    res.json({
      feed: {
        name: selectedFeed.name,
        type: selectedFeed.type,
        url: selectedFeed.url,
        isAPI: selectedFeed.isAPI || false,
        priority: selectedFeed.priority
      },
      jobs,
      total: jobs.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
