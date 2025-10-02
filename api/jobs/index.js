/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

// RSS Feeds for AI Jobs - VERIFIED WORKING sources
const RSS_FEEDS = [
  // ✅ VERIFIED WORKING
  {
    name: 'We Work Remotely - Programming',
    url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
    enabled: true,
    type: 'weworkremotely',
    priority: 1,
    searchTerms: ['ai', 'artificial intelligence', 'machine learning', 'data scientist', 'ml engineer', 'deep learning']
  },
  {
    name: 'We Work Remotely - Data',
    url: 'https://weworkremotely.com/categories/remote-data-science-jobs.rss',
    enabled: true,
    type: 'weworkremotely-data',
    priority: 1,
    searchTerms: ['ai', 'machine learning', 'data science', 'ml', 'artificial intelligence']
  },
  
  // 🔄 ALTERNATIVE WORKING SOURCES
  {
    name: 'Hacker News Jobs',
    url: 'https://hn.algolia.com/api/v1/search?tags=job&hitsPerPage=100',
    enabled: true,
    type: 'hackernews',
    priority: 2,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'ml engineer', 'artificial intelligence', 'data scientist']
  },
  {
    name: 'RemoteOK - AI Jobs',
    url: 'https://remoteok.com/api?tag=ai',
    enabled: true,
    type: 'remoteok-api',
    priority: 2,
    isAPI: true,
    searchTerms: []
  },
  {
    name: 'Arbeitnow Remote Jobs',
    url: 'https://arbeitnow.com/api/job-board-api',
    enabled: true,
    type: 'arbeitnow',
    priority: 2,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence', 'data science']
  },
  
  // 🧪 EXPERIMENTAL - May work with different approaches
  {
    name: 'Remote.co Tech Jobs',
    url: 'https://remote.co/api/jobs/technology',
    enabled: false,
    type: 'remote-co-api',
    priority: 3,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence']
  },
  {
    name: 'AI Jobs Board Feed',
    url: 'https://ai-jobs.net/feed/',
    enabled: true,
    type: 'ai-jobs',
    priority: 3,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence']
  },
  {
    name: 'Remote OK RSS',
    url: 'https://remoteok.io/remote-ai-jobs.rss',
    enabled: true,
    type: 'remoteok-rss',
    priority: 3,
    searchTerms: []
  }
];

// Mock data for AI Jobs (enhanced fallback)
const mockJobs = [
  {
    id: '1',
    title: 'Senior AI Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    type: 'remote',
    description: 'Join our team to build the next generation of AI systems. Work on cutting-edge research and development of large language models.',
    url: 'https://openai.com/careers',
    publishedDate: '2025-01-15',
    source: 'AI Jobs',
    salary: '$180,000 - $250,000',
    experience: '5+ years',
    country: 'US',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Deep Learning']
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'Anthropic',
    location: 'New York, NY',
    type: 'hybrid',
    description: 'Develop and deploy machine learning models for AI safety research. Work on alignment and safety mechanisms for large language models.',
    url: 'https://anthropic.com/careers',
    publishedDate: '2025-01-14',
    source: 'Wellfound',
    salary: '$160,000 - $220,000',
    experience: '3+ years',
    country: 'US',
    tags: ['Python', 'Machine Learning', 'AI Safety', 'Research']
  },
  {
    id: '3',
    title: 'AI Research Scientist',
    company: 'Google DeepMind',
    location: 'London, UK',
    type: 'fulltime',
    description: 'Conduct groundbreaking research in artificial intelligence. Focus on reinforcement learning, computer vision, and natural language processing.',
    url: 'https://deepmind.com/careers',
    publishedDate: '2025-01-13',
    source: 'AI/ML Jobs',
    salary: '£80,000 - £120,000',
    experience: 'PhD or 5+ years',
    country: 'UK',
    tags: ['Research', 'Reinforcement Learning', 'Computer Vision', 'NLP']
  },
  {
    id: '4',
    title: 'Computer Vision Engineer',
    company: 'Tesla',
    location: 'Austin, TX',
    type: 'fulltime',
    description: 'Develop computer vision systems for autonomous vehicles. Work on perception algorithms and neural network architectures.',
    url: 'https://tesla.com/careers',
    publishedDate: '2025-01-12',
    source: 'Machine Learning Jobs',
    salary: '$140,000 - $200,000',
    experience: '4+ years',
    country: 'US',
    tags: ['Computer Vision', 'Autonomous Vehicles', 'C++', 'Python', 'OpenCV']
  },
  {
    id: '5',
    title: 'NLP Engineer',
    company: 'Hugging Face',
    location: 'Remote',
    type: 'remote',
    description: 'Build and optimize natural language processing models. Contribute to open-source AI tools and democratize AI technology.',
    url: 'https://huggingface.co/careers',
    publishedDate: '2025-01-11',
    source: 'Remote AI Jobs',
    salary: '$120,000 - $180,000',
    experience: '3+ years',
    country: 'Remote',
    tags: ['NLP', 'Transformers', 'Hugging Face', 'Open Source']
  }
];

