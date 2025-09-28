/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Brain, 
  Download, 
  Copy, 
  Upload,
  Loader2,
  Settings,
  Bot,
  Code,
  RefreshCw,
  Lightbulb,
  GitBranch,
  Layers,
  Network
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';
import ReactMarkdown from 'react-markdown';

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'tool_usage' | 'memory' | 'communication' | 'learning';
  complexity: 'basic' | 'intermediate' | 'advanced';
}

interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: string;
}

interface MCPAgent {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  tools: AgentTool[];
  reasoning_engine: {
    type: 'chain_of_thought' | 'tree_of_thought' | 'reflection' | 'multi_agent';
    parameters: Record<string, any>;
  };
  memory_system: {
    type: 'episodic' | 'semantic' | 'working' | 'hybrid';
    capacity: number;
    persistence: boolean;
  };
  communication_protocol: {
    type: 'mcp' | 'openai_functions' | 'anthropic_tools' | 'custom';
    version: string;
    schema: Record<string, any>;
  };
  prompt_template: string;
  system_instructions: string;
  examples: Array<{
    input: string;
    output: string;
    reasoning: string;
  }>;
  configuration: {
    temperature: number;
    max_tokens: number;
    model: string;
    safety_settings: Record<string, any>;
  };
}

interface AgentRequest {
  name: string;
  description: string;
  primary_goal: string;
  domain: string;
  capabilities: string[];
  tools_needed: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  reasoning_type: 'chain_of_thought' | 'tree_of_thought' | 'reflection' | 'multi_agent';
  memory_requirements: string[];
  communication_needs: string[];
  examples: string[];
  constraints: string[];
}

const DOMAINS = [
  'Software Development', 'Data Analysis', 'Content Creation', 'Customer Support',
  'Research', 'Education', 'Business Automation', 'Creative Writing',
  'Code Review', 'System Administration', 'Marketing', 'Sales',
  'Healthcare', 'Finance', 'Legal', 'Design', 'Gaming', 'IoT'
];


const REASONING_TYPES = [
  { 
    value: 'chain_of_thought', 
    label: 'Chain of Thought', 
    description: 'Step-by-step logical reasoning',
    icon: GitBranch
  },
  { 
    value: 'tree_of_thought', 
    label: 'Tree of Thought', 
    description: 'Explore multiple reasoning paths',
    icon: Network
  },
  { 
    value: 'reflection', 
    label: 'Reflection', 
    description: 'Self-critique and improvement',
    icon: RefreshCw
  },
  { 
    value: 'multi_agent', 
    label: 'Multi-Agent', 
    description: 'Collaborative reasoning with multiple agents',
    icon: Layers
  }
];

const COMMON_TOOLS = [
  'Web Search', 'File System', 'Database Query', 'API Calls', 'Code Execution',
  'Image Generation', 'Text Processing', 'Data Analysis', 'Email', 'Calendar',
  'Document Processing', 'Translation', 'Summarization', 'Code Review',
  'Testing', 'Deployment', 'Monitoring', 'Logging', 'Authentication'
];

const MEMORY_TYPES = [
  'Episodic Memory', 'Semantic Memory', 'Working Memory', 'Long-term Storage',
  'Context Awareness', 'User Preferences', 'Task History', 'Learning Patterns'
];

const COMMUNICATION_NEEDS = [
  'Natural Language', 'Structured Data', 'API Integration', 'Real-time Chat',
  'Batch Processing', 'Event-driven', 'Multi-modal', 'Voice Interface',
  'Visual Interface', 'Command Line', 'Web Interface', 'Mobile Interface'
];

