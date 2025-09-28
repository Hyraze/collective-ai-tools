/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Copy, Download, RotateCcw, FileText, Sparkles, Loader2, Settings } from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';

interface SummaryOptions {
  maxLength: number;
  preserveNumbers: boolean;
  preserveNames: boolean;
  style: 'bullet' | 'paragraph' | 'numbered';
  useAI: boolean;
}

const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('text-summarizer'));
  const [options, setOptions] = useState<SummaryOptions>({
    maxLength: 200,
    preserveNumbers: true,
    preserveNames: true,
    style: 'bullet',
    useAI: true
  });

  /**
   * Simple text summarization algorithm that extracts key sentences
   * @param text - The input text to summarize
   * @param opts - Configuration options for summarization
   * @returns The summarized text
   */
  const summarizeText = useCallback((text: string, opts: SummaryOptions): string => {
    if (!text.trim()) return '';

    // Clean and split text into sentences
    const sentences = text
      .replace(/\s+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    if (sentences.length <= 3) {
      return text; // Return original if too short
    }

    // Score sentences based on word frequency and position
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const scoredSentences = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      
      // Word frequency score
      sentenceWords.forEach(word => {
        if (wordFreq[word]) {
          score += wordFreq[word];
        }
      });
      
      // Position bonus (first and last sentences are important)
      if (index === 0 || index === sentences.length - 1) {
        score *= 1.5;
      }
      
      // Length penalty for very long sentences
      if (sentence.length > 150) {
        score *= 0.8;
      }
      
      return { sentence, score, index };
    });

    // Sort by score and select top sentences
    const numSentences = Math.max(2, Math.min(5, Math.ceil(sentences.length * 0.3)));
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index); // Maintain original order

    let result = topSentences.map(item => item.sentence).join('. ');

    // Apply style formatting
    switch (opts.style) {
      case 'bullet':
        result = topSentences.map(item => `• ${item.sentence}`).join('\n');
        break;
      case 'numbered':
        result = topSentences.map((item, i) => `${i + 1}. ${item.sentence}`).join('\n');
        break;
      case 'paragraph':
        result = topSentences.map(item => item.sentence).join('. ') + '.';
        break;
    }

    // Truncate if too long
    if (result.length > opts.maxLength) {
      result = result.substring(0, opts.maxLength).trim();
      if (opts.style === 'paragraph') {
        const lastPeriod = result.lastIndexOf('.');
        if (lastPeriod > opts.maxLength * 0.7) {
          result = result.substring(0, lastPeriod + 1);
        }
      }
    }

    return result;
  }, []);

  /**
   * Handles the text summarization process with loading state
   */
  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    try {
      if (options.useAI) {
        // Use AI API for summarization
        const result = await aiToolsClient.summarize(inputText.trim(), {
          maxLength: options.maxLength,
          preserveNumbers: options.preserveNumbers,
          preserveNames: options.preserveNames,
          style: options.style
        }, apiConfig);

        if (!result.success) {
          throw new Error(result.error || 'Summarization failed');
        }

        setSummary(result.data?.summary || 'Failed to generate summary');
      } else {
        // Use local algorithm
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = summarizeText(inputText, options);
        setSummary(result);
      }
    } catch (error) {
      console.error('Error summarizing text:', error);
      setSummary(`Error: ${error instanceof Error ? error.message : 'Failed to summarize text'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Copies the summary text to clipboard
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };

  /**
   * Downloads the summary as a text file
   */
  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Resets the form to its initial state
   */
  const handleReset = () => {
    setInputText('');
    setSummary('');
  };

  const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = inputText.length;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>
                Paste or type the text you want to summarize. The tool will extract the most important information.
              </CardDescription>
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
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[200px] resize-none"
              disabled={isProcessing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
              {wordCount} words, {charCount} characters
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Summarize'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summarization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Summarization Method</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-ai"
                    name="method"
                    checked={options.useAI}
                    onChange={() => setOptions(prev => ({ ...prev, useAI: true }))}
                    className="rounded"
                  />
                  <label htmlFor="use-ai" className="text-sm">
                    AI-Powered (Recommended)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-local"
                    name="method"
                    checked={!options.useAI}
                    onChange={() => setOptions(prev => ({ ...prev, useAI: false }))}
                    className="rounded"
                  />
                  <label htmlFor="use-local" className="text-sm">
                    Local Algorithm
                  </label>
                </div>
              </div>


              <div className="space-y-2">
                <label className="text-sm font-medium">Summary Length</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={options.maxLength}
                  onChange={(e) => setOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Short ({options.maxLength} words)</span>
                  <span>Long</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Summary Style</label>
                <select
                  value={options.style}
                  onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as any }))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="bullet">Bullet Points</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="numbered">Numbered List</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preserve-numbers"
                  checked={options.preserveNumbers}
                  onChange={(e) => setOptions(prev => ({ ...prev, preserveNumbers: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="preserve-numbers" className="text-sm">
                  Preserve numbers and statistics
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preserve-names"
                  checked={options.preserveNames}
                  onChange={(e) => setOptions(prev => ({ ...prev, preserveNames: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="preserve-names" className="text-sm">
                  Preserve proper names
                </label>
              </div>
            </div>

            {options.useAI && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Configuration</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="use-default-api"
                      name="api-config"
                      checked={!apiConfig.useCustomApi}
                      onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                      className="rounded"
                    />
                    <label htmlFor="use-default-api" className="text-sm">
                      Use Default API Key
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="use-custom-api"
                      name="api-config"
                      checked={apiConfig.useCustomApi}
                      onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                      className="rounded"
                    />
                    <label htmlFor="use-custom-api" className="text-sm">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <select
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature: {apiConfig.temperature || 0.3}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={apiConfig.temperature || 0.3}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Options Section */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Options</CardTitle>
          <CardDescription>
            Customize how your summary is generated and formatted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Length: {options.maxLength} characters
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={options.maxLength}
                onChange={(e) => setOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                className="w-full"
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Output Style</label>
              <select
                value={options.style}
                onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                disabled={isProcessing}
              >
                <option value="bullet">Bullet Points</option>
                <option value="numbered">Numbered List</option>
                <option value="paragraph">Paragraph</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.preserveNumbers}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveNumbers: e.target.checked }))}
                disabled={isProcessing}
              />
              <span className="text-sm">Preserve numbers and dates</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.preserveNames}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveNames: e.target.checked }))}
                disabled={isProcessing}
              />
              <span className="text-sm">Preserve proper names</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Summary
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <CardDescription>
              {summary.length} characters • {summary.split('\n').length} lines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                {summary}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Input Tips:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use well-structured text with clear sentences</li>
                <li>• Include important context and background</li>
                <li>• Avoid very short texts (less than 3 sentences)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Output Tips:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Adjust length based on your needs</li>
                <li>• Use bullet points for key takeaways</li>
                <li>• Review and edit the summary if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextSummarizer;
