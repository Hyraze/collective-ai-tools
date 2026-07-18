/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';

export interface ToolData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string | React.ReactNode;
}

export const generateToolStructuredData = (tool: ToolData) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "url": `https://collectiveai.tools/mcp-catalog/${tool.id}`,
    "applicationCategory": "AI Tool",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Collective AI Tools",
      "url": "https://collectiveai.tools"
    },
    "keywords": tool.tags.join(", "),
    "featureList": tool.tags,
    "screenshot": `https://collectiveai.tools/og-image.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  };
};

export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Collective AI Tools",
    "description": "A comprehensive, community-curated directory of AI tools and resources for developers, researchers, and enthusiasts, plus a catalog of Model Context Protocol (MCP) servers.",
    "url": "https://collectiveai.tools",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://collectiveai.tools/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Collective AI Tools",
      "url": "https://collectiveai.tools",
      "logo": {
        "@type": "ImageObject",
        "url": "https://collectiveai.tools/logo.webp"
      }
    },
    "keywords": "AI tools, artificial intelligence, curated AI directory, MCP catalog, Model Context Protocol, productivity, automation",
    "applicationCategory": "AI Tools Directory",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "alternateName": "AI Tools Directory",
    "mainEntity": {
      "@type": "ItemList",
      "name": "AI Tools Collection",
      "description": "Curated collection of AI tools and resources",
      "numberOfItems": "8",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "AI Tools Directory",
          "description": "Curated directory of AI tools and resources from around the web",
          "url": "https://collectiveai.tools/tools"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "MCP Catalog",
          "description": "Directory of official and community Model Context Protocol servers",
          "url": "https://collectiveai.tools/mcp-catalog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Prompt Studio",
          "description": "Craft, refine, and manage effective prompts",
          "url": "https://collectiveai.tools/prompt-studio"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Prompt Library",
          "description": "Verified prompts gallery for various use cases",
          "url": "https://collectiveai.tools/prompts"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Interactive Roadmap",
          "description": "Step-by-step AI learning paths",
          "url": "https://collectiveai.tools/roadmap"
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Skills Marketplace",
          "description": "Discover and install agent skills for AI coding tools",
          "url": "https://collectiveai.tools/skills"
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "Trending",
          "description": "Hottest AI repositories trending on GitHub",
          "url": "https://collectiveai.tools/trending"
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "ContextKit",
          "description": "Generate AI context for your dev stack, works with any LLM",
          "url": "https://ck.collectiveai.tools/"
        }
      ]
    },
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
      }
    ]
  };
};

export const generateBreadcrumbStructuredData = (path: string[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": path.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item,
      "item": `https://collectiveai.tools${index === 0 ? '' : `/${  path.slice(0, index + 1).join('/')}`}`
    }))
  };
};

export const generateAIFriendlyStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "AI Tools Directory Dataset",
    "description": "Comprehensive dataset of AI tools, resources, and applications for developers, researchers, and AI enthusiasts",
    "url": "https://collectiveai.tools",
    "keywords": "AI tools, artificial intelligence, machine learning, automation, productivity, development tools, AI resources",
    "license": "MIT",
    "creator": {
      "@type": "Organization",
      "name": "Collective AI Tools",
      "url": "https://collectiveai.tools"
    },
    "distribution": {
      "@type": "DataDownload",
      "contentUrl": "https://collectiveai.tools/api/ai-tools",
      "encodingFormat": "application/json"
    },
    "temporalCoverage": "2024-01-01/..",
    "spatialCoverage": "Worldwide",
    "includedInDataCatalog": {
      "@type": "DataCatalog",
      "name": "AI Tools Catalog",
      "url": "https://collectiveai.tools"
    },
    "variableMeasured": [
      {
        "@type": "PropertyValue",
        "name": "Tool Name",
        "description": "Name of the AI tool"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Description",
        "description": "Description of the AI tool functionality"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Category",
        "description": "Category classification of the AI tool"
      },
      {
        "@type": "PropertyValue",
        "name": "Tool Tags",
        "description": "Tags associated with the AI tool"
      }
    ]
  };
};
