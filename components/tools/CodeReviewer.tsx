/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Code, 
  Bug, 
  Zap, 
  Shield, 
  Star, 
  Copy, 
  Download, 
  Upload,
  Loader2,
  Info,
  Eye,
  EyeOff,
  Settings,
  FileCode,
  Cpu,
  Lightbulb
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';
import ReactMarkdown from 'react-markdown';

interface CodeAnalysis {
  id: string;
  type: 'security' | 'performance' | 'best-practice' | 'bug' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  message: string;
  suggestion: string;
  code?: string;
}

interface ReviewSettings {
  language: string;
  focusAreas: string[];
  strictness: 'lenient' | 'moderate' | 'strict';
  includeSuggestions: boolean;
  maxSuggestions: number;
}

const DEFAULT_SETTINGS: ReviewSettings = {
  language: 'javascript',
  focusAreas: ['security', 'performance', 'best-practice'],
  strictness: 'moderate',
  includeSuggestions: true,
  maxSuggestions: 10
};

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🦉' },
  { value: 'kotlin', label: 'Kotlin', icon: '🟣' }
];

const FOCUS_AREAS = [
  { value: 'security', label: 'Security Vulnerabilities', icon: Shield, color: 'text-red-600' },
  { value: 'performance', label: 'Performance Issues', icon: Zap, color: 'text-yellow-600' },
  { value: 'best-practice', label: 'Best Practices', icon: Star, color: 'text-blue-600' },
  { value: 'bug', label: 'Potential Bugs', icon: Bug, color: 'text-orange-600' },
  { value: 'optimization', label: 'Code Optimization', icon: Cpu, color: 'text-green-600' }
];

/**
 * AI Code Review & Optimization Assistant
 * Specialized tool for developers to improve code quality, security, and performance
 */
