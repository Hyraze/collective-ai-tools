/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Database, 
  Download, 
  Settings,
  Play,
  Pause,
  Plus,
  Trash2,
  Zap,
  Brain,
  Globe,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'webhook' | 'stream' | 'social' | 'news' | 'financial';
  url: string;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error' | 'loading';
  lastUpdate: string;
  dataCount: number;
  icon: React.ReactNode;
  description: string;
}


interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  data: any;
  actionable: boolean;
}

interface FusionDashboard {
  id: string;
  name: string;
  description: string;
  dataSources: string[];
  widgets: DashboardWidget[];
  refreshInterval: number;
  lastUpdate: string;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'insight' | 'alert';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  data: any;
}

const DATA_SOURCE_TYPES = [
  {
    type: 'api',
    name: 'REST API',
    description: 'Connect to REST APIs',
    icon: <Globe className="h-4 w-4" />,
    color: 'bg-blue-500'
  },
  {
    type: 'database',
    name: 'Database',
    description: 'Connect to databases',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-green-500'
  },
  {
    type: 'file',
    name: 'File Upload',
    description: 'Upload CSV, JSON files',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-purple-500'
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Real-time webhook data',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-orange-500'
  },
  {
    type: 'stream',
    name: 'Data Stream',
    description: 'Real-time data streams',
    icon: <Activity className="h-4 w-4" />,
    color: 'bg-red-500'
  },
  {
    type: 'social',
    name: 'Social Media',
    description: 'Social media feeds',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-pink-500'
  },
  {
    type: 'news',
    name: 'News Feed',
    description: 'News and articles',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-indigo-500'
  },
  {
    type: 'financial',
    name: 'Financial Data',
    description: 'Stock prices, crypto',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-emerald-500'
  }
];

const SAMPLE_DATA_SOURCES: DataSource[] = [
  {
    id: 'api-1',
    name: 'Weather API',
    type: 'api',
    url: 'https://api.openweathermap.org/data/2.5/weather',
    config: { apiKey: 'demo-key', city: 'New York' },
    status: 'connected',
    lastUpdate: new Date().toISOString(),
    dataCount: 1250,
    icon: <Globe className="h-4 w-4" />,
    description: 'Real-time weather data'
  },
  {
    id: 'social-1',
    name: 'Twitter Feed',
    type: 'social',
    url: 'https://api.twitter.com/2/tweets/search/recent',
    config: { query: '#AI', count: 100 },
    status: 'connected',
    lastUpdate: new Date().toISOString(),
    dataCount: 3420,
    icon: <Users className="h-4 w-4" />,
    description: 'Social media sentiment analysis'
  },
  {
    id: 'financial-1',
    name: 'Stock Prices',
    type: 'financial',
    url: 'https://api.polygon.io/v2/aggs/ticker',
    config: { symbol: 'AAPL', timespan: 'minute' },
    status: 'connected',
    lastUpdate: new Date().toISOString(),
    dataCount: 890,
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Real-time stock market data'
  }
];

const SAMPLE_INSIGHTS: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'trend',
    title: 'Rising AI Sentiment',
    description: 'Positive sentiment around AI topics has increased by 23% in the last 24 hours',
    confidence: 0.87,
    impact: 'high',
    timestamp: new Date().toISOString(),
    data: { trend: 'up', percentage: 23, timeframe: '24h' },
    actionable: true
  },
  {
    id: 'insight-2',
    type: 'correlation',
    title: 'Weather-Stock Correlation',
    description: 'Stock prices show 0.73 correlation with weather patterns in tech companies',
    confidence: 0.73,
    impact: 'medium',
    timestamp: new Date().toISOString(),
    data: { correlation: 0.73, p_value: 0.02 },
    actionable: true
  },
  {
    id: 'insight-3',
    type: 'anomaly',
    title: 'Unusual Trading Volume',
    description: 'Trading volume spike detected at 2:30 PM - 340% above normal',
    confidence: 0.95,
    impact: 'high',
    timestamp: new Date().toISOString(),
    data: { volume: 340, normal: 100, time: '14:30' },
    actionable: true
  }
];

