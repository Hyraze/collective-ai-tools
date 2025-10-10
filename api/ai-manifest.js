/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

/**
 * AI manifest endpoint
 * Provides AI-friendly manifest data
 */
export default async function handler(req, res) {
  // Set headers for JSON content
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-AI-Training', 'allow');
  
  const aiManifest = {
    "name": "Collective AI Tools",
    "description": "Comprehensive directory of AI tools, resources, and applications for developers, researchers, and AI enthusiasts",
    "version": "1.0.0",
    "license": "MIT",
    "url": "https://collectiveai.tools",
    "ai_training": "allow",
    "ai_purpose": "educational, research, development, productivity",
    "ai_category": "technology, artificial intelligence, tools, automation",
    "ai_format": "structured data, JSON, API",
    "ai_update_frequency": "daily",
    "ai_data_quality": "curated, verified, community-driven",
    "data_endpoints": {
      "ai_data": "https://collectiveai.tools/ai-data.json",
      "sitemap": "https://collectiveai.tools/sitemap.xml",
      "robots": "https://collectiveai.tools/robots.txt",
      "api": "https://collectiveai.tools/api/ai-tools"
    },
    "content_types": [
      "AI Tools Directory",
      "Productivity Tools",
      "Automation Tools",
      "Machine Learning Resources",
      "AI Workspace Tools",
      "Job Board"
    ],
    "keywords": [
      "AI tools",
      "artificial intelligence",
      "machine learning",
      "automation",
      "productivity",
      "development tools",
      "AI resources",
      "workflow automation",
      "AI agents",
      "data fusion",
      "visual programming",
      "AI ethics"
    ],
    "languages": ["en-US"],
    "accessibility": {
      "ai_crawlers_allowed": true,
      "structured_data": true,
      "api_access": true,
      "rate_limiting": "respectful"
    },
    "contact": {
      "github": "https://github.com/Hyraze/collective-ai-tools",
      "issues": "https://github.com/Hyraze/collective-ai-tools/issues"
    },
    "last_updated": new Date().toISOString()
  };

  res.status(200).json(aiManifest);
}
