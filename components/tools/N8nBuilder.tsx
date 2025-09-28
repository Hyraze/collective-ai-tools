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
  Zap, 
  Download, 
  Copy, 
  Upload,
  Loader2,
  Settings,
  Workflow,
  Code,
  Lightbulb
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';
import ReactMarkdown from 'react-markdown';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: string;
}

interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

interface N8nWorkflow {
  name: string;
  nodes: WorkflowNode[];
  connections: Record<string, WorkflowConnection[]>;
  active: boolean;
  settings: Record<string, any>;
  staticData: Record<string, any>;
  meta: {
    templateCredsSetupCompleted: boolean;
    instanceId: string;
  };
}

interface WorkflowRequest {
  description: string;
  complexity: 'simple' | 'intermediate' | 'advanced' | 'enterprise';
  integrations: string[];
  triggers: string[];
  features: string[];
  useCase: string;
}

const COMPLEXITY_LEVELS = [
  { value: 'simple', label: 'Simple', description: 'Basic workflows with 2-5 nodes' },
  { value: 'intermediate', label: 'Intermediate', description: 'Medium complexity with 5-15 nodes' },
  { value: 'advanced', label: 'Advanced', description: 'Complex workflows with 15-30 nodes' },
  { value: 'enterprise', label: 'Enterprise', description: 'Large-scale workflows with 30+ nodes' }
];

const COMMON_INTEGRATIONS = [
  'Google Sheets', 'Slack', 'Discord', 'Email', 'Webhook', 'HTTP Request',
  'Database', 'API', 'File System', 'Calendar', 'CRM', 'E-commerce',
  'Social Media', 'Analytics', 'Monitoring', 'Notifications', 'Storage',
  'AI/ML Services', 'Payment Processing', 'Document Processing'
];

const TRIGGER_TYPES = [
  'Manual', 'Schedule', 'Webhook', 'Email', 'File Upload', 'Database Change',
  'API Call', 'Form Submission', 'Social Media', 'Calendar Event', 'System Event'
];

const ADVANCED_FEATURES = [
  'Error Handling', 'Conditional Logic', 'Loops', 'Data Transformation',
  'Parallel Processing', 'Rate Limiting', 'Retry Logic', 'Caching',
  'Authentication', 'Data Validation', 'Logging', 'Monitoring',
  'Version Control', 'Testing', 'Documentation'
];