/**
 * Extract country from location text
 */
function extractCountry(location) {
  if (!location) return '';
  
  // Common country mappings and patterns
  const countryMappings = {
    // Full country names
    'united states': 'US',
    'united kingdom': 'UK', 
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'netherlands': 'NL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'switzerland': 'CH',
    'austria': 'AT',
    'belgium': 'BE',
    'ireland': 'IE',
    'portugal': 'PT',
    'poland': 'PL',
    'czech republic': 'CZ',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'croatia': 'HR',
    'slovenia': 'SI',
    'slovakia': 'SK',
    'estonia': 'EE',
    'latvia': 'LV',
    'lithuania': 'LT',
    'japan': 'JP',
    'south korea': 'KR',
    'singapore': 'SG',
    'india': 'IN',
    'china': 'CN',
    'brazil': 'BR',
    'mexico': 'MX',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'peru': 'PE',
    'south africa': 'ZA',
    'israel': 'IL',
    'turkey': 'TR',
    'russia': 'RU',
    'ukraine': 'UA',
    'new zealand': 'NZ',
    'philippines': 'PH',
    'thailand': 'TH',
    'vietnam': 'VN',
    'indonesia': 'ID',
    'malaysia': 'MY',
    'taiwan': 'TW',
    'hong kong': 'HK',
    
    // Common abbreviations
    'usa': 'US',
    'uk': 'UK',
    'uae': 'AE',
    'u.s.': 'US',
    'u.s.a.': 'US',
    'u.k.': 'UK',
    
    // Remote patterns
    'remote': 'Remote',
    'worldwide': 'Remote',
    'global': 'Remote',
    'anywhere': 'Remote',
    'work from home': 'Remote',
    'wfh': 'Remote'
  };
  
  const locationLower = location.toLowerCase().trim();
  
  // Direct mapping
  if (countryMappings[locationLower]) {
    return countryMappings[locationLower];
  }
  
  // Check for country codes (2-3 letters)
  if (/^[A-Z]{2,3}$/.test(location)) {
    return location.toUpperCase();
  }
  
  // Check for city, country patterns
  const cityCountryMatch = location.match(/(.+),\s*(.+)$/);
  if (cityCountryMatch) {
    const countryPart = cityCountryMatch[2].toLowerCase().trim();
    if (countryMappings[countryPart]) {
      return countryMappings[countryPart];
    }
    // Check if it's a US state code
    const usStateCodes = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
    if (usStateCodes.includes(countryPart)) {
      return 'US';
    }
    // Check if it's a Canadian province
    const canadianProvinces = ['ontario', 'quebec', 'british columbia', 'alberta', 'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'prince edward island', 'northwest territories', 'yukon', 'nunavut'];
    if (canadianProvinces.includes(countryPart)) {
      return 'CA';
    }
    // Return the country part as-is if it looks like a country code
    if (/^[A-Z]{2,3}$/i.test(countryPart)) {
      return countryPart.toUpperCase();
    }
  }
  
  // Check for state/country patterns (US states and state codes)
  const usStates = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'];
  const usStateCodes = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  
  if (usStates.some(state => locationLower.includes(state)) || 
      usStateCodes.some(code => locationLower.includes(code))) {
    return 'US';
  }
  
  // Check for UK regions
  const ukRegions = ['england', 'scotland', 'wales', 'northern ireland', 'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield', 'bristol', 'edinburgh', 'glasgow', 'cardiff', 'belfast'];
  
  if (ukRegions.some(region => locationLower.includes(region))) {
    return 'UK';
  }
  
  // Check for Canadian provinces
  const canadianProvinces = ['ontario', 'quebec', 'british columbia', 'alberta', 'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'prince edward island', 'northwest territories', 'yukon', 'nunavut', 'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa'];
  
  if (canadianProvinces.some(province => locationLower.includes(province))) {
    return 'CA';
  }
  
  // Default: return the original location if no mapping found
  return location;
}

/**
 * Extract experience requirements from text
 */
function extractExperience(text) {
  if (!text) return '';
  
  const experiencePatterns = [
    // Years of experience patterns (most specific first)
    /(\d+)\s*-\s*(\d+)\s*years?/gi,
    /(\d+)\s*to\s*(\d+)\s*years?/gi,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
    /(\d+)\+?\s*years?\s*(?:in\s*)?(?:software|development|programming|engineering)/gi,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:relevant\s*)?(?:work\s*)?(?:experience)/gi,
    /experience\s*:?\s*(\d+)\+?\s*years?/gi,
    /(\d+)\+?\s*years?\s*(?:minimum|required|preferred)/gi,
    
    // Experience level patterns (most specific first)
    /(entry\s*level|new\s*grad|new\s*graduate)/gi,
    /(mid\s*level|mid-level|intermediate|mid\s*senior)/gi,
    /(senior\s*level|expert|advanced)/gi,
    /(junior|graduate)/gi,
    /(senior|lead|principal|staff|architect)/gi
  ];
  
  for (const pattern of experiencePatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1] && match[2] && !isNaN(parseInt(match[1])) && !isNaN(parseInt(match[2]))) {
        // Range pattern (e.g., "3-5 years")
        return `${match[1]}-${match[2]} years`;
      } else if (match[1] && !isNaN(parseInt(match[1]))) {
        // Single number pattern
        const years = parseInt(match[1]);
        if (years >= 1 && years <= 15) {
          return `${years}+ years`;
        }
      } else if (match[0] || match[1]) {
        // Level pattern
        const level = match[0].toLowerCase();
        if (level.includes('entry') || level.includes('junior') || level.includes('graduate') || level.includes('new')) {
          return 'Entry level';
        } else if (level.includes('mid') || level.includes('intermediate')) {
          return '3-5 years';
        } else if (level.includes('senior') || level.includes('lead') || level.includes('principal')) {
          return '5+ years';
        } else if (level.includes('expert') || level.includes('advanced')) {
          return '7+ years';
        }
      }
    }
  }
  
  return '';
}

