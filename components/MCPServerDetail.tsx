/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Code, 
  Globe, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  FileText,
  Zap,
  Settings,
  Heart,
  GitBranch,
  Copy,
  MessageSquare,
  Plus
} from 'lucide-react';
import SEO from './SEO';
import { generateToolStructuredData, generateBreadcrumbStructuredData } from '../lib/seoUtils';
import { mcpServers } from '../lib/mcpData';


const MCPServerDetail: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  
  const server = mcpServers.find(s => s.id === serverId);

  if (!server) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pt-24">
        <div className="text-center py-20">
          <div className="text-8xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Server Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The MCP server you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/mcp-catalog')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to MCP Catalog
          </Button>
        </div>
      </div>
    );
  }

  const toolStructuredData = generateToolStructuredData({
    id: server.id,
    name: server.name,
    description: server.description,
    tags: server.tags || [],
    icon: <Code className="h-6 w-6" />
  });
  const breadcrumbData = generateBreadcrumbStructuredData(['MCP Catalog', server.name]);

  return (
    <>
      <SEO
        title={`${server.name} - MCP Server | Collective AI Tools`}
        description={server.description}
        keywords={`${server.name}, ${server.tags.join(', ')}, MCP server, Model Context Protocol, AI tool`}
        url={`https://collectiveai.tools/mcp-catalog/${server.id}`}
        type="article"
        structuredData={[toolStructuredData, breadcrumbData]}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pt-24">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/mcp-catalog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to MCP Catalog
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl text-blue-600 dark:text-blue-400 shadow-lg">
                <Code className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {server.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {server.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.open(server.githubUrl, '_blank')}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
              >
                <GitBranch className="h-4 w-4" />
                View on GitHub
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(server.githubUrl);
                  // You could add a toast notification here
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {server.isOfficial && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Official
              </Badge>
            )}
            {server.isCertified && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Certified
              </Badge>
            )}
            <Badge variant="outline">{server.language}</Badge>
            <Badge variant="outline">{server.type}</Badge>
            <Badge variant="outline">{server.category}</Badge>
            <Badge variant="outline">{server.location}</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <span className="text-3xl font-bold">{server.rating}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Rating</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="h-6 w-6 text-green-500" />
                  <span className="text-3xl font-bold">{(server.stars / 1000).toFixed(1)}K</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">GitHub Stars</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <span className="text-3xl font-bold">
                    {new Date(server.addedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Added</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <span className="text-3xl font-bold">
                    {server.isOfficial ? 'Official' : 'Community'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Status</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {server.longDescription || server.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(server.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(server.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author</span>
                  <span className="font-medium">{server.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Language</span>
                  <Badge variant="outline">{server.language}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <Badge variant="outline">{server.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{server.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">License</span>
                  <span className="font-medium">{server.license}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(server.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {server.requirements && server.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(server.requirements || []).map((requirement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(server.githubUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  GitHub Repository
                </Button>
                {server.documentation && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(server.documentation, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contributor Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Found this server helpful?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Help improve the MCP ecosystem! Star the repository, share feedback, or contribute to make it even better.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => window.open(server.githubUrl, '_blank')}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Star className="h-4 w-4" />
                Star on GitHub
              </Button>
              <Button
                onClick={() => window.open(`https://github.com/Hyraze/collective-ai-tools/issues/new?title=Feedback for ${server.name}&body=I'd like to share feedback about ${server.name}...`, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Share Feedback
              </Button>
              <Button
                onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools/issues/new?template=add-mcp-server.md', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Similar Server
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              <p>💡 <strong>Tip:</strong> Found an issue or want to suggest improvements? <a href={`https://github.com/Hyraze/collective-ai-tools/issues/new?title=Issue with ${server.name}`} className="text-blue-600 hover:text-blue-700 underline">Open an issue</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MCPServerDetail;
