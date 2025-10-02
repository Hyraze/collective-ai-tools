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
      "target": "https://collectiveai.tools/tools?search={search_term_string}",
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
    }
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
