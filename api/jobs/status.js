/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

// Import the same functions from the main jobs API
import { RSS_FEEDS, fetchAPIJobs, fetchRSSFeed } from './index.js';

/**
 * Status endpoint to check all feeds
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
    const feedStatuses = [];
    
    for (const feed of RSS_FEEDS.filter(f => f.enabled)) {
      try {
        // Checking feed status
        
        let jobs = [];
        if (feed.isAPI) {
          jobs = await fetchAPIJobs(feed.url, feed.name, feed.type, feed.searchTerms || []);
        } else {
          jobs = await fetchRSSFeed(feed.url, feed.name, feed.searchTerms || []);
        }
        
        feedStatuses.push({
          name: feed.name,
          type: feed.type,
          url: feed.url,
          isAPI: feed.isAPI || false,
          priority: feed.priority,
          status: 'working',
          jobCount: jobs.length,
          lastChecked: new Date().toISOString()
        });
        
      } catch (error) {
        feedStatuses.push({
          name: feed.name,
          type: feed.type,
          url: feed.url,
          isAPI: feed.isAPI || false,
          priority: feed.priority,
          status: 'failed',
          jobCount: 0,
          error: error.message,
          lastChecked: new Date().toISOString()
        });
      }
    }
    
    const workingFeeds = feedStatuses.filter(f => f.status === 'working').length;
    const failedFeeds = feedStatuses.filter(f => f.status === 'failed').length;
    const totalJobs = feedStatuses.reduce((sum, f) => sum + f.jobCount, 0);
    
    res.json({
      feeds: feedStatuses,
      summary: {
        total: feedStatuses.length,
        working: workingFeeds,
        failed: failedFeeds,
        totalJobs
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
