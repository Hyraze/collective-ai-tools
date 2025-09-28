/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sparkles, Zap, Brain } from 'lucide-react';
import N8nBuilder from './tools/N8nBuilder';
import AgentBuilder from './tools/AgentBuilder';
import ErrorBoundary from './ErrorBoundary';
import SEO from './SEO';
import { generateToolStructuredData, generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '../lib/seoUtils';

interface BuiltInTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  tags: string[];
}

const builtInTools: BuiltInTool[] = [
  {
    id: 'n8n-builder',
    name: 'n8n Workflow Builder',
    description: 'Generate advanced n8n workflows with AI-powered automation, integrations, and complex logic flows',
    icon: <Zap className="h-6 w-6" />,
    component: N8nBuilder,
    tags: ['AI', 'Automation', 'Workflows', 'Integration', 'n8n']
  },
  {
    id: 'agent-builder',
    name: 'Agent Builder MCP',
    description: 'Create sophisticated AI agents with Model Context Protocol (MCP) for advanced reasoning and tool usage',
    icon: <Brain className="h-6 w-6" />,
    component: AgentBuilder,
    tags: ['AI', 'Agents', 'MCP', 'Reasoning', 'Tools']
  }
];

const BuiltInTools: React.FC = () => {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();
  
  // Determine selected tool from URL
  const selectedTool = toolId || null;

  const handleBackToList = () => {
    navigate('/built-in-tools');
  };

  if (selectedTool) {
    const tool = builtInTools.find(t => t.id === selectedTool);
    if (tool) {
      const ToolComponent = tool.component;
      const toolStructuredData = generateToolStructuredData(tool);
      const breadcrumbData = generateBreadcrumbStructuredData(['AI Workspace', tool.name]);
      
      return (
        <>
          <SEO
            title={`${tool.name} - AI Workspace | Collective AI Tools`}
            description={tool.description}
            keywords={`${tool.name}, ${tool.tags.join(', ')}, AI tool, automation, productivity`}
            url={`https://collectiveai.tools/built-in-tools/${tool.id}`}
            type="article"
            structuredData={[toolStructuredData, breadcrumbData]}
          />
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← Back to AI Workspace
            </Button>
            <div className="flex items-center gap-3 mb-4">
              {tool.icon}
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {tool.name}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {tool.description}
            </p>
          </div>
          <ErrorBoundary
            fallback={
              <Card className="p-6 text-center">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">
                    Tool Error
                  </CardTitle>
                  <CardDescription>
                    This tool encountered an error. Please try again or go back to the tools list.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleBackToList} variant="outline">
                    Back to Tools
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <ToolComponent />
          </ErrorBoundary>
        </div>
        </>
      );
    }
  }

  return (
    <>
      <SEO
        title="AI Workspace - Built-in AI Tools | Collective AI Tools"
        description="Powerful AI tools built right into this platform. Generate n8n workflows, create AI agents with MCP, and more. No external services required - everything runs locally in your browser."
        keywords="AI workspace, built-in AI tools, n8n workflow builder, agent builder MCP, AI automation, local AI tools"
        url="https://collectiveai.tools/built-in-tools"
        type="website"
        structuredData={[generateWebsiteStructuredData(), generateBreadcrumbStructuredData(['AI Workspace'])]}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pt-24">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Workspace
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Powerful AI tools built right into this platform. No external services required - everything runs locally in your browser.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {builtInTools.map((tool) => (
          <Link 
            key={tool.id} 
            to={`/built-in-tools/${tool.id}`}
            className="block"
          >
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </CardTitle>
                  </div>
                </div>
                <Zap className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {tool.description}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          More Tools Coming Soon
        </h3>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ by 
            <a 
              href="https://github.com/Hyraze/collective-ai-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
            >
              Collective AI Tools Community
            </a>
          </p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default BuiltInTools;