const N8nBuilder: React.FC = () => {
  const [workflowRequest, setWorkflowRequest] = useState<WorkflowRequest>({
    description: '',
    complexity: 'intermediate',
    integrations: [],
    triggers: ['Manual'],
    features: [],
    useCase: ''
  });
  const [generatedWorkflow, setGeneratedWorkflow] = useState<N8nWorkflow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('n8n-builder'));
  const [workflowExplanation, setWorkflowExplanation] = useState('');

  /**
   * Generates an n8n workflow based on the user's requirements
   */
  const generateWorkflow = useCallback(async () => {
    if (!workflowRequest.description.trim()) return;

    setIsGenerating(true);
    setGeneratedWorkflow(null);
    setWorkflowExplanation('');

    try {
      const result = await aiToolsClient.makeRequest({
        tool: 'n8n-builder',
        data: {
          request: workflowRequest
        },
        config: apiConfig
      });

      if (!result.success) {
        throw new Error(result.error || 'Workflow generation failed');
      }

      setGeneratedWorkflow(result.data?.workflow || null);
      setWorkflowExplanation(result.data?.explanation || '');
    } catch (error) {
      console.error('Error generating workflow:', error);
      setWorkflowExplanation(`Error: ${error instanceof Error ? error.message : 'Failed to generate workflow'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [workflowRequest, apiConfig]);

  /**
   * Downloads the generated workflow as JSON
   */
  const downloadWorkflow = () => {
    if (!generatedWorkflow) return;
    
    const blob = new Blob([JSON.stringify(generatedWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n-workflow-${generatedWorkflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Copies the workflow JSON to clipboard
   */
  const copyWorkflow = () => {
    if (!generatedWorkflow) return;
    navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2));
  };

  /**
   * Handles file upload for workflow import
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setGeneratedWorkflow(workflow);
          setWorkflowExplanation('Workflow imported successfully');
        } catch (error) {
          console.error('Error parsing workflow file:', error);
          setWorkflowExplanation('Error: Invalid workflow file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateRequest = (field: keyof WorkflowRequest, value: any) => {
    setWorkflowRequest(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'integrations' | 'triggers' | 'features', item: string) => {
    setWorkflowRequest(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">n8n Workflow Builder</CardTitle>
                <CardDescription>
                  Generate advanced n8n workflows with AI-powered automation and integrations
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
                    id="use-default-api-n8n"
                    name="api-config-n8n"
                    checked={!apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                    className="rounded"
                  />
                  <label htmlFor="use-default-api-n8n" className="text-sm">
                    Use Default API Key
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-custom-api-n8n"
                    name="api-config-n8n"
                    checked={apiConfig.useCustomApi}
                    onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                    className="rounded"
                  />
                  <label htmlFor="use-custom-api-n8n" className="text-sm">
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
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflow Configuration
            </CardTitle>
            <CardDescription>
              Describe your automation needs and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Description</label>
              <Textarea
                value={workflowRequest.description}
                onChange={(e) => updateRequest('description', e.target.value)}
                placeholder="Describe what you want your n8n workflow to do. Be specific about inputs, outputs, and business logic..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Use Case */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Use Case</label>
              <Textarea
                value={workflowRequest.useCase}
                onChange={(e) => updateRequest('useCase', e.target.value)}
                placeholder="Describe the business use case, industry, or specific problem this workflow solves..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Complexity Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity Level</label>
              <div className="grid grid-cols-2 gap-2">
                {COMPLEXITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => updateRequest('complexity', level.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      workflowRequest.complexity === level.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Types</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map(trigger => (
                  <button
                    key={trigger}
                    onClick={() => toggleArrayItem('triggers', trigger)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      workflowRequest.triggers.includes(trigger)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Integrations</label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {COMMON_INTEGRATIONS.map(integration => (
                  <button
                    key={integration}
                    onClick={() => toggleArrayItem('integrations', integration)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      workflowRequest.integrations.includes(integration)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {integration}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Advanced Features</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {ADVANCED_FEATURES.map(feature => (
                  <button
                    key={feature}
                    onClick={() => toggleArrayItem('features', feature)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      workflowRequest.features.includes(feature)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateWorkflow}
              disabled={!workflowRequest.description.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating Workflow...' : 'Generate n8n Workflow'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Workflow */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generated Workflow
              </CardTitle>
              {generatedWorkflow && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyWorkflow}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadWorkflow}>
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
                <p>Generating your n8n workflow...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {!isGenerating && !generatedWorkflow && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Workflow className="h-12 w-12 mb-4" />
                <p>Your generated n8n workflow will appear here</p>
                <p className="text-sm mt-2">Configure your requirements and click "Generate Workflow"</p>
              </div>
            )}

            {generatedWorkflow && (
              <div className="space-y-4">
                {/* Workflow Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{generatedWorkflow.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nodes:</span>
                      <span className="ml-2 font-medium">{generatedWorkflow.nodes.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 font-medium ${generatedWorkflow.active ? 'text-green-600' : 'text-gray-600'}`}>
                        {generatedWorkflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow JSON */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(generatedWorkflow, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Workflow Explanation */}
            {workflowExplanation && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Workflow Explanation
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
                    {workflowExplanation}
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
            Import Existing Workflow
          </CardTitle>
          <CardDescription>
            Upload an existing n8n workflow JSON file to analyze or modify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="workflow-upload"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="workflow-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </label>
            <span className="text-sm text-gray-500">
              Upload a .json file containing an n8n workflow
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nBuilder;
