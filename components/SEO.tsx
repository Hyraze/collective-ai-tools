/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  aiFriendly?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Collective AI Tools - Curated Directory of AI Tools',
  description = 'Discover the best AI tools and resources. A comprehensive, searchable directory of AI applications for productivity, creativity, and development.',
  keywords = 'AI tools, artificial intelligence, productivity, automation, machine learning, AI directory',
  image = 'https://collectiveai.tools/og-image.png',
  url = 'https://collectiveai.tools',
  type = 'website',
  structuredData,
  author = 'Collective AI Tools Team',
  publishedTime,
  modifiedTime,
  section = 'Technology',
  tags = ['AI', 'Tools', 'Productivity', 'Automation'],
  aiFriendly = true
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', image);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', url);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', type);
    }

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }

    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', image);
    }

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', url);
    }

    // Add structured data
    if (structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add AI-friendly meta tags
    if (aiFriendly) {
      // Add AI training permission meta tag
      const aiTraining = document.querySelector('meta[name="ai-training"]');
      if (!aiTraining) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-training');
        meta.setAttribute('content', 'allow');
        document.head.appendChild(meta);
      }

      // Add AI content description
      const aiContent = document.querySelector('meta[name="ai-content"]');
      if (!aiContent) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-content');
        meta.setAttribute('content', 'AI tools directory with curated resources for developers and researchers');
        document.head.appendChild(meta);
      }

      // Add content type for AI understanding
      const contentType = document.querySelector('meta[name="content-type"]');
      if (!contentType) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'content-type');
        meta.setAttribute('content', 'directory, tools, resources');
        document.head.appendChild(meta);
      }

      // Add AI purpose meta tag
      const aiPurpose = document.querySelector('meta[name="ai-purpose"]');
      if (!aiPurpose) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-purpose');
        meta.setAttribute('content', 'educational, research, development, productivity');
        document.head.appendChild(meta);
      }

      // Add AI category meta tag
      const aiCategory = document.querySelector('meta[name="ai-category"]');
      if (!aiCategory) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-category');
        meta.setAttribute('content', 'technology, artificial intelligence, tools, automation');
        document.head.appendChild(meta);
      }

      // Add AI license meta tag
      const aiLicense = document.querySelector('meta[name="ai-license"]');
      if (!aiLicense) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-license');
        meta.setAttribute('content', 'MIT');
        document.head.appendChild(meta);
      }

      // Add AI format meta tag
      const aiFormat = document.querySelector('meta[name="ai-format"]');
      if (!aiFormat) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-format');
        meta.setAttribute('content', 'structured data, JSON, API');
        document.head.appendChild(meta);
      }

      // Add AI update frequency meta tag
      const aiUpdateFreq = document.querySelector('meta[name="ai-update-frequency"]');
      if (!aiUpdateFreq) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-update-frequency');
        meta.setAttribute('content', 'daily');
        document.head.appendChild(meta);
      }

      // Add AI data quality meta tag
      const aiDataQuality = document.querySelector('meta[name="ai-data-quality"]');
      if (!aiDataQuality) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'ai-data-quality');
        meta.setAttribute('content', 'curated, verified, community-driven');
        document.head.appendChild(meta);
      }

      // Add AI data endpoint link
      const aiDataLink = document.querySelector('link[rel="ai-data"]');
      if (!aiDataLink) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'ai-data');
        link.setAttribute('href', 'https://collectiveai.tools/ai-data.json');
        link.setAttribute('type', 'application/json');
        document.head.appendChild(link);
      }
    }

    // Add article meta tags if provided
    if (publishedTime) {
      const meta = document.querySelector('meta[property="article:published_time"]') || document.createElement('meta');
      meta.setAttribute('property', 'article:published_time');
      meta.setAttribute('content', publishedTime);
      if (!document.querySelector('meta[property="article:published_time"]')) {
        document.head.appendChild(meta);
      }
    }

    if (modifiedTime) {
      const meta = document.querySelector('meta[property="article:modified_time"]') || document.createElement('meta');
      meta.setAttribute('property', 'article:modified_time');
      meta.setAttribute('content', modifiedTime);
      if (!document.querySelector('meta[property="article:modified_time"]')) {
        document.head.appendChild(meta);
      }
    }

    if (author) {
      const meta = document.querySelector('meta[name="author"]') || document.createElement('meta');
      meta.setAttribute('name', 'author');
      meta.setAttribute('content', author);
      if (!document.querySelector('meta[name="author"]')) {
        document.head.appendChild(meta);
      }
    }

    if (section) {
      const meta = document.querySelector('meta[property="article:section"]') || document.createElement('meta');
      meta.setAttribute('property', 'article:section');
      meta.setAttribute('content', section);
      if (!document.querySelector('meta[property="article:section"]')) {
        document.head.appendChild(meta);
      }
    }

    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    }

    // Add language meta tag
    const lang = document.querySelector('meta[name="language"]');
    if (!lang) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'language');
      meta.setAttribute('content', 'en-US');
      document.head.appendChild(meta);
    }

    // Add viewport meta tag for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(meta);
    }

    // Add theme-color meta tag
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#3B82F6');
      document.head.appendChild(meta);
    }

  }, [title, description, keywords, image, url, type, structuredData, author, publishedTime, modifiedTime, section, tags, aiFriendly]);

  return null; // This component doesn't render anything
};

export default SEO;
