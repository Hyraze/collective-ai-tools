/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Zap, 
  Download, 
  Copy, 
  Settings,
  Brain,
  Code,
  Lightbulb,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';
import ReactMarkdown from 'react-markdown';

interface ModelResponse {
  model: string;
  response: string;
  processingTime: number;
  cost: number;
  quality: number;
  strengths: string[];
  weaknesses: string[];
  timestamp: string;
}

interface ModelComparison {
  query: string;
  responses: ModelResponse[];
  bestModel: string;
  recommendation: string;
  analysis: string;
}

interface ModelCapability {
  model: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  cost: 'low' | 'medium' | 'high';
  speed: 'fast' | 'medium' | 'slow';
  context: number;
}

const AVAILABLE_MODELS: ModelCapability[] = [
  {
    model: 'GPT-4o',
    strengths: ['Code generation', 'Creative writing', 'General reasoning', 'Multimodal'],
    weaknesses: ['Cost', 'Rate limits'],
    bestFor: ['Programming', 'Creative tasks', 'Complex reasoning'],
    cost: 'high',
    speed: 'medium',
    context: 128000
  },
  {
    model: 'Claude-3.5-Sonnet',
    strengths: ['Analysis', 'Safety', 'Long context', 'Ethical reasoning'],
    weaknesses: ['Code execution', 'Real-time data'],
    bestFor: ['Research', 'Analysis', 'Long documents'],
    cost: 'high',
    speed: 'medium',
    context: 1000000
  },
  {
    model: 'Gemini-2.5-Flash',
    strengths: ['Speed', 'Cost-effective', 'Multimodal', 'Real-time data'],
    weaknesses: ['Complex reasoning', 'Code quality'],
    bestFor: ['Quick tasks', 'Image analysis', 'Real-time queries'],
    cost: 'low',
    speed: 'fast',
    context: 1000000
  },
  {
    model: 'DeepSeek-V3',
    strengths: ['Coding', 'Math', 'Reasoning', 'Cost-effective'],
    weaknesses: ['Creative writing', 'Multimodal'],
    bestFor: ['Programming', 'Mathematics', 'Technical analysis'],
    cost: 'low',
    speed: 'fast',
    context: 128000
  },
  {
    model: 'Grok-3',
    strengths: ['Real-time data', 'Humor', 'Current events', 'Unfiltered responses'],
    weaknesses: ['Accuracy', 'Safety filters'],
    bestFor: ['Current events', 'Entertainment', 'Unconventional queries'],
    cost: 'medium',
    speed: 'fast',
    context: 128000
  }
];