const RealtimeDataFusion: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(SAMPLE_DATA_SOURCES);
  const [insights, setInsights] = useState<AIInsight[]>(SAMPLE_INSIGHTS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDataSourceModal, setShowDataSourceModal] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('realtime-data-fusion'));
  const [dashboard] = useState<FusionDashboard>({
    id: 'main-dashboard',
    name: 'Real-time Data Fusion Dashboard',
    description: 'Live data insights and AI-powered analysis',
    dataSources: SAMPLE_DATA_SOURCES.map(ds => ds.id),
    widgets: [],
    refreshInterval: 5000,
    lastUpdate: new Date().toISOString()
  });
  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    name: '',
    type: 'api',
    url: '',
    config: {},
    description: ''
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const streamInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Starts real-time data streaming
   */
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    
    // Simulate real-time data updates
    streamInterval.current = setInterval(() => {
      // Update data sources with new data
      setDataSources(prev => prev.map(ds => ({
        ...ds,
        dataCount: ds.dataCount + Math.floor(Math.random() * 10),
        lastUpdate: new Date().toISOString()
      })));

      // Generate new insights occasionally
      if (Math.random() < 0.3) {
        const newInsight: AIInsight = {
          id: `insight-${Date.now()}`,
          type: ['trend', 'anomaly', 'correlation', 'prediction'][Math.floor(Math.random() * 4)] as any,
          title: 'New Data Pattern Detected',
          description: 'AI has identified a new pattern in the incoming data stream',
          confidence: Math.random() * 0.4 + 0.6,
          impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
          timestamp: new Date().toISOString(),
          data: { pattern: 'detected', strength: Math.random() },
          actionable: Math.random() > 0.5
        };
        
        setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
      }
    }, 2000);
  }, []);

  /**
   * Stops real-time data streaming
   */
  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
      streamInterval.current = null;
    }
  }, []);

  /**
   * Adds a new data source
   */
  const addDataSource = useCallback(() => {
    if (!newDataSource.name || !newDataSource.url) return;

    const sourceType = DATA_SOURCE_TYPES.find(t => t.type === newDataSource.type);
    const newSource: DataSource = {
      id: `source-${Date.now()}`,
      name: newDataSource.name,
      type: newDataSource.type as any,
      url: newDataSource.url,
      config: newDataSource.config || {},
      status: 'loading',
      lastUpdate: new Date().toISOString(),
      dataCount: 0,
      icon: sourceType?.icon || <Database className="h-4 w-4" />,
      description: newDataSource.description || ''
    };

    setDataSources(prev => [...prev, newSource]);
    setNewDataSource({ name: '', type: 'api', url: '', config: {}, description: '' });
    setShowDataSourceModal(false);

    // Simulate connection
    setTimeout(() => {
      setDataSources(prev => prev.map(ds => 
        ds.id === newSource.id ? { ...ds, status: 'connected' } : ds
      ));
    }, 2000);
  }, [newDataSource]);

  /**
   * Removes a data source
   */
  const removeDataSource = useCallback((sourceId: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== sourceId));
  }, []);

  /**
   * Generates AI insights from current data
   */
  const generateInsights = useCallback(async () => {
    try {
      const result = await aiToolsClient.makeRequest({
        tool: 'realtime-data-fusion',
        data: {
          action: 'generate_insights',
          dataSources: dataSources.map(ds => ({
            id: ds.id,
            name: ds.name,
            type: ds.type,
            dataCount: ds.dataCount,
            lastUpdate: ds.lastUpdate
          })),
          insights: insights.slice(0, 5)
        },
        config: apiConfig
      });

      if (result.success && result.data?.insights) {
        setInsights(prev => [...result.data.insights, ...prev]);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }, [dataSources, insights, apiConfig]);

  /**
   * Exports dashboard data
   */
  const exportDashboard = useCallback(() => {
    const exportData = {
      dashboard,
      dataSources,
      insights,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-fusion-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dashboard, dataSources, insights]);

  /**
   * Filters insights by type
   */
  const filteredInsights = insights.filter(insight => {
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesSearch = searchQuery === '' || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  /**
   * Gets status color for data source
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'loading': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Gets impact color for insights
   */
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    return () => {
      if (streamInterval.current) {
        clearInterval(streamInterval.current);
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Database className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Real-time Data Fusion Engine</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Combine multiple data sources with AI-powered insights and real-time analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDataSourceModal(true)}
                className="text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Source</span>
                <span className="sm:hidden">Add Source</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs sm:text-sm"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={isStreaming ? stopStreaming : startStreaming}
                  variant={isStreaming ? "destructive" : "default"}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {isStreaming ? (
                    <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ) : (
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{isStreaming ? 'Stop Streaming' : 'Start Streaming'}</span>
                  <span className="sm:hidden">{isStreaming ? 'Stop' : 'Start'}</span>
                </Button>
                <Button
                  onClick={generateInsights}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Generate Insights</span>
                  <span className="sm:hidden">Insights</span>
                </Button>
                <Button
                  onClick={exportDashboard}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{dataSources.length} sources</span>
                <span className="hidden sm:inline">•</span>
                <span>{insights.length} insights</span>
                <span className="hidden sm:inline">•</span>
                <span>{dataSources.reduce((sum, ds) => sum + ds.dataCount, 0)} data points</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isStreaming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                {isStreaming ? 'Live' : 'Paused'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Data Sources */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
              Data Sources
            </CardTitle>
            <CardDescription className="text-sm">Connected data sources and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            {dataSources.map(source => (
              <div
                key={source.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {source.icon}
                    <span className="font-medium text-xs sm:text-sm truncate">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(source.status)}`}>
                      {source.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDataSource(source.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1">{source.description}</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-1">
                  <span>{source.dataCount.toLocaleString()} records</span>
                  <span>{new Date(source.lastUpdate).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights
              </CardTitle>
              <div className="flex items-center gap-2 px-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="trend">Trends</option>
                  <option value="anomaly">Anomalies</option>
                  <option value="correlation">Correlations</option>
                  <option value="prediction">Predictions</option>
                </select>
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs border rounded px-2 py-1 w-32"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredInsights.map(insight => (
              <div
                key={insight.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {insight.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                    {insight.actionable && (
                      <Target className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                <div className="text-xs text-gray-500">
                  {new Date(insight.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>Real-time data analytics and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Flow Chart */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Data Flow</h4>
              <div className="space-y-2">
                {dataSources.slice(0, 3).map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-xs">{source.name}</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded">
                      <div 
                        className="h-full bg-blue-500 rounded animate-pulse"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{source.dataCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Data Points</div>
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {dataSources.reduce((sum, ds) => sum + ds.dataCount, 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">Active Sources</div>
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {dataSources.filter(ds => ds.status === 'connected').length}
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">AI Insights</div>
                <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  {insights.length}
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">High Impact</div>
                <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {insights.filter(i => i.impact === 'high').length}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Recent Activity</h4>
              <div className="space-y-2 text-xs">
                {insights.slice(0, 3).map(insight => (
                  <div key={insight.id} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span className="flex-1 truncate">{insight.title}</span>
                    <span className="text-gray-500">
                      {new Date(insight.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Data Source Modal */}
      {showDataSourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add Data Source</CardTitle>
              <CardDescription>Connect a new data source to your fusion engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Name</label>
                <input
                  type="text"
                  value={newDataSource.name || ''}
                  onChange={(e) => setNewDataSource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weather API"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <select
                  value={newDataSource.type || 'api'}
                  onChange={(e) => setNewDataSource(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  {DATA_SOURCE_TYPES.map(type => (
                    <option key={type.type} value={type.type}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL/Endpoint</label>
                <input
                  type="text"
                  value={newDataSource.url || ''}
                  onChange={(e) => setNewDataSource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/data"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newDataSource.description || ''}
                  onChange={(e) => setNewDataSource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this data source..."
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addDataSource} className="flex-1">
                  Add Source
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDataSourceModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card className="fixed top-4 right-4 w-80 z-40">
          <CardHeader>
            <CardTitle className="text-lg">AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Configuration</label>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="use-default-api-fusion"
                  name="api-config-fusion"
                  checked={!apiConfig.useCustomApi}
                  onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                  className="rounded"
                />
                <label htmlFor="use-default-api-fusion" className="text-sm">
                  Use Default API Key
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="use-custom-api-fusion"
                  name="api-config-fusion"
                  checked={apiConfig.useCustomApi}
                  onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                  className="rounded"
                />
                <label htmlFor="use-custom-api-fusion" className="text-sm">
                  Use Custom API Key
                </label>
              </div>
            </div>

            {apiConfig.useCustomApi && (
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <input
                  type="password"
                  value={apiConfig.apiKey || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key..."
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );                         
};

export default RealtimeDataFusion;