const AgentBuilder: React.FC = () => {
  const [agentRequest, setAgentRequest] = useState<AgentRequest>({
    name: '',
    description: '',
    primary_goal: '',
    domain: '',
    capabilities: [],
    tools_needed: [],
    complexity: 'intermediate',
    reasoning_type: 'chain_of_thought',
    memory_requirements: [],
    communication_needs: [],
    examples: [],
    constraints: []
  });
  const [generatedAgent, setGeneratedAgent] = useState<MCPAgent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('agent-builder'));
  const [agentExplanation, setAgentExplanation] = useState('');

  /**
   * Generates an MCP Agent based on the user's requirements
   */
  const generateAgent = useCallback(async () => {
    if (!agentRequest.name.trim() || !agentRequest.description.trim()) return;

    setIsGenerating(true);
    setGeneratedAgent(null);
    setAgentExplanation('');

    try {
      const result = await aiToolsClient.makeRequest({
        tool: 'agent-builder',
        data: {
          request: agentRequest
        },
        config: apiConfig
      });

      if (!result.success) {
        throw new Error(result.error || 'Agent generation failed');
      }

      setGeneratedAgent(result.data?.agent || null);
      setAgentExplanation(result.data?.explanation || '');
    } catch (error) {
      console.error('Error generating agent:', error);
      setAgentExplanation(`Error: ${error instanceof Error ? error.message : 'Failed to generate agent'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [agentRequest, apiConfig]);

  /**
   * Downloads the generated agent as JSON
   */
  const downloadAgent = () => {
    if (!generatedAgent) return;
    
    const blob = new Blob([JSON.stringify(generatedAgent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-agent-${generatedAgent.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Copies the agent JSON to clipboard
   */
  const copyAgent = () => {
    if (!generatedAgent) return;
    navigator.clipboard.writeText(JSON.stringify(generatedAgent, null, 2));
  };

  /**
   * Handles file upload for agent import
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const agent = JSON.parse(e.target?.result as string);
          setGeneratedAgent(agent);
          setAgentExplanation('Agent imported successfully');
        } catch (error) {
          console.error('Error parsing agent file:', error);
          setAgentExplanation('Error: Invalid agent file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateRequest = (field: keyof AgentRequest, value: any) => {
    setAgentRequest(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof AgentRequest, item: string) => {
    if (Array.isArray(agentRequest[field])) {
      setAgentRequest(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).includes(item)
          ? (prev[field] as string[]).filter(i => i !== item)
          : [...(prev[field] as string[]), item]
      }));
    }
  };

  const addExample = () => {
    setAgentRequest(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const updateExample = (index: number, value: string) => {
    setAgentRequest(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }));
  };

  const removeExample = (index: number) => {
    setAgentRequest(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">Agent Builder MCP</CardTitle>
                <CardDescription>
                  Create sophisticated AI agents with Model Context Protocol (MCP) for advanced reasoning and tool usage
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
                    id="use-default-api-agent"
                    name="api-config-agent"
                    checked={!apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                    className="rounded"
                  />
                  <label htmlFor="use-default-api-agent" className="text-sm">
                    Use Default API Key
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-custom-api-agent"
                    name="api-config-agent"
                    checked={apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                    className="rounded"
                  />
                  <label htmlFor="use-custom-api-agent" className="text-sm">
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
        {/* Agent Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Configuration
            </CardTitle>
            <CardDescription>
              Define your AI agent's capabilities and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Name</label>
                <input
                  type="text"
                  value={agentRequest.name}
                  onChange={(e) => updateRequest('name', e.target.value)}
                  placeholder="e.g., Code Review Assistant"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={agentRequest.description}
                  onChange={(e) => updateRequest('description', e.target.value)}
                  placeholder="Describe what this agent does and its main purpose..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Goal</label>
                <Textarea
                  value={agentRequest.primary_goal}
                  onChange={(e) => updateRequest('primary_goal', e.target.value)}
                  placeholder="What is the main objective this agent should achieve?"
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain/Industry</label>
              <select
                value={agentRequest.domain}
                onChange={(e) => updateRequest('domain', e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select a domain</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* Complexity Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['basic', 'intermediate', 'advanced', 'expert'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateRequest('complexity', level)}
                    className={`p-3 rounded-lg border text-left transition-colors capitalize ${
                      agentRequest.complexity === level
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{level}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reasoning Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reasoning Engine</label>
              <div className="grid grid-cols-1 gap-2">
                {REASONING_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => updateRequest('reasoning_type', type.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        agentRequest.reasoning_type === type.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tools Needed */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Tools</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {COMMON_TOOLS.map(tool => (
                  <button
                    key={tool}
                    onClick={() => toggleArrayItem('tools_needed', tool)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      agentRequest.tools_needed.includes(tool)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Memory Requirements */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Memory Requirements</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {MEMORY_TYPES.map(memory => (
                  <button
                    key={memory}
                    onClick={() => toggleArrayItem('memory_requirements', memory)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      agentRequest.memory_requirements.includes(memory)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {memory}
                  </button>
                ))}
              </div>
            </div>

            {/* Communication Needs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication Needs</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {COMMUNICATION_NEEDS.map(comm => (
                  <button
                    key={comm}
                    onClick={() => toggleArrayItem('communication_needs', comm)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      agentRequest.communication_needs.includes(comm)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {comm}
                  </button>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Example Interactions</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExample}
                >
                  Add Example
                </Button>
              </div>
              {agentRequest.examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={example}
                    onChange={(e) => updateExample(index, e.target.value)}
                    placeholder="Describe an example interaction or use case..."
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExample(index)}
                    className="self-start"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateAgent}
              disabled={!agentRequest.name.trim() || !agentRequest.description.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating Agent...' : 'Generate MCP Agent'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Agent */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generated MCP Agent
              </CardTitle>
              {generatedAgent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAgent}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAgent}>
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
                <p>Generating your MCP Agent...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {!isGenerating && !generatedAgent && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Brain className="h-12 w-12 mb-4" />
                <p>Your generated MCP Agent will appear here</p>
                <p className="text-sm mt-2">Configure your requirements and click "Generate MCP Agent"</p>
              </div>
            )}

            {generatedAgent && (
              <div className="space-y-4">
                {/* Agent Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{generatedAgent.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{generatedAgent.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Capabilities:</span>
                      <span className="ml-2 font-medium">{generatedAgent.capabilities.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tools:</span>
                      <span className="ml-2 font-medium">{generatedAgent.tools.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reasoning:</span>
                      <span className="ml-2 font-medium capitalize">{generatedAgent.reasoning_engine.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Memory:</span>
                      <span className="ml-2 font-medium capitalize">{generatedAgent.memory_system.type}</span>
                    </div>
                  </div>
                </div>

                {/* Agent JSON */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(generatedAgent, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Agent Explanation */}
            {agentExplanation && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Agent Explanation
                </h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
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
                    {agentExplanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Existing Agent
          </CardTitle>
          <CardDescription>
            Upload an existing MCP Agent JSON file to analyze or modify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="agent-upload"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="agent-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </label>
            <span className="text-sm text-gray-500">
              Upload a .json file containing an MCP Agent configuration
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentBuilder;
