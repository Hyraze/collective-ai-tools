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
    "description": "Discover the best AI tools and resources. A comprehensive, searchable directory of AI applications for productivity, creativity, and development.",
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
    "description": "A comprehensive directory of AI tools and resources for productivity, creativity, and development.",
    "sameAs": [
      "https://github.com/Hyraze/collective-ai-tools"
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