/**
 * Parse API JSON response (for RemoteOK, Arbeitnow, etc.)
 */
function parseAPIJobs(data, sourceName, feedType) {
  const jobs = [];
  const baseTimestamp = Date.now();
  
  try {
    let jobsArray = [];
    
    // Handle different API response formats
    if (feedType === 'remoteok-api') {
      jobsArray = Array.isArray(data) ? data.slice(1) : []; // RemoteOK has metadata in first element
    } else if (feedType === 'hackernews') {
      jobsArray = data.hits || [];
    } else if (feedType === 'arbeitnow') {
      jobsArray = data.data || [];
    } else {
      jobsArray = Array.isArray(data) ? data : data.jobs || [];
    }
    
    jobsArray.forEach((item, index) => {
      try {
        // RemoteOK format
        if (feedType === 'remoteok-api') {
          // Handle date parsing safely
          let publishedDate = new Date().toISOString().split('T')[0];
          if (item.date) {
            try {
              const date = new Date(item.date * 1000);
              if (!isNaN(date.getTime())) {
                publishedDate = date.toISOString().split('T')[0];
              }
            } catch (dateError) {
              // Invalid date, use current date
            }
          }
          
          // Clean up description - remove HTML tags and truncate
          let description = item.description || '';
          if (description) {
            description = description.replace(/<[^>]*>/g, '').trim();
            
            // Decode HTML entities
            description = description
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .replace(/&apos;/g, "'");
            
            // Remove extra whitespace
            description = description.replace(/\s+/g, ' ').trim();
            
            if (description.length > 300) {
              description = description.substring(0, 300) + '...';
            }
          }
          
          // Extract company name better
          let company = item.company || 'Unknown Company';
          if (company === 'Unknown Company' && item.position) {
            // Try to extract company from position title
            const positionMatch = item.position.match(/^(.+?)\s*[-–]\s*(.+)$/);
            if (positionMatch) {
              company = positionMatch[1].trim();
            }
          }
          
          jobs.push({
            id: `api-${feedType}-${item.id || index}-${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.position || item.title || 'Unknown Position',
            company: company,
            location: item.location || 'Remote',
            type: 'remote',
            description: description,
            url: item.url || `https://remoteok.com/remote-jobs/${item.id}`,
            publishedDate: publishedDate,
            source: sourceName,
            salary: item.salary_min && item.salary_max ? `$${item.salary_min} - $${item.salary_max}` : '',
            experience: extractExperience(`${item.position || ''} ${description}`),
            country: extractCountry(item.location || ''),
            tags: item.tags || []
          });
        }
        // Hacker News format
        else if (feedType === 'hackernews') {
          const title = item.story_text || item.title || '';
          if (title.length > 10) {
            // Handle date parsing safely
            let publishedDate = new Date().toISOString().split('T')[0];
            if (item.created_at) {
              try {
                const date = new Date(item.created_at);
                if (!isNaN(date.getTime())) {
                  publishedDate = date.toISOString().split('T')[0];
                }
              } catch (dateError) {
                // Invalid date, use current date
              }
            }
            
            jobs.push({
              id: `api-${feedType}-${item.objectID}-${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.substring(0, 100),
              company: 'See HN Post',
              location: 'Various',
              type: 'remote',
              description: item.story_text || item.title || '',
              url: item.story_url || `https://news.ycombinator.com/item?id=${item.objectID}`,
              publishedDate: publishedDate,
              source: sourceName,
              salary: '',
              experience: extractExperience(`${title} ${item.story_text || ''}`),
              country: 'Various',
              tags: ['Hacker News']
            });
          }
        }
        // Arbeitnow format
        else if (feedType === 'arbeitnow') {
          // Handle date parsing safely
          let publishedDate = new Date().toISOString().split('T')[0];
          if (item.created_at) {
            try {
              const date = new Date(item.created_at);
              if (!isNaN(date.getTime())) {
                publishedDate = date.toISOString().split('T')[0];
              }
            } catch (dateError) {
              // Invalid date, use current date
            }
          }
          
          // Clean up description - remove HTML tags and truncate
          let description = item.description || '';
          if (description) {
            description = description.replace(/<[^>]*>/g, '').trim();
            
            // Decode HTML entities
            description = description
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .replace(/&apos;/g, "'");
            
            // Remove extra whitespace
            description = description.replace(/\s+/g, ' ').trim();
            
            if (description.length > 300) {
              description = description.substring(0, 300) + '...';
            }
          }
          
          // Better company name extraction
          let company = item.company_name || 'Unknown Company';
          if (company === 'Unknown Company' && item.title) {
            // Try to extract company from title
            const titleMatch = item.title.match(/^(.+?)\s*[-–]\s*(.+)$/);
            if (titleMatch) {
              company = titleMatch[1].trim();
            }
          }
          
          jobs.push({
            id: `api-${feedType}-${item.slug || index}-${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title || 'Unknown Position',
            company: company,
            location: item.location || 'Remote',
            type: item.remote ? 'remote' : 'fulltime',
            description: description,
            url: item.url || `https://arbeitnow.com/jobs/${item.slug}`,
            publishedDate: publishedDate,
            source: sourceName,
            salary: '',
            experience: extractExperience(`${item.title || ''} ${description}`),
            country: extractCountry(item.location || ''),
            tags: item.tags || []
          });
        }
      } catch (itemError) {
        // Skip invalid items
      }
    });
    
    // Successfully parsed jobs from API
  } catch (error) {
    // Error parsing API response
  }
  
  return jobs;
}