const CodeReviewer: React.FC = () => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<CodeAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<ReviewSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [reviewHistory, setReviewHistory] = useState<Array<{code: string, analysis: CodeAnalysis[], timestamp: Date}>>([]);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('code-reviewer'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('code-reviewer-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load code reviewer settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('code-reviewer-settings', JSON.stringify(settings));
  }, [settings]);

  /**
   * Analyzes code for issues and optimization opportunities
   */
  const analyzeCode = useCallback(async () => {
    if (!code.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis([]);

    try {
      const result = await aiToolsClient.reviewCode(code.trim(), {
        language: settings.language,
        reviewType: {
          security: settings.focusAreas.includes('security'),
          performance: settings.focusAreas.includes('performance'),
          bestPractices: settings.focusAreas.includes('best-practice'),
          bugDetection: settings.focusAreas.includes('bug')
        }
      }, apiConfig);

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.data?.results || []);
      
      // Add to history
      setReviewHistory(prev => [{
        code: code.trim(),
        analysis: result.data?.results || [],
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 reviews

    } catch (error) {
      console.error('Error analyzing code:', error);
      setAnalysis([{
        id: 'error',
        type: 'bug',
        severity: 'high',
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Please check your code and try again.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, settings, isAnalyzing]);

  /**
   * Handles file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  /**
   * Copies code to clipboard
   */
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  /**
   * Downloads analysis report
   */
  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      language: settings.language,
      code: code,
      analysis: analysis,
      settings: settings
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Updates a setting value
   */
  const updateSetting = <K extends keyof ReviewSettings>(key: K, value: ReviewSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Toggles a focus area
   */
  const toggleFocusArea = (area: string) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  /**
   * Gets severity color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  /**
   * Gets type icon
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'best-practice': return <Star className="h-4 w-4" />;
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'optimization': return <Cpu className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const analysisStats = {
    total: analysis.length,
    critical: analysis.filter(a => a.severity === 'critical').length,
    high: analysis.filter(a => a.severity === 'high').length,
    medium: analysis.filter(a => a.severity === 'medium').length,
    low: analysis.filter(a => a.severity === 'low').length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Code Reviewer</CardTitle>
                <CardDescription>
                  Analyze your code for security, performance, and best practices
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.ts,.py,.java,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Programming Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Strictness</label>
                <select
                  value={settings.strictness}
                  onChange={(e) => updateSetting('strictness', e.target.value as any)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="lenient">Lenient - Basic checks only</option>
                  <option value="moderate">Moderate - Balanced analysis</option>
                  <option value="strict">Strict - Comprehensive review</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Focus Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FOCUS_AREAS.map(area => {
                  const Icon = area.icon;
                  const isSelected = settings.focusAreas.includes(area.value);
                  return (
                    <button
                      key={area.value}
                      onClick={() => toggleFocusArea(area.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : area.color}`} />
                      <span className="text-sm font-medium">{area.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-suggestions"
                  checked={settings.includeSuggestions}
                  onChange={(e) => updateSetting('includeSuggestions', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="include-suggestions" className="text-sm">
                  Include optimization suggestions
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max Suggestions: {settings.maxSuggestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={settings.maxSuggestions}
                  onChange={(e) => updateSetting('maxSuggestions', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* API Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
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
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature: {apiConfig.temperature || 0.1}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={apiConfig.temperature || 0.1}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-custom-api"
                    checked={apiConfig.useCustomApi || false}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, useCustomApi: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="use-custom-api" className="text-sm">
                    Use custom API key
                  </label>
                </div>
                {apiConfig.useCustomApi && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      type="password"
                      value={apiConfig.apiKey || ''}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your API key"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500">
                      Your API key is stored locally and never shared.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code Input</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCode}
                  disabled={!code}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Paste your ${settings.language} code here...`}
              className="flex-1 font-mono text-sm resize-none"
              style={{ display: showCode ? 'block' : 'none' }}
            />
            {!showCode && (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <FileCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Code hidden</p>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {code.length} characters, {code.split('\n').length} lines
              </span>
              <Button
                onClick={analyzeCode}
                disabled={!code.trim() || isAnalyzing}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Analyze Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Analysis Results</CardTitle>
              {analysis.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {analysis.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ready to analyze
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paste your code and click "Analyze Code" to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">{analysisStats.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="text-lg font-bold text-red-600">{analysisStats.critical}</div>
                    <div className="text-xs text-gray-500">Critical</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <div className="text-lg font-bold text-orange-600">{analysisStats.high}</div>
                    <div className="text-xs text-gray-500">High</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="text-lg font-bold text-yellow-600">{analysisStats.medium}</div>
                    <div className="text-xs text-gray-500">Medium</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-lg font-bold text-blue-600">{analysisStats.low}</div>
                    <div className="text-xs text-gray-500">Low</div>
                  </div>
                </div>

                {/* Analysis Items */}
                {analysis.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                      item.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                      item.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                      'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded ${getSeverityColor(item.severity)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium capitalize">
                            {item.severity} {item.type.replace('-', ' ')}
                          </span>
                          {item.line && (
                            <span className="text-xs text-gray-500">Line {item.line}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                              p: ({children}) => <p className="mb-2">{children}</p>,
                              code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{children}</code>,
                              pre: ({children}) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-xs mb-2">{children}</pre>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                              em: ({children}) => <em className="italic">{children}</em>
                            }}
                          >
                            {item.message}
                          </ReactMarkdown>
                        </div>
                        {item.suggestion && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                            <div className="flex items-center gap-2 mb-1">
                              <Lightbulb className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium">Suggestion:</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                  p: ({children}) => <p className="mb-2">{children}</p>,
                                  code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{children}</code>,
                                  pre: ({children}) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-xs mb-2">{children}</pre>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                  li: ({children}) => <li className="mb-1">{children}</li>,
                                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                  em: ({children}) => <em className="italic">{children}</em>
                                }}
                              >
                                {item.suggestion}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {item.code && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
                            <pre>{item.code}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review History */}
      {reviewHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewHistory.slice(0, 5).map((review, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {review.code.substring(0, 50)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.analysis.length} issues found
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {review.timestamp.toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCode(review.code);
                        setAnalysis(review.analysis);
                      }}
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeReviewer;
