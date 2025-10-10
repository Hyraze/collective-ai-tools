/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

/**
 * AI-friendly data endpoint
 * Provides structured data for AI systems and crawlers
 */
export default async function handler(req, res) {
  // Set CORS headers for AI access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const baseUrl = 'https://collectiveai.tools';
  const currentDate = new Date().toISOString();

  // AI-friendly structured data
  const aiData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Collective AI Tools Directory",
    "description": "Comprehensive directory of AI tools, resources, and applications for developers, researchers, and AI enthusiasts. Includes both external curated tools and built-in AI workspace tools.",
    "url": baseUrl,
    "license": "MIT",
    "creator": {
      "@type": "Organization",
      "name": "Collective AI Tools",
      "url": baseUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://github.com/Hyraze/collective-ai-tools/issues"
      }
    },
    "datePublished": "2024-01-01",
    "dateModified": currentDate.split('T')[0],
    "temporalCoverage": "2024-01-01/..",
    "spatialCoverage": "Worldwide",
    "inLanguage": "en-US",
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
    "about": [
      {
        "@type": "Thing",
        "name": "Artificial Intelligence",
        "description": "AI tools and resources for developers and researchers"
      },
      {
        "@type": "Thing",
        "name": "Productivity Tools",
        "description": "Tools to enhance productivity and automation"
      },
      {
        "@type": "Thing",
        "name": "Machine Learning",
        "description": "ML tools and frameworks for AI development"
      }
    ],
    "distribution": [
      {
        "@type": "DataDownload",
        "contentUrl": `${baseUrl}/api/ai-tools`,
        "encodingFormat": "application/json",
        "description": "API endpoint for AI tools data"
      },
      {
        "@type": "DataDownload",
        "contentUrl": `${baseUrl}/sitemap.xml`,
        "encodingFormat": "application/xml",
        "description": "XML sitemap for site structure"
      }
    ],
    "mainEntity": {
      "@type": "ItemList",
      "name": "AI Tools Collection",
      "description": "Curated collection of AI tools and resources",
      "numberOfItems": "100+",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "External AI Tools",
          "description": "Curated AI tools from around the web",
          "url": `${baseUrl}/`,
          "category": "External Tools"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "AI Workspace",
          "description": "Built-in AI tools and workspace",
          "url": `${baseUrl}/built-in-tools`,
          "category": "Built-in Tools"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI Job Board",
          "description": "AI job opportunities from top companies",
          "url": `${baseUrl}/job-board`,
          "category": "Job Board"
        }
      ]
    },
    "variableMeasured": [
      {
        "@type": "PropertyValue",
        "name": "Tool Name",
        "description": "Name of the AI tool",
        "dataType": "Text"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Description",
        "description": "Description of the AI tool functionality",
        "dataType": "Text"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Category",
        "description": "Category classification of the AI tool",
        "dataType": "Text"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Tags",
        "description": "Tags associated with the AI tool",
        "dataType": "Text"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool URL",
        "description": "URL of the AI tool",
        "dataType": "URL"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Price",
        "description": "Pricing information for the tool",
        "dataType": "Text"
      }
    ],
    "usageInfo": {
      "@type": "CreativeWork",
      "name": "Usage Guidelines",
      "description": "This dataset is free to use for research, development, and educational purposes. Please respect the individual tool licenses and terms of service.",
      "license": "MIT",
      "url": "https://github.com/Hyraze/collective-ai-tools/blob/main/LICENSE"
    },
    "citation": {
      "@type": "CreativeWork",
      "name": "Collective AI Tools",
      "url": baseUrl,
      "author": {
        "@type": "Organization",
        "name": "Collective AI Tools Team"
      }
    }
  };

  res.status(200).json(aiData);
}