const MultiModelOrchestrator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4o', 'Claude-3.5-Sonnet']);
  const [comparison, setComparison] = useState<ModelComparison | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('multi-model-orchestrator'));
  const [autoSelect, setAutoSelect] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  /**
   * Intelligently selects the best models for a given query
   */
  const selectOptimalModels = useCallback((query: string): string[] => {
    const queryLower = query.toLowerCase();
    const selected: string[] = [];

    // Code-related queries
    if (queryLower.includes('code') || queryLower.includes('programming') || queryLower.includes('function') || queryLower.includes('bug')) {
      selected.push('GPT-4o', 'DeepSeek-V3');
    }
    
    // Analysis and research
    if (queryLower.includes('analyze') || queryLower.includes('research') || queryLower.includes('compare') || queryLower.includes('explain')) {
      selected.push('Claude-3.5-Sonnet', 'GPT-4o');
    }
    
    // Creative tasks
    if (queryLower.includes('write') || queryLower.includes('story') || queryLower.includes('creative') || queryLower.includes('poem')) {
      selected.push('GPT-4o', 'Claude-3.5-Sonnet');
    }
    
    // Current events and real-time data
    if (queryLower.includes('news') || queryLower.includes('current') || queryLower.includes('today') || queryLower.includes('recent')) {
      selected.push('Grok-3', 'Gemini-2.5-Flash');
    }
    
    // Quick and simple queries
    if (query.length < 100 && !selected.length) {
      selected.push('Gemini-2.5-Flash', 'DeepSeek-V3');
    }
    
    // Default selection if no specific patterns match
    if (!selected.length) {
      selected.push('GPT-4o', 'Claude-3.5-Sonnet');
    }

    return [...new Set(selected)]; // Remove duplicates
  }, []);

  /**
   * Generates responses from multiple models and compares them
   */
  const generateComparison = useCallback(async () => {
    if (!query.trim()) return;

    setIsGenerating(true);
    setComparison(null);

    try {
      const modelsToUse = autoSelect ? selectOptimalModels(query) : selectedModels;
      
      // Simulate API calls to different models (in real implementation, these would be actual API calls)
      const responses: ModelResponse[] = await Promise.all(
        modelsToUse.map(async (model) => {
          const startTime = Date.now();
          
          // Simulate different response times and qualities
          const responseTime = Math.random() * 2000 + 500;
          await new Promise(resolve => setTimeout(resolve, responseTime));
          
          const modelInfo = AVAILABLE_MODELS.find(m => m.model === model);
          const processingTime = Date.now() - startTime;
          
          // Generate a mock response based on model capabilities
          const mockResponse = generateMockResponse(model, query);
          
          return {
            model,
            response: mockResponse,
            processingTime,
            cost: calculateCost(model, mockResponse.length),
            quality: calculateQuality(model, query),
            strengths: modelInfo?.strengths || [],
            weaknesses: modelInfo?.weaknesses || [],
            timestamp: new Date().toISOString()
          };
        })
      );

      // Determine best model based on quality, speed, and cost
      const bestModel = responses.reduce((best, current) => {
        const bestScore = (best.quality * 0.5) + ((1000 / best.processingTime) * 0.3) + ((1 / best.cost) * 0.2);
        const currentScore = (current.quality * 0.5) + ((1000 / current.processingTime) * 0.3) + ((1 / current.cost) * 0.2);
        return currentScore > bestScore ? current : best;
      });

      const recommendation = generateRecommendation(bestModel, responses);
      const analysis = generateAnalysis(responses, query);

      setComparison({
        query,
        responses,
        bestModel: bestModel.model,
        recommendation,
        analysis
      });

    } catch (error) {
      console.error('Error generating comparison:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [query, selectedModels, autoSelect, selectOptimalModels]);

  /**
   * Generates mock responses for demonstration
   */
  const generateMockResponse = (model: string, query: string): string => {
    const responses = {
      'GPT-4o': `**GPT-4o Response:**\n\nI'll provide a comprehensive answer to your query: "${query}"\n\nThis is a detailed response that demonstrates GPT-4o's capabilities in reasoning, creativity, and code generation. The model excels at understanding context and providing nuanced answers.\n\n**Key Points:**\n- Strong reasoning capabilities\n- Excellent code generation\n- Good at creative tasks\n- Multimodal understanding`,
      
      'Claude-3.5-Sonnet': `**Claude-3.5-Sonnet Response:**\n\nRegarding your question about "${query}", I can provide a thorough analysis:\n\nClaude excels at deep analysis and maintaining context across long conversations. This response demonstrates the model's strength in:\n\n- Detailed analysis and reasoning\n- Safety-conscious responses\n- Long-context understanding\n- Ethical considerations\n\nThis makes it particularly suitable for research and analytical tasks.`,
      
      'Gemini-2.5-Flash': `**Gemini-2.5-Flash Response:**\n\nQuick response to "${query}":\n\nGemini 2.5 Flash provides fast, cost-effective responses with good quality. Key advantages:\n\n- Fast processing speed\n- Cost-effective for high-volume usage\n- Good multimodal capabilities\n- Real-time data access\n\nPerfect for quick queries and tasks requiring speed over depth.`,
      
      'DeepSeek-V3': `**DeepSeek-V3 Response:**\n\nTechnical analysis of "${query}":\n\nDeepSeek V3 specializes in:\n\n- Advanced coding and programming\n- Mathematical problem solving\n- Technical reasoning\n- Cost-effective performance\n\nThis model is particularly strong for technical tasks, coding challenges, and mathematical problems.`,
      
      'Grok-3': `**Grok-3 Response:**\n\nReal-time perspective on "${query}":\n\nGrok provides unfiltered, real-time insights with:\n\n- Access to current information\n- Unconventional perspectives\n- Humor and personality\n- Real-time data integration\n\nGreat for current events, entertainment, and getting alternative viewpoints.`
    };
    
    return responses[model as keyof typeof responses] || `Response from ${model} for: ${query}`;
  };

  /**
   * Calculates estimated cost for a response
   */
  const calculateCost = (model: string, responseLength: number): number => {
    const baseCosts = {
      'GPT-4o': 0.03,
      'Claude-3.5-Sonnet': 0.03,
      'Gemini-2.5-Flash': 0.001,
      'DeepSeek-V3': 0.001,
      'Grok-3': 0.01
    };
    
    return (baseCosts[model as keyof typeof baseCosts] || 0.01) * (responseLength / 1000);
  };

  /**
   * Calculates quality score for a model response
   */
  const calculateQuality = (model: string, query: string): number => {
    const queryLower = query.toLowerCase();
    let quality = 70; // Base quality
    
    // Boost quality based on model strengths
    if (queryLower.includes('code') && ['GPT-4o', 'DeepSeek-V3'].includes(model)) quality += 20;
    if (queryLower.includes('analyze') && model === 'Claude-3.5-Sonnet') quality += 20;
    if (queryLower.includes('news') && model === 'Grok-3') quality += 15;
    if (queryLower.includes('creative') && ['GPT-4o', 'Claude-3.5-Sonnet'].includes(model)) quality += 15;
    
    return Math.min(100, quality + Math.random() * 10);
  };

  /**
   * Generates recommendation based on comparison
   */
  const generateRecommendation = (bestModel: ModelResponse, allResponses: ModelResponse[]): string => {
    return `**Recommended Model: ${bestModel.model}**\n\nBased on the analysis, ${bestModel.model} performed best for this query due to:\n\n- **Quality Score:** ${bestModel.quality.toFixed(1)}/100\n- **Processing Time:** ${bestModel.processingTime}ms\n- **Cost:** $${bestModel.cost.toFixed(4)}\n- **Strengths:** ${bestModel.strengths.join(', ')}\n\nThis model is optimal for similar queries in the future.`;
  };

  /**
   * Generates detailed analysis of all responses
   */
  const generateAnalysis = (responses: ModelResponse[], query: string): string => {
    const avgQuality = responses.reduce((sum, r) => sum + r.quality, 0) / responses.length;
    const avgTime = responses.reduce((sum, r) => sum + r.processingTime, 0) / responses.length;
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    
    return `## Analysis Summary\n\n**Query Type:** ${classifyQuery(query)}\n**Models Compared:** ${responses.length}\n**Average Quality:** ${avgQuality.toFixed(1)}/100\n**Average Response Time:** ${avgTime.toFixed(0)}ms\n**Total Cost:** $${totalCost.toFixed(4)}\n\n### Performance Breakdown:\n\n${responses.map(r => 
      `- **${r.model}:** Quality ${r.quality.toFixed(1)}, Time ${r.processingTime}ms, Cost $${r.cost.toFixed(4)}`
    ).join('\n')}\n\n### Insights:\n- Fastest: ${responses.reduce((fastest, current) => current.processingTime < fastest.processingTime ? current : fastest).model}\n- Most Cost-Effective: ${responses.reduce((cheapest, current) => current.cost < cheapest.cost ? current : cheapest).model}\n- Highest Quality: ${responses.reduce((best, current) => current.quality > best.quality ? current : best).model}`;
  };

  /**
   * Classifies the type of query
   */
  const classifyQuery = (query: string): string => {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('code') || queryLower.includes('programming')) return 'Programming';
    if (queryLower.includes('analyze') || queryLower.includes('research')) return 'Analysis';
    if (queryLower.includes('write') || queryLower.includes('creative')) return 'Creative';
    if (queryLower.includes('news') || queryLower.includes('current')) return 'Current Events';
    return 'General';
  };

  /**
   * Downloads the comparison results
   */
  const downloadComparison = () => {
    if (!comparison) return;
    
    const data = {
      query: comparison.query,
      timestamp: new Date().toISOString(),
      bestModel: comparison.bestModel,
      responses: comparison.responses,
      analysis: comparison.analysis
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Copies the best response to clipboard
   */
  const copyBestResponse = () => {
    if (!comparison) return;
    const bestResponse = comparison.responses.find(r => r.model === comparison.bestModel);
    if (bestResponse) {
      navigator.clipboard.writeText(bestResponse.response);
    }
  };

  const toggleModel = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <div>
                <CardTitle className="text-2xl">Multi-Model AI Orchestrator</CardTitle>
                <CardDescription>
                  Intelligently route queries to the best AI models and compare responses in real-time
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Configuration</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-default-api-orchestrator"
                    name="api-config-orchestrator"
                    checked={!apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                    className="rounded"
                  />
                  <label htmlFor="use-default-api-orchestrator" className="text-sm">
                    Use Default API Key
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-custom-api-orchestrator"
                    name="api-config-orchestrator"
                    checked={apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                    className="rounded"
                  />
                  <label htmlFor="use-custom-api-orchestrator" className="text-sm">
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
                  <div className="text-xs text-gray-500">
                    Your API key is stored locally and never sent to our servers.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <select
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature: {apiConfig.temperature || 0.7}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={apiConfig.temperature || 0.7}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Query Configuration
            </CardTitle>
            <CardDescription>
              Enter your query and configure model selection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Query Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Query</label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question or describe any task. The orchestrator will intelligently select the best AI models for your specific query..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Auto Selection Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-select"
                  checked={autoSelect}
                  onChange={(e) => setAutoSelect(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="auto-select" className="text-sm font-medium">
                  Intelligent Model Selection
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Automatically select the best models based on query analysis
              </p>
            </div>

            {/* Manual Model Selection */}
            {!autoSelect && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Models to Compare</label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_MODELS.map(model => (
                    <div
                      key={model.model}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedModels.includes(model.model)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => toggleModel(model.model)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{model.model}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Best for: {model.bestFor.join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            model.cost === 'low' ? 'bg-green-100 text-green-800' :
                            model.cost === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {model.cost}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            model.speed === 'fast' ? 'bg-blue-100 text-blue-800' :
                            model.speed === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {model.speed}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateComparison}
              disabled={!query.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Comparing Models...' : 'Compare AI Models'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Model Comparison Results
              </CardTitle>
              {comparison && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyBestResponse}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadComparison}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Comparing AI models...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {!isGenerating && !comparison && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Sparkles className="h-12 w-12 mb-4" />
                <p>Model comparison results will appear here</p>
                <p className="text-sm mt-2">Enter your query and click "Compare AI Models"</p>
              </div>
            )}

            {comparison && (
              <div className="space-y-4">
                {/* Best Model Recommendation */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Recommended Model</h3>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{comparison.recommendation}</ReactMarkdown>
                  </div>
                </div>

                {/* Model Responses */}
                <div className="space-y-4">
                  {comparison.responses.map((response, index) => (
                    <div
                      key={response.model}
                      className={`p-4 rounded-lg border ${
                        response.model === comparison.bestModel
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{response.model}</h4>
                          {response.model === comparison.bestModel && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {response.quality.toFixed(1)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {response.processingTime}ms
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${response.cost.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert mb-3">
                        <ReactMarkdown>{response.response}</ReactMarkdown>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {response.strengths.map(strength => (
                          <span key={strength} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {strength}
                          </span>
                        ))}
                        {response.weaknesses.map(weakness => (
                          <span key={weakness} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis */}
                {showAnalysis && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Analysis
                    </h4>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{comparison.analysis}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiModelOrchestrator;
