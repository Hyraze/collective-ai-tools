/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Workflow, 
  Download, 
  Settings,
  Play,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Zap,
  Brain,
  Database,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { aiToolsClient, type APIConfig } from '../../lib/aiToolsClient';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'ai-process' | 'data-source' | 'condition' | 'action' | 'output';
  name: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  inputs: string[];
  outputs: string[];
  status: 'idle' | 'running' | 'completed' | 'error';
  icon: React.ReactNode;
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  type: 'data' | 'control' | 'conditional';
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Omit<WorkflowNode, 'id' | 'position'>[];
  connections: Omit<WorkflowConnection, 'id'>[];
  tags: string[];
}

const NODE_TYPES = [
  {
    type: 'trigger',
    name: 'Trigger',
    description: 'Start workflow execution',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-green-500',
    category: 'Input'
  },
  {
    type: 'ai-process',
    name: 'AI Process',
    description: 'AI-powered processing',
    icon: <Brain className="h-4 w-4" />,
    color: 'bg-purple-500',
    category: 'Processing'
  },
  {
    type: 'data-source',
    name: 'Data Source',
    description: 'External data input',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-blue-500',
    category: 'Input'
  },
  {
    type: 'condition',
    name: 'Condition',
    description: 'Conditional logic',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-yellow-500',
    category: 'Logic'
  },
  {
    type: 'action',
    name: 'Action',
    description: 'Perform action',
    icon: <Play className="h-4 w-4" />,
    color: 'bg-orange-500',
    category: 'Action'
  },
  {
    type: 'output',
    name: 'Output',
    description: 'Workflow result',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-red-500',
    category: 'Output'
  }
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-generation',
    name: 'AI Content Generation Pipeline',
    description: 'Generate and optimize content using multiple AI models',
    category: 'Content',
    nodes: [
      {
        type: 'trigger',
        name: 'Content Request',
        description: 'User requests content generation',
        size: { width: 120, height: 80 },
        config: { triggerType: 'manual' },
        inputs: [],
        outputs: ['content_request'],
        status: 'idle',
        icon: <Zap className="h-4 w-4" />
      },
      {
        type: 'ai-process',
        name: 'Content Generator',
        description: 'Generate initial content',
        size: { width: 120, height: 80 },
        config: { model: 'gpt-4o', prompt: 'Generate high-quality content' },
        inputs: ['content_request'],
        outputs: ['generated_content'],
        status: 'idle',
        icon: <Brain className="h-4 w-4" />
      },
      {
        type: 'ai-process',
        name: 'Content Optimizer',
        description: 'Optimize content for SEO',
        size: { width: 120, height: 80 },
        config: { model: 'claude-3.5-sonnet', task: 'seo_optimization' },
        inputs: ['generated_content'],
        outputs: ['optimized_content'],
        status: 'idle',
        icon: <Brain className="h-4 w-4" />
      },
      {
        type: 'output',
        name: 'Final Content',
        description: 'Deliver optimized content',
        size: { width: 120, height: 80 },
        config: { format: 'markdown' },
        inputs: ['optimized_content'],
        outputs: [],
        status: 'idle',
        icon: <FileText className="h-4 w-4" />
      }
    ],
    connections: [
      { from: 'Content Request', to: 'Content Generator', fromPort: 'content_request', toPort: 'content_request', type: 'data' },
      { from: 'Content Generator', to: 'Content Optimizer', fromPort: 'generated_content', toPort: 'generated_content', type: 'data' },
      { from: 'Content Optimizer', to: 'Final Content', fromPort: 'optimized_content', toPort: 'optimized_content', type: 'data' }
    ],
    tags: ['content', 'ai', 'seo', 'automation']
  },
  {
    id: 'data-analysis',
    name: 'Intelligent Data Analysis',
    description: 'Analyze data with AI insights and visualizations',
    category: 'Analytics',
    nodes: [
      {
        type: 'data-source',
        name: 'Data Input',
        description: 'Import data from various sources',
        size: { width: 120, height: 80 },
        config: { sourceType: 'csv', autoDetect: true },
        inputs: [],
        outputs: ['raw_data'],
        status: 'idle',
        icon: <Database className="h-4 w-4" />
      },
      {
        type: 'ai-process',
        name: 'Data Analyzer',
        description: 'AI-powered data analysis',
        size: { width: 120, height: 80 },
        config: { model: 'claude-3.5-sonnet', analysisType: 'comprehensive' },
        inputs: ['raw_data'],
        outputs: ['analysis_results'],
        status: 'idle',
        icon: <Brain className="h-4 w-4" />
      },
      {
        type: 'action',
        name: 'Generate Charts',
        description: 'Create visualizations',
        size: { width: 120, height: 80 },
        config: { chartTypes: ['bar', 'line', 'pie'] },
        inputs: ['analysis_results'],
        outputs: ['charts'],
        status: 'idle',
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        type: 'output',
        name: 'Report',
        description: 'Generate final report',
        size: { width: 120, height: 80 },
        config: { format: 'pdf', includeCharts: true },
        inputs: ['analysis_results', 'charts'],
        outputs: [],
        status: 'idle',
        icon: <FileText className="h-4 w-4" />
      }
    ],
    connections: [
      { from: 'Data Input', to: 'Data Analyzer', fromPort: 'raw_data', toPort: 'raw_data', type: 'data' },
      { from: 'Data Analyzer', to: 'Generate Charts', fromPort: 'analysis_results', toPort: 'analysis_results', type: 'data' },
      { from: 'Data Analyzer', to: 'Report', fromPort: 'analysis_results', toPort: 'analysis_results', type: 'data' },
      { from: 'Generate Charts', to: 'Report', fromPort: 'charts', toPort: 'charts', type: 'data' }
    ],
    tags: ['data', 'analysis', 'visualization', 'ai']
  }
];

const VisualWorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<{ nodes: WorkflowNode[]; connections: WorkflowConnection[] }>({
    nodes: [],
    connections: []
  });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => aiToolsClient.getDefaultConfig('visual-workflow-builder'));
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; port: string } | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const connectionIdCounter = useRef(0);

  /**
   * Generates a unique ID for nodes and connections
   */
  const generateId = (type: 'node' | 'connection') => {
    if (type === 'node') {
      return `node-${++nodeIdCounter.current}`;
    } else {
      return `connection-${++connectionIdCounter.current}`;
    }
  };

  /**
   * Adds a new node to the workflow
   */
  const addNode = useCallback((nodeType: string, position?: { x: number; y: number }) => {
    const nodeTemplate = NODE_TYPES.find(nt => nt.type === nodeType);
    if (!nodeTemplate) return;

    // Calculate position based on existing nodes to avoid overlap
    const nodeCount = workflow.nodes.length;
    const defaultPosition = position || {
      x: 100 + (nodeCount % 3) * 150,
      y: 100 + Math.floor(nodeCount / 3) * 120
    };

    // Define default inputs and outputs based on node type
    const getDefaultPorts = (type: string) => {
      switch (type) {
        case 'trigger':
          return { inputs: [], outputs: ['trigger_output'] };
        case 'ai-process':
          return { inputs: ['data_input'], outputs: ['processed_data'] };
        case 'data-source':
          return { inputs: [], outputs: ['data_output'] };
        case 'condition':
          return { inputs: ['condition_input'], outputs: ['true_output', 'false_output'] };
        case 'action':
          return { inputs: ['action_input'], outputs: ['action_result'] };
        case 'output':
          return { inputs: ['final_input'], outputs: [] };
        default:
          return { inputs: ['input'], outputs: ['output'] };
      }
    };

    const ports = getDefaultPorts(nodeType);

    const newNode: WorkflowNode = {
      id: generateId('node'),
      type: nodeType as any,
      name: `${nodeTemplate.name} ${nodeIdCounter.current}`,
      description: nodeTemplate.description,
      position: defaultPosition,
      size: { width: 120, height: 80 },
      config: {},
      inputs: ports.inputs,
      outputs: ports.outputs,
      status: 'idle',
      icon: nodeTemplate.icon
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, [workflow.nodes.length]);

  /**
   * Removes a node from the workflow
   */
  const removeNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId)
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  /**
   * Updates node configuration
   */
  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
      )
    }));
  }, []);

  /**
   * Loads a workflow template
   */
  const loadTemplate = useCallback((template: WorkflowTemplate) => {
    const nodes: WorkflowNode[] = template.nodes.map((node, index) => ({
      ...node,
      id: generateId('node'),
      position: { x: 50 + (index * 200), y: 100 }
    }));

    const connections: WorkflowConnection[] = template.connections.map(conn => ({
      ...conn,
      id: generateId('connection')
    }));

    setWorkflow({ nodes, connections });
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setShowTemplates(false);
  }, []);

  /**
   * Executes the workflow
   */
  const executeWorkflow = useCallback(async () => {
    if (workflow.nodes.length === 0) return;

    setIsExecuting(true);
    
    // Update all nodes to running status
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({ ...node, status: 'running' as const }))
    }));

    try {
      // Simulate workflow execution
      for (const node of workflow.nodes) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setWorkflow(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => 
            n.id === node.id ? { ...n, status: 'completed' as const } : n
          )
        }));
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => ({ ...node, status: 'error' as const }))
      }));
    } finally {
      setIsExecuting(false);
    }
  }, [workflow.nodes]);

  /**
   * Handles canvas drag
   */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode && draggedNodeId) {
      // Handle node dragging
      const deltaX = e.clientX - nodeDragStart.x;
      const deltaY = e.clientY - nodeDragStart.y;
      
      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === draggedNodeId 
            ? { ...node, position: { x: node.position.x + deltaX, y: node.position.y + deltaY } }
            : node
        )
      }));
      
      setNodeDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      // Handle canvas dragging
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isConnecting) {
      // Handle connection preview
      setConnectionPreview({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsDraggingNode(false);
    setDraggedNodeId(null);
    
    // Cancel connection if clicking on empty canvas
    if (isConnecting) {
      cancelConnection();
    }
  };

  /**
   * Handles node drag
   */
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsDraggingNode(true);
      setDraggedNodeId(nodeId);
      setNodeDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  /**
   * Handles port click for creating connections
   */
  const handlePortClick = (e: React.MouseEvent, nodeId: string, port: string, isOutput: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    if (!isConnecting) {
      // Start connection from output port
      if (isOutput) {
        setIsConnecting(true);
        setConnectionStart({ nodeId: node.name, port });
        setConnectionPreview({ x: e.clientX, y: e.clientY });
      }
    } else {
      // Complete connection to input port
      if (!isOutput && connectionStart) {
        const newConnection: WorkflowConnection = {
          id: generateId('connection'),
          from: connectionStart.nodeId,
          to: node.name,
          fromPort: connectionStart.port,
          toPort: port,
          type: 'data'
        };
        
        setWorkflow(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }));
        
        // Reset connection state
        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionPreview(null);
      }
    }
  };

  /**
   * Cancels connection creation
   */
  const cancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionPreview(null);
  };

  /**
   * Renders connections between nodes
   */
  const renderConnections = () => {
    if (workflow.connections.length === 0 && !isConnecting) return null;
    
    return (
      <svg 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 1 }}
        width="100%" 
        height="100%"
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 12,4"
              fill="#3b82f6"
              stroke="#3b82f6"
              strokeWidth="1"
            />
          </marker>
          <marker
            id="arrowhead-preview"
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 12,4"
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth="1"
            />
          </marker>
        </defs>
        
        {/* Render existing connections */}
        {workflow.connections.map(connection => {
          const fromNode = workflow.nodes.find(n => n.name === connection.from);
          const toNode = workflow.nodes.find(n => n.name === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          // Calculate connection points (from output port to input port)
          const fromX = fromNode.position.x + fromNode.size.width + canvasOffset.x;
          const fromY = fromNode.position.y + fromNode.size.height / 2 + canvasOffset.y;
          const toX = toNode.position.x + canvasOffset.x;
          const toY = toNode.position.y + toNode.size.height / 2 + canvasOffset.y;
          
          // Create a smooth curved path
          const controlPointX = fromX + (toX - fromX) * 0.5;
          const controlPointY = fromY;
          
          return (
            <path
              key={connection.id}
              d={`M ${fromX} ${fromY} Q ${controlPointX} ${controlPointY} ${toX} ${toY}`}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="drop-shadow-sm"
            />
          );
        })}
        
        {/* Render connection preview */}
        {isConnecting && connectionStart && connectionPreview && (
          (() => {
            const fromNode = workflow.nodes.find(n => n.name === connectionStart.nodeId);
            if (!fromNode) return null;
            
            const fromX = fromNode.position.x + fromNode.size.width + canvasOffset.x;
            const fromY = fromNode.position.y + fromNode.size.height / 2 + canvasOffset.y;
            
            // Convert mouse position to canvas coordinates
            const canvasRect = document.querySelector('.workflow-canvas')?.getBoundingClientRect();
            if (!canvasRect) return null;
            
            const toX = connectionPreview.x - canvasRect.left;
            const toY = connectionPreview.y - canvasRect.top;
            
            const controlPointX = fromX + (toX - fromX) * 0.5;
            const controlPointY = fromY;
            
            return (
              <path
                d={`M ${fromX} ${fromY} Q ${controlPointX} ${controlPointY} ${toX} ${toY}`}
                stroke="#ef4444"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                opacity="0.8"
                markerEnd="url(#arrowhead-preview)"
                className="animate-pulse"
              />
            );
          })()
        )}
      </svg>
    );
  };


  /**
   * Downloads the workflow as JSON
   */
  const downloadWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: workflow.nodes,
      connections: workflow.connections,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          const workflowData = JSON.parse(e.target?.result as string);
          setWorkflow({
            nodes: workflowData.nodes || [],
            connections: workflowData.connections || []
          });
          setWorkflowName(workflowData.name || 'Imported Workflow');
          setWorkflowDescription(workflowData.description || '');
        } catch (error) {
          console.error('Error parsing workflow file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-6 h-screen flex flex-col">
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Workflow className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Visual AI Workflow Builder</CardTitle>
                <CardDescription>
                  Create complex AI workflows with drag-and-drop interface
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <Card className="flex-shrink-0">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none outline-none"
                  placeholder="Workflow Name"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={executeWorkflow}
                  disabled={isExecuting || workflow.nodes.length === 0}
                  size="sm"
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadWorkflow}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <input
                  type="file"
                  id="workflow-upload"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="workflow-upload"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {workflow.nodes.length} nodes, {workflow.connections.length} connections
              </span>
              {isConnecting && (
                <span className="text-sm text-red-500 font-medium">
                  Connecting...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Node Palette */}
        <Card className="w-64 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">Node Palette</CardTitle>
            <CardDescription>Drag nodes to canvas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {NODE_TYPES.map(nodeType => (
              <div
                key={nodeType.type}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${nodeType.color} text-white`}
                onClick={() => addNode(nodeType.type)}
              >
                <div className="flex items-center gap-2">
                  {nodeType.icon}
                  <div>
                    <div className="font-medium text-sm">{nodeType.name}</div>
                    <div className="text-xs opacity-90">{nodeType.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="flex-1 min-h-0">
          <CardContent className="p-0 h-full">
            <div
              ref={canvasRef}
              className="workflow-canvas w-full h-full relative overflow-hidden bg-gray-50 dark:bg-gray-900"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Connections */}
              {renderConnections()}

              {/* Workflow Nodes */}
              <div
                className="absolute"
                style={{
                  transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`
                }}
              >
                {workflow.nodes.map(node => {
                  const nodeType = NODE_TYPES.find(nt => nt.type === node.type);
                  return (
                    <div
                      key={node.id}
                      className={`absolute border-2 rounded-lg cursor-move transition-all ${
                        selectedNode?.id === node.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        node.status === 'running' ? 'animate-pulse' :
                        node.status === 'completed' ? 'border-green-500' :
                        node.status === 'error' ? 'border-red-500' : ''
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        width: node.size.width,
                        height: node.size.height
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    >
                      <div className={`w-full h-full rounded-lg ${nodeType?.color || 'bg-gray-500'} text-white p-3 flex flex-col justify-between transition-all duration-200 ${
                        isDraggingNode && draggedNodeId === node.id ? 'shadow-lg scale-105 opacity-90' : 'hover:shadow-md'
                      }`}>
                        <div className="flex items-center gap-2">
                          {node.icon}
                          <span className="text-sm font-medium truncate">{node.name}</span>
                        </div>
                        <div className="text-xs opacity-90 truncate">{node.description}</div>
                        {node.status !== 'idle' && (
                          <div className="absolute top-1 right-1">
                            {node.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                            {node.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-300" />}
                            {node.status === 'error' && <AlertCircle className="h-3 w-3 text-red-300" />}
                          </div>
                        )}
                      </div>
                      
                      {/* Input Ports */}
                      {node.inputs.length > 0 && (
                        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-20">
                          {node.inputs.map((input, index) => (
                            <div
                              key={input}
                              className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white cursor-pointer hover:bg-blue-400 hover:scale-110 transition-all duration-200 shadow-lg"
                              style={{ marginTop: index * 16 }}
                              onClick={(e) => handlePortClick(e, node.id, input, false)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onMouseUp={(e) => e.stopPropagation()}
                              title={`Input: ${input}`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Output Ports */}
                      {node.outputs.length > 0 && (
                        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-20">
                          {node.outputs.map((output, index) => (
                            <div
                              key={output}
                              className="w-6 h-6 bg-green-500 rounded-full border-3 border-white cursor-pointer hover:bg-green-400 hover:scale-110 transition-all duration-200 shadow-lg"
                              style={{ marginTop: index * 16 }}
                              onClick={(e) => handlePortClick(e, node.id, output, true)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onMouseUp={(e) => e.stopPropagation()}
                              title={`Output: ${output}`}
                            />
                          ))}
                        </div>
                      )}
                      
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {workflow.nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Workflow className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Start Building Your Workflow</h3>
                    <p className="text-sm">Drag nodes from the palette to begin</p>
                  </div>
                </div>
              )}

              {/* Connection Instructions */}
              {workflow.nodes.length > 0 && workflow.connections.length === 0 && !isConnecting && (
                <div className="absolute top-4 left-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">How to Connect Nodes:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Click on <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span> output ports (right side)</li>
                        <li>• Click on <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span> input ports (left side)</li>
                        <li>• Click empty canvas to cancel</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Status */}
              {isConnecting && (
                <div className="absolute top-4 left-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-medium mb-1">Creating Connection:</p>
                      <p className="text-xs">Click on a blue input port to complete the connection</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Properties Panel */}
        <Card className="w-80 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">Properties</CardTitle>
            <CardDescription>
              {selectedNode ? `Configure ${selectedNode.name}` : 'Select a node to configure'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Node Name</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const updatedNode = { ...selectedNode, name: e.target.value };
                      setSelectedNode(updatedNode);
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(node => 
                          node.id === selectedNode.id ? updatedNode : node
                        )
                      }));
                    }}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={selectedNode.description}
                    onChange={(e) => {
                      const updatedNode = { ...selectedNode, description: e.target.value };
                      setSelectedNode(updatedNode);
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(node => 
                          node.id === selectedNode.id ? updatedNode : node
                        )
                      }));
                    }}
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Configuration</label>
                  <Textarea
                    value={JSON.stringify(selectedNode.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateNodeConfig(selectedNode.id, config);
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    className="min-h-[120px] resize-none font-mono text-xs"
                    placeholder="Enter JSON configuration..."
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeNode(selectedNode.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Node
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a node to view and edit its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-4/5 max-w-4xl max-h-4/5 overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Templates</CardTitle>
                <Button variant="outline" onClick={() => setShowTemplates(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORKFLOW_TEMPLATES.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.nodes.length} nodes, {template.connections.length} connections
                        </div>
                        <Button
                          onClick={() => loadTemplate(template)}
                          className="w-full mt-4"
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI Configuration</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Configuration</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="use-default-api-workflow"
                      name="api-config-workflow"
                      checked={!apiConfig.useCustomApi}
                      onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: false, apiKey: undefined }))}
                      className="rounded"
                    />
                    <label htmlFor="use-default-api-workflow" className="text-sm">
                      Use Default API Key
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="use-custom-api-workflow"
                      name="api-config-workflow"
                      checked={apiConfig.useCustomApi}
                      onChange={() => setApiConfig(prev => ({ ...prev, useCustomApi: true }))}
                      className="rounded"
                    />
                    <label htmlFor="use-custom-api-workflow" className="text-sm">
                      Use Custom API Key
                    </label>
                  </div>
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

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VisualWorkflowBuilder;
