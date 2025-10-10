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
    "url": `https://collectiveai.tools/built-in-tools/${tool.id}`,
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
    "description": "Advanced AI workspace with built-in tools for multi-model orchestration, visual workflow building, real-time data fusion, AI ethics testing, and intelligent automation. Create sophisticated AI agents and workflows with our comprehensive platform.",
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
    "keywords": "AI tools, artificial intelligence, multi-model orchestration, visual workflow builder, real-time data fusion, AI ethics, bias detection, agent builder, MCP, n8n automation, AI workspace",
    "applicationCategory": "AI Development Platform",
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
      "numberOfItems": "100+",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "External AI Tools",
          "description": "Curated AI tools from around the web",
          "url": "https://collectiveai.tools/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "AI Workspace",
          "description": "Built-in AI tools and workspace",
          "url": "https://collectiveai.tools/built-in-tools"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI Job Board",
          "description": "AI job opportunities from top companies",
          "url": "https://collectiveai.tools/job-board"
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

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Collective AI Tools",
    "url": "https://collectiveai.tools",
    "logo": "https://collectiveai.tools/logo.webp",
    "description": "Advanced AI workspace platform providing built-in tools for multi-model orchestration, visual workflow building, real-time data fusion, AI ethics testing, and intelligent automation. Empowering developers and organizations with sophisticated AI capabilities.",
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/Hyraze/collective-ai-tools"
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "AI Ethics",
      "Workflow Automation",
      "Data Fusion",
      "Multi-Model Orchestration",
      "Visual Programming",
      "Agent Development"
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
      "item": `https://collectiveai.tools${index === 0 ? '' : '/' + path.slice(0, index + 1).join('/')}`
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
