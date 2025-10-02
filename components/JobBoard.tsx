/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Briefcase, MapPin, Clock, Search, ExternalLink, RefreshCw, Building2, Users, Globe, Home, Calendar, Loader2 } from 'lucide-react';
import SEO from './SEO';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '../lib/seoUtils';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'fulltime' | 'contract' | 'parttime';
  description: string;
  url: string;
  publishedDate: string;
  source: string;
  salary?: string;
  experience?: string;
  country?: string;
  tags: string[];
}


const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Lazy loading states
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);


  // Mock data for demonstration (in production, this would come from RSS feeds)
  const mockJobs: Job[] = [
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
      tags: ['NLP', 'Transformers', 'Hugging Face', 'Open Source']
    },
    {
      id: '6',
      title: 'AI Product Manager',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'hybrid',
      description: 'Lead AI product development and strategy. Work with engineering teams to bring AI solutions to market.',
      url: 'https://microsoft.com/careers',
      publishedDate: '2025-01-10',
      source: 'AI Jobs',
      salary: '$150,000 - $200,000',
      experience: '5+ years',
      tags: ['Product Management', 'AI Strategy', 'Leadership', 'Azure']
    }
  ];

  // Fetch jobs from API endpoint
  const fetchJobs = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setCurrentPage(1);
      setDisplayedJobs([]);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedSource !== 'all') params.append('source', selectedSource);
      if (selectedCountry !== 'all') params.append('country', selectedCountry);
      if (searchTerm) params.append('search', searchTerm);
      
      // Use local server API endpoint
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:3001/api/jobs?${params.toString()}`
        : `/api/jobs?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allJobs = data.jobs || [];
      
      if (reset) {
        setJobs(allJobs);
        setLastUpdated(new Date(data.lastUpdated || new Date().toISOString()));
      }
      
      // Update displayed jobs for lazy loading
      updateDisplayedJobs(allJobs, reset);
      
    } catch (err) {
      setError('Failed to fetch job listings. Please try again later.');
      console.error('Error fetching jobs:', err);
      // Fallback to mock data
      const fallbackJobs = mockJobs;
      if (reset) {
        setJobs(fallbackJobs);
        setLastUpdated(new Date());
      }
      updateDisplayedJobs(fallbackJobs, reset);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Update displayed jobs based on current page
  const updateDisplayedJobs = useCallback((allJobs: Job[], reset: boolean) => {
    const startIndex = reset ? 0 : (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const newJobs = allJobs.slice(startIndex, endIndex);
    
    if (reset) {
      setDisplayedJobs(newJobs);
    } else {
      setDisplayedJobs(prev => [...prev, ...newJobs]);
    }
    
    setHasMore(endIndex < allJobs.length);
  }, [currentPage, jobsPerPage]);

  // Load more jobs
  const loadMoreJobs = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
      fetchJobs(false);
    }
  }, [loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMoreJobs]);

  useEffect(() => {
    fetchJobs(true);
  }, []);

  // Refetch jobs when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(true);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedSource, selectedCountry]);

  // Use displayed jobs for lazy loading
  const filteredJobs = displayedJobs;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'remote': return <Globe className="h-4 w-4" />;
      case 'hybrid': return <Home className="h-4 w-4" />;
      case 'fulltime': return <Building2 className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'hybrid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fulltime': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate job-specific structured data
  const jobStructuredData = useMemo(() => {
    if (jobs.length === 0) return [];
    
    return jobs.slice(0, 10).map(job => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.publishedDate,
      "employmentType": job.type === 'remote' ? 'FULL_TIME' : 
                      job.type === 'hybrid' ? 'FULL_TIME' : 
                      job.type === 'contract' ? 'CONTRACTOR' : 'FULL_TIME',
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
        "url": job.url
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location
        }
      },
      "baseSalary": job.salary ? {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary.replace(/[$,]/g, ''),
          "unitText": "YEAR"
        }
      } : undefined,
      "skills": job.tags,
      "url": job.url,
      "source": job.source
    }));
  }, [jobs]);

  // Generate organization structured data
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Collective AI Tools",
    "description": "AI-powered tools and job board for artificial intelligence professionals",
    "url": "https://collectiveai.tools",
    "logo": "https://collectiveai.tools/logo.png",
    "sameAs": [
      "https://github.com/collective-ai-tools",
      "https://twitter.com/collectiveai"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Jobs Board",
      "itemListElement": jobs.slice(0, 5).map((job, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "datePosted": job.publishedDate,
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.company
          }
        },
        "position": index + 1
      }))
    }
  };

  return (
    <>
      <SEO
        title="AI Jobs Board - Find Your Next AI Career Opportunity | Collective AI Tools"
        description="Discover the latest AI job opportunities from top companies worldwide. Browse 100+ remote, hybrid, and full-time positions in artificial intelligence, machine learning, and data science. Updated daily with verified listings."
        keywords="AI jobs, artificial intelligence careers, machine learning jobs, data science jobs, remote AI jobs, AI engineer jobs, ML engineer jobs, deep learning jobs, computer vision jobs, NLP jobs, AI research jobs, tech jobs, startup jobs"
        url="https://collectiveai.tools/job-board"
        type="website"
        structuredData={[
          generateWebsiteStructuredData(),
          generateBreadcrumbStructuredData(["Home", "Job Board"]),
          organizationStructuredData,
          ...jobStructuredData
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Jobs Board
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
            Discover authentic AI job opportunities from top companies worldwide. 
            Curated from the best AI job boards and RSS feeds for genuine, high-quality positions.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6 mb-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 justify-center sm:justify-start">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{jobs.length} Jobs</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 justify-center sm:justify-start">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{new Set(jobs.map(job => job.company)).size} Companies</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 justify-center sm:justify-start">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{jobs.filter(job => job.type === 'remote').length} Remote</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 justify-center sm:justify-start col-span-2 sm:col-span-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">
                {lastUpdated ? `Updated ${formatDate(lastUpdated.toISOString())}` : 'Last updated: Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Job Type Filter - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-2 flex-1">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                  className="text-xs sm:text-sm"
                >
                  All Types
                </Button>
                <Button
                  variant={selectedType === 'remote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('remote')}
                  className="text-xs sm:text-sm"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Remote</span>
                  <span className="sm:hidden">Remote</span>
                </Button>
                <Button
                  variant={selectedType === 'hybrid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('hybrid')}
                  className="text-xs sm:text-sm"
                >
                  <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Hybrid</span>
                  <span className="sm:hidden">Hybrid</span>
                </Button>
                <Button
                  variant={selectedType === 'fulltime' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('fulltime')}
                  className="text-xs sm:text-sm"
                >
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Full-time</span>
                  <span className="sm:hidden">Full-time</span>
                </Button>
              </div>
              
              {/* Source Filter */}
              <div className="flex-1">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">📰 All Sources</option>
                  <option value="AI Jobs">AI Jobs</option>
                  <option value="Wellfound (AngelList)">Wellfound (AngelList)</option>
                  <option value="Remote AI Jobs">Remote AI Jobs</option>
                  <option value="AI/ML Jobs">AI/ML Jobs</option>
                  <option value="Machine Learning Jobs">Machine Learning Jobs</option>
                </select>
              </div>
              
              {/* Country Filter */}
              <div className="flex-1">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">🌍 All Countries</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="ES">🇪🇸 Spain</option>
                  <option value="IT">🇮🇹 Italy</option>
                  <option value="NL">🇳🇱 Netherlands</option>
                  <option value="SE">🇸🇪 Sweden</option>
                  <option value="NO">🇳🇴 Norway</option>
                  <option value="DK">🇩🇰 Denmark</option>
                  <option value="FI">🇫🇮 Finland</option>
                  <option value="CH">🇨🇭 Switzerland</option>
                  <option value="AT">🇦🇹 Austria</option>
                  <option value="BE">🇧🇪 Belgium</option>
                  <option value="IE">🇮🇪 Ireland</option>
                  <option value="PT">🇵🇹 Portugal</option>
                  <option value="PL">🇵🇱 Poland</option>
                  <option value="CZ">🇨🇿 Czech Republic</option>
                  <option value="HU">🇭🇺 Hungary</option>
                  <option value="RO">🇷🇴 Romania</option>
                  <option value="BG">🇧🇬 Bulgaria</option>
                  <option value="HR">🇭🇷 Croatia</option>
                  <option value="SI">🇸🇮 Slovenia</option>
                  <option value="SK">🇸🇰 Slovakia</option>
                  <option value="EE">🇪🇪 Estonia</option>
                  <option value="LV">🇱🇻 Latvia</option>
                  <option value="LT">🇱🇹 Lithuania</option>
                  <option value="JP">🇯🇵 Japan</option>
                  <option value="KR">🇰🇷 South Korea</option>
                  <option value="SG">🇸🇬 Singapore</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="CN">🇨🇳 China</option>
                  <option value="BR">🇧🇷 Brazil</option>
                  <option value="MX">🇲🇽 Mexico</option>
                  <option value="AR">🇦🇷 Argentina</option>
                  <option value="CL">🇨🇱 Chile</option>
                  <option value="CO">🇨🇴 Colombia</option>
                  <option value="PE">🇵🇪 Peru</option>
                  <option value="ZA">🇿🇦 South Africa</option>
                  <option value="IL">🇮🇱 Israel</option>
                  <option value="TR">🇹🇷 Turkey</option>
                  <option value="RU">🇷🇺 Russia</option>
                  <option value="UA">🇺🇦 Ukraine</option>
                  <option value="NZ">🇳🇿 New Zealand</option>
                  <option value="PH">🇵🇭 Philippines</option>
                  <option value="TH">🇹🇭 Thailand</option>
                  <option value="VN">🇻🇳 Vietnam</option>
                  <option value="ID">🇮🇩 Indonesia</option>
                  <option value="MY">🇲🇾 Malaysia</option>
                  <option value="TW">🇹🇼 Taiwan</option>
                  <option value="HK">🇭🇰 Hong Kong</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="Remote">🌍 Remote</option>
                </select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedSource('all');
                    setSelectedCountry('all');
                  }}
                  className="text-xs sm:text-sm"
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchJobs()}
                  disabled={loading}
                  className="text-xs sm:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 dark:border-red-800">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => fetchJobs()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading job listings...</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
                {displayedJobs.length < jobs.length && (
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                    (Showing {displayedJobs.length} of {jobs.length})
                  </span>
                )}
              </h2>
              {searchTerm && (
                <p className="text-gray-600 dark:text-gray-400">
                  Results for "{searchTerm}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
                        <Badge className={`${getTypeColor(job.type)} flex items-center gap-1 text-xs`}>
                          {getTypeIcon(job.type)}
                          <span className="capitalize hidden sm:inline">{job.type}</span>
                          <span className="capitalize sm:hidden">{job.type === 'fulltime' ? 'FT' : job.type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {job.source}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <CardDescription className="mb-4 line-clamp-3 text-sm sm:text-base">
                      {job.description}
                    </CardDescription>
                    
                    {/* Job Details */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">💰</span>
                          <span className="truncate">{job.salary}</span>
                        </div>
                      )}
                      {job.experience && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">📈</span>
                          <span className="truncate">{job.experience}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{formatDate(job.publishedDate)}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      {job.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{job.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Apply Button */}
                    <Button 
                      asChild 
                      className="w-full group-hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Apply Now
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Section */}
            {filteredJobs.length > 0 && (
              <div className="mt-8 text-center">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more jobs...</span>
                  </div>
                )}
                
                {!loadingMore && hasMore && (
                  <Button 
                    onClick={loadMoreJobs}
                    variant="outline"
                    className="px-8 py-2"
                  >
                    Load More Jobs
                  </Button>
                )}
                
                {!hasMore && jobs.length > jobsPerPage && (
                  <p className="text-gray-600 dark:text-gray-400">
                    You've reached the end of the job listings
                  </p>
                )}
                
                {/* Intersection Observer Target */}
                <div ref={loadMoreRef} className="h-4" />
              </div>
            )}

            {/* No Results */}
            {filteredJobs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                      setSelectedSource('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

      </div>
    </>
  );
};

export default JobBoard;