/**
 * Parse XML/RSS text to extract job information
 */
function parseXMLToJobs(xmlText, sourceName) {
  const jobs = [];
  const baseTimestamp = Date.now();
  
  try {
    // Simple XML parsing for RSS feeds
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      // Extract title
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '';
      
      // Extract description
      const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s);
      const description = descMatch ? (descMatch[1] || descMatch[2]) : '';
      
      // Extract link
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const url = linkMatch ? linkMatch[1].trim() : '';
      
      // Extract pubDate
      const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      let pubDate = new Date().toISOString();
      if (dateMatch) {
        try {
          const date = new Date(dateMatch[1]);
          if (!isNaN(date.getTime())) {
            pubDate = date.toISOString();
          }
        } catch (dateError) {
          // Invalid date, use current date
        }
      }
      
      // Extract company from title or description
      let company = 'Unknown Company';
      
      // Try multiple patterns to extract company name
      if (title.includes(' at ')) {
        company = title.split(' at ')[1].split(' - ')[0].split(' | ')[0].split('(')[0].trim();
      } else if (title.includes(' - ')) {
        // Pattern: "Company - Job Title"
        const titleParts = title.split(' - ');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (title.includes(' | ')) {
        // Pattern: "Company | Job Title"
        const titleParts = title.split(' | ');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (title.includes(':')) {
        // Pattern: "Company: Job Title"
        const titleParts = title.split(':');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (description.includes('Company:')) {
        const companyMatch = description.match(/Company:\s*([^\n<]+)/);
        if (companyMatch) company = companyMatch[1].trim();
      } else if (description.includes('About ')) {
        // Try to extract from "About Company" pattern
        const aboutMatch = description.match(/About\s+([A-Za-z\s&]+?)[\s\n]/);
        if (aboutMatch) company = aboutMatch[1].trim();
      } else if (description.includes('Headquarters:')) {
        // Try to extract company from URL or other patterns
        const urlMatch = description.match(/URL:\s*<a[^>]*>https?:\/\/(?:www\.)?([^\/]+)/);
        if (urlMatch) {
          const domain = urlMatch[1].split('.')[0];
          company = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      }
      
      // Extract location
      let location = 'Remote';
      const locationMatch = title.match(/\((.*?)\)/) || description.match(/Location:\s*([^\n<]+)/);
      if (locationMatch) {
        location = locationMatch[1].trim();
      } else if (description.includes('Headquarters:')) {
        const hqMatch = description.match(/Headquarters:\s*([^\n<]+)/);
        if (hqMatch) location = hqMatch[1].trim();
      }
      
      // Determine job type
      let type = 'fulltime';
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      if (titleLower.includes('remote') || descLower.includes('remote')) {
        type = 'remote';
      } else if (titleLower.includes('hybrid') || descLower.includes('hybrid')) {
        type = 'hybrid';
      } else if (titleLower.includes('contract') || descLower.includes('contract')) {
        type = 'contract';
      } else if (titleLower.includes('part-time') || descLower.includes('part-time')) {
        type = 'parttime';
      }
      
      // Extract salary
      let salary = '';
      const salaryMatch = description.match(/\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/);
      if (salaryMatch) {
        salary = salaryMatch[0];
      }
      
      // Extract experience level from title and description
      const experience = extractExperience(`${title} ${description}`);
      
      // Extract country from location
      const country = extractCountry(location);
      
      if (title && title.length > 5) {
        // Clean up description - remove HTML tags and improve formatting
        let cleanDescription = description;
        
        // FIRST: Decode HTML entities to get actual HTML tags
        cleanDescription = cleanDescription
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&apos;/g, "'");
        
        // SECOND: Remove all HTML tags
        cleanDescription = cleanDescription.replace(/<[^>]*>/g, '');
        
        // Remove extra whitespace, line breaks, and clean up
        cleanDescription = cleanDescription
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, ' ')
          .replace(/\r+/g, ' ')
          .trim();
        
        // Truncate if too long
        if (cleanDescription.length > 300) {
          cleanDescription = cleanDescription.substring(0, 300) + '...';
        }
        
        jobs.push({
          id: `rss-${baseTimestamp + jobs.length}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          type: type,
          description: cleanDescription,
          url: url,
          publishedDate: new Date(pubDate).toISOString().split('T')[0],
          source: sourceName,
          salary: salary,
          experience: experience,
          country: country,
          tags: tags.slice(0, 5)
        });
      }
    }
  } catch (error) {
    // Error parsing XML
  }
  
  return jobs;
}

/**
 * Check if job is AI-related
 */
function isAIJob(job, searchTerms) {
  if (!searchTerms || searchTerms.length === 0) return true;
  
  const text = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase();
  return searchTerms.some(term => text.includes(term.toLowerCase()));
}

/**
 * Fetch from API endpoint
 */
async function fetchAPIJobs(apiUrl, sourceName, feedType, searchTerms = []) {
  try {
    // Fetching API data
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const allJobs = parseAPIJobs(data, sourceName, feedType);
    
    // Filter for AI-related jobs
    const aiJobs = allJobs.filter(job => isAIJob(job, searchTerms));
    
    // Successfully fetched AI jobs
    return aiJobs;
    
  } catch (error) {
    // Failed to fetch API data
    return [];
  }
}

/**
 * Fetch from RSS feed
 */
async function fetchRSSFeed(feedUrl, sourceName, searchTerms = []) {
  try {
    // Fetching RSS feed
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const allJobs = parseXMLToJobs(xmlText, sourceName);
    
    // Filter for AI-related jobs
    const aiJobs = allJobs.filter(job => isAIJob(job, searchTerms));
    
    // Successfully fetched AI jobs
    return aiJobs;
    
  } catch (error) {
    // Failed to fetch RSS feed
    return [];
  }
}

/**
 * Fetch all jobs from all sources
 */
async function fetchAllJobs() {
  try {
    // Sort feeds by priority
    const sortedFeeds = RSS_FEEDS.filter(f => f.enabled).sort((a, b) => a.priority - b.priority);
    
    // Create promises for all feeds
    const feedPromises = sortedFeeds.map(feed => {
      if (feed.isAPI) {
        return fetchAPIJobs(feed.url, feed.name, feed.type, feed.searchTerms || []);
      } else {
        return fetchRSSFeed(feed.url, feed.name, feed.searchTerms || []);
      }
    });
    
    // Fetch all feeds in parallel
    const results = await Promise.allSettled(feedPromises);
    
    const allJobs = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allJobs.push(...result.value);
        // Successfully processed feed
      } else if (result.status === 'rejected') {
        // Feed failed
      }
    });
    
    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.title === job.title && j.company === job.company)
    );
    
    // Sort by date
    uniqueJobs.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    
    // Total unique jobs processed
    return uniqueJobs;
    
  } catch (error) {
    // Error fetching jobs
    return [];
  }
}

/**
 * Main API endpoint
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    const { type, source, search, country, useRSS } = req.query;
    
    let jobs = [];
    
    if (useRSS !== 'false') {
      jobs = await fetchAllJobs();
    } else {
      jobs = [...mockJobs];
    }
    
    // Apply filters
    if (type && type !== 'all') {
      jobs = jobs.filter(job => job.type === type);
    }
    
    if (source && source !== 'all') {
      jobs = jobs.filter(job => job.source.toLowerCase().includes(source.toLowerCase()));
    }

    if (country && country !== 'all') {
      jobs = jobs.filter(job => job.country === country);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    const availableSources = [...new Set(jobs.map(job => job.source))];
    
    res.json({
      jobs,
      total: jobs.length,
      lastUpdated: new Date().toISOString(),
      sources: availableSources,
      dataSource: jobs.length > 0 && jobs[0].id.startsWith('rss-') ? 'Live Feeds' : 
                  jobs.length > 0 && jobs[0].id.startsWith('api-') ? 'Live APIs' : 'Mock Data',
      activeFeeds: RSS_FEEDS.filter(f => f.enabled).map(f => ({
        name: f.name,
        type: f.type,
        priority: f.priority,
        isAPI: f.isAPI || false
      }))
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export functions for use in other API endpoints
export { RSS_FEEDS, fetchAPIJobs, fetchRSSFeed, parseAPIJobs, parseXMLToJobs, isAIJob, fetchAllJobs, extractExperience, extractCountry };
