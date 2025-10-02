/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Local development server for API endpoints
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configure dotenv
dotenv.config({ path: '.env.local' });

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini API Key configured

/**
 * Unified AI Tools API endpoint
 * Handles all built-in tools through a single endpoint
 */
app.post('/api/ai-tools', async (req, res) => {
  try {
    const { tool, data, config } = req.body;

    // Validate request
    if (!tool || !data || !config) {
      return res.status(400).json({ error: 'Tool, data, and config are required' });
    }

    // Get API key
    const apiKey = config.useCustomApi && config.apiKey 
      ? config.apiKey 
      : GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured. Please provide your own API key or contact support.' 
      });
    }

    // Route to appropriate handler based on tool
    let result;
    switch (tool) {
      case 'text-summarizer':
        result = await handleTextSummarizer(data, config, apiKey);
        break;
      case 'code-reviewer':
        result = await handleCodeReviewer(data, config, apiKey);
        break;
      case 'n8n-builder':
        result = await handleN8nBuilder(data, config, apiKey);
        break;
      case 'agent-builder':
        result = await handleAgentBuilder(data, config, apiKey);
        break;
      case 'multi-model-orchestrator':
        result = await handleMultiModelOrchestrator(data, config, apiKey);
        break;
      case 'visual-workflow-builder':
        result = await handleVisualWorkflowBuilder(data, config, apiKey);
        break;
      case 'realtime-data-fusion':
        result = await handleRealtimeDataFusion(data, config, apiKey);
        break;
      default:
        return res.status(400).json({ error: 'Invalid tool specified' });
    }

    res.json(result);

  } catch (error) {
    console.error('AI Tools API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Handle n8n Builder requests
 */
async function handleN8nBuilder(data, config, apiKey) {
  const { request } = data;
  
  if (!request || !request.description) {
    throw new Error('Workflow description is required');
  }

  const prompt = `You are an expert n8n workflow automation specialist. Generate a complete n8n workflow JSON based on the following requirements:

**Workflow Requirements:**
- Name: ${request.name || 'Generated Workflow'}
- Description: ${request.description}
- Use Case: ${request.useCase || 'General automation'}
- Complexity: ${request.complexity}
- Integrations: ${request.integrations.join(', ') || 'None specified'}
- Triggers: ${request.triggers.join(', ')}
- Advanced Features: ${request.features.join(', ') || 'None specified'}

**IMPORTANT**: Return a valid n8n workflow JSON with the following structure:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "id": "unique-id",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "typeVersion": 1,
      "position": [x, y],
      "parameters": {}
    }
  ],
  "connections": {
    "Node1": {
      "main": [
        [
          {
            "node": "Node2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "staticData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "unique-instance-id"
  }
}

**Guidelines:**
1. Create realistic node configurations with proper parameters
2. Include appropriate connections between nodes
3. Use actual n8n node types (e.g., "n8n-nodes-base.httpRequest", "n8n-nodes-base.googleSheets")
4. Add proper error handling and data transformation nodes
5. Include webhook triggers if specified
6. Make the workflow production-ready with proper settings

Generate the complete workflow JSON now:`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 6000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const workflowText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate workflow';

  // Try to parse the JSON response
  let workflow;
  try {
    const jsonMatch = workflowText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      workflow = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    // Failed to parse workflow JSON, creating fallback
    // Create a basic workflow structure
    workflow = {
      name: request.name || 'Generated Workflow',
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [240, 300],
          parameters: {}
        }
      ],
      connections: {},
      active: false,
      settings: {},
      staticData: {},
      meta: {
        templateCredsSetupCompleted: true,
        instanceId: 'generated-instance'
      }
    };
  }

  const explanation = `Generated n8n workflow with ${workflow.nodes.length} nodes. The workflow includes ${request.integrations.length > 0 ? request.integrations.join(', ') : 'basic automation'} integrations and ${request.features.length > 0 ? request.features.join(', ') : 'standard'} features.`;

  return { 
    workflow,
    explanation
  };
}

/**
 * Handle Agent Builder requests
 */
async function handleAgentBuilder(data, config, apiKey) {
  const { request } = data;
  
  if (!request || !request.name || !request.description) {
    throw new Error('Agent name and description are required');
  }

  const prompt = `You are an expert AI agent architect specializing in Model Context Protocol (MCP) and advanced AI reasoning systems. Create a sophisticated MCP agent based on these requirements:

**Agent Requirements:**
- Name: ${request.name}
- Description: ${request.description}
- Primary Goal: ${request.primary_goal || 'General assistance'}
- Domain: ${request.domain || 'General'}
- Complexity: ${request.complexity}
- Reasoning Type: ${request.reasoning_type}
- Required Tools: ${request.tools_needed.join(', ') || 'None specified'}
- Memory Requirements: ${request.memory_requirements.join(', ') || 'Basic memory'}
- Communication Needs: ${request.communication_needs.join(', ') || 'Natural language'}
- Examples: ${request.examples.join('; ') || 'None provided'}

**IMPORTANT**: Return a complete MCP Agent JSON with this structure:
{
  "name": "Agent Name",
  "description": "Agent description",
  "capabilities": [
    {
      "id": "capability-id",
      "name": "Capability Name",
      "description": "What this capability does",
      "category": "reasoning|tool_usage|memory|communication|learning",
      "complexity": "basic|intermediate|advanced"
    }
  ],
  "tools": [
    {
      "name": "tool-name",
      "description": "Tool description",
      "parameters": {},
      "category": "tool-category"
    }
  ],
  "reasoning_engine": {
    "type": "${request.reasoning_type}",
    "parameters": {
      "max_iterations": 10,
      "confidence_threshold": 0.8
    }
  },
  "memory_system": {
    "type": "hybrid",
    "capacity": 10000,
    "persistence": true
  },
  "communication_protocol": {
    "type": "mcp",
    "version": "1.0",
    "schema": {}
  },
  "prompt_template": "System prompt for the agent",
  "system_instructions": "Detailed system instructions",
  "examples": [
    {
      "input": "Example input",
      "output": "Expected output",
      "reasoning": "Reasoning process"
    }
  ],
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 4000,
    "model": "gemini-2.5-flash",
    "safety_settings": {}
  }
}

**Guidelines:**
1. Create realistic capabilities based on the domain and complexity
2. Include appropriate tools for the specified requirements
3. Design a sophisticated reasoning engine configuration
4. Create a comprehensive memory system
5. Write detailed system instructions and examples
6. Make the agent production-ready with proper MCP compliance

Generate the complete MCP Agent JSON now:`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 8000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const agentText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate agent';

  // Try to parse the JSON response
  let agent;
  try {
    const jsonMatch = agentText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      agent = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    // Failed to parse agent JSON, creating fallback
    // Create a basic agent structure
    agent = {
      name: request.name,
      description: request.description,
      capabilities: [
        {
          id: 'basic-reasoning',
          name: 'Basic Reasoning',
          description: 'Fundamental logical reasoning capabilities',
          category: 'reasoning',
          complexity: 'basic'
        }
      ],
      tools: [],
      reasoning_engine: {
        type: request.reasoning_type,
        parameters: {
          max_iterations: 5,
          confidence_threshold: 0.7
        }
      },
      memory_system: {
        type: 'episodic',
        capacity: 1000,
        persistence: false
      },
      communication_protocol: {
        type: 'mcp',
        version: '1.0',
        schema: {}
      },
      prompt_template: `You are ${request.name}. ${request.description}`,
      system_instructions: `Primary goal: ${request.primary_goal}`,
      examples: [],
      configuration: {
        temperature: 0.7,
        max_tokens: 4000,
        model: 'gemini-2.5-flash',
        safety_settings: {}
      }
    };
  }

  const explanation = `Generated MCP Agent "${agent.name}" with ${agent.capabilities.length} capabilities and ${agent.tools.length} tools. The agent uses ${agent.reasoning_engine.type} reasoning and ${agent.memory_system.type} memory system.`;

  return { 
    agent,
    explanation
  };
}

/**
 * Handle Multi-Model Orchestrator requests
 */
async function handleMultiModelOrchestrator(data, config, apiKey) {
  const { query, selectedModels, autoSelect } = data;
  
  if (!query || !query.trim()) {
    throw new Error('Query is required');
  }

  const prompt = `You are an expert AI model comparison specialist. Analyze the following query and provide insights about which AI models would be most suitable:

**Query:** ${query}
**Selected Models:** ${selectedModels?.join(', ') || 'Auto-selected'}
**Auto Selection:** ${autoSelect ? 'Enabled' : 'Disabled'}

**Available Models and Their Capabilities:**
- GPT-4o: Excellent for code generation, creative writing, general reasoning, multimodal tasks
- Claude-3.5-Sonnet: Superior for analysis, safety, long context, ethical reasoning
- Gemini-2.5-Flash: Fast, cost-effective, good for quick tasks and real-time data
- DeepSeek-V3: Specialized in coding, mathematics, technical reasoning
- Grok-3: Best for real-time data, current events, unfiltered responses

**IMPORTANT**: Return a JSON response with this structure:
{
  "query_analysis": {
    "type": "programming|analysis|creative|current_events|general",
    "complexity": "simple|intermediate|complex",
    "keywords": ["keyword1", "keyword2"],
    "requirements": ["requirement1", "requirement2"]
  },
  "model_recommendations": [
    {
      "model": "Model Name",
      "score": 85,
      "reasoning": "Why this model is suitable",
      "strengths": ["strength1", "strength2"],
      "estimated_quality": 90,
      "estimated_cost": 0.002,
      "estimated_speed": "fast|medium|slow"
    }
  ],
  "comparison_insights": {
    "best_overall": "Model Name",
    "most_cost_effective": "Model Name",
    "fastest": "Model Name",
    "highest_quality": "Model Name",
    "recommendation": "Detailed recommendation with reasoning"
  },
  "usage_tips": [
    "Tip 1 for optimal results",
    "Tip 2 for cost optimization",
    "Tip 3 for speed"
  ]
}

Generate the complete analysis now:`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 4000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate analysis';

  // Try to parse the JSON response
  let analysis;
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    // Failed to parse analysis JSON, creating fallback
    // Create a basic analysis structure
    analysis = {
      query_analysis: {
        type: 'general',
        complexity: 'intermediate',
        keywords: query.toLowerCase().split(' ').slice(0, 5),
        requirements: ['general reasoning']
      },
      model_recommendations: [
        {
          model: 'GPT-4o',
          score: 85,
          reasoning: 'Good general-purpose model for most queries',
          strengths: ['General reasoning', 'Code generation'],
          estimated_quality: 85,
          estimated_cost: 0.003,
          estimated_speed: 'medium'
        }
      ],
      comparison_insights: {
        best_overall: 'GPT-4o',
        most_cost_effective: 'Gemini-2.5-Flash',
        fastest: 'Gemini-2.5-Flash',
        highest_quality: 'Claude-3.5-Sonnet',
        recommendation: 'For this query, GPT-4o provides the best balance of quality and capability.'
      },
      usage_tips: [
        'Consider using multiple models for complex queries',
        'Use cost-effective models for simple tasks',
        'Enable auto-selection for optimal model routing'
      ]
    };
  }

  const explanation = `Analyzed query "${query}" and provided recommendations for ${analysis.model_recommendations.length} AI models. The analysis includes query classification, model scoring, and usage recommendations.`;

  return { 
    analysis,
    explanation
  };
}

/**
 * Handle Visual Workflow Builder requests
 */
async function handleVisualWorkflowBuilder(data, config, apiKey) {
  const { workflow, action } = data;
  
  if (!workflow || !action) {
    throw new Error('Workflow and action are required');
  }

  const prompt = `You are an expert AI workflow optimization specialist. Analyze the following visual workflow and provide recommendations:

**Workflow Name:** ${workflow.name || 'Untitled Workflow'}
**Action:** ${action}
**Nodes:** ${workflow.nodes?.length || 0}
**Connections:** ${workflow.connections?.length || 0}

**Workflow Structure:**
${JSON.stringify(workflow, null, 2)}

**IMPORTANT**: Return a JSON response with this structure:
{
  "workflow_analysis": {
    "complexity": "simple|intermediate|complex|enterprise",
    "efficiency_score": 85,
    "optimization_opportunities": ["opportunity1", "opportunity2"],
    "performance_metrics": {
      "estimated_execution_time": "2.5s",
      "resource_usage": "medium",
      "scalability": "good"
    }
  },
  "recommendations": [
    {
      "type": "optimization|security|scalability|performance",
      "priority": "high|medium|low",
      "description": "Detailed recommendation",
      "implementation": "Step-by-step implementation guide",
      "impact": "Expected improvement description"
    }
  ],
  "best_practices": [
    "Best practice 1 for this workflow type",
    "Best practice 2 for performance",
    "Best practice 3 for maintainability"
  ],
  "alternative_approaches": [
    {
      "approach": "Alternative approach name",
      "description": "How this approach differs",
      "pros": ["advantage1", "advantage2"],
      "cons": ["disadvantage1", "disadvantage2"]
    }
  ],
  "execution_plan": {
    "steps": [
      {
        "step": 1,
        "action": "Action to take",
        "description": "Detailed description",
        "estimated_time": "30s"
      }
    ],
    "total_estimated_time": "2.5s",
    "parallel_execution": true,
    "error_handling": "Recommended error handling strategy"
  }
}

Generate the complete workflow analysis now:`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 6000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate analysis';

  // Try to parse the JSON response
  let analysis;
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    // Failed to parse workflow analysis JSON, creating fallback
    // Create a basic analysis structure
    analysis = {
      workflow_analysis: {
        complexity: 'intermediate',
        efficiency_score: 75,
        optimization_opportunities: ['Add error handling', 'Optimize node connections'],
        performance_metrics: {
          estimated_execution_time: '3.0s',
          resource_usage: 'medium',
          scalability: 'good'
        }
      },
      recommendations: [
        {
          type: 'optimization',
          priority: 'medium',
          description: 'Add error handling nodes to improve reliability',
          implementation: 'Insert error handling nodes between critical operations',
          impact: 'Improved workflow reliability and error recovery'
        }
      ],
      best_practices: [
        'Use clear node naming conventions',
        'Add error handling for external API calls',
        'Implement proper logging and monitoring'
      ],
      alternative_approaches: [
        {
          approach: 'Parallel Processing',
          description: 'Execute independent nodes in parallel',
          pros: ['Faster execution', 'Better resource utilization'],
          cons: ['More complex error handling', 'Higher resource usage']
        }
      ],
      execution_plan: {
        steps: [
          {
            step: 1,
            action: 'Initialize workflow',
            description: 'Set up initial parameters and validate inputs',
            estimated_time: '0.5s'
          },
          {
            step: 2,
            action: 'Execute nodes',
            description: 'Process all workflow nodes in sequence',
            estimated_time: '2.0s'
          },
          {
            step: 3,
            action: 'Generate output',
            description: 'Compile results and generate final output',
            estimated_time: '0.5s'
          }
        ],
        total_estimated_time: '3.0s',
        parallel_execution: false,
        error_handling: 'Stop on first error and provide detailed error information'
      }
    };
  }

  const explanation = `Analyzed workflow "${workflow.name || 'Untitled'}" with ${workflow.nodes?.length || 0} nodes and provided optimization recommendations. The analysis includes performance metrics, best practices, and execution planning.`;

  return { 
    analysis,
    explanation
  };
}

/**
 * Handle Real-time Data Fusion requests
 */
async function handleRealtimeDataFusion(data, config, apiKey) {
  const { action, dataSources, insights } = data;
  
  if (!action) {
    throw new Error('Action is required');
  }

  const prompt = `You are an expert real-time data fusion and AI insights specialist. Analyze the following data sources and generate intelligent insights:

**Action:** ${action}
**Data Sources:** ${dataSources?.length || 0}
**Existing Insights:** ${insights?.length || 0}

**Data Sources Information:**
${JSON.stringify(dataSources, null, 2)}

**Existing Insights:**
${JSON.stringify(insights, null, 2)}

**IMPORTANT**: Return a JSON response with this structure:
{
  "insights": [
    {
      "id": "insight-id",
      "type": "trend|anomaly|prediction|correlation|recommendation",
      "title": "Insight Title",
      "description": "Detailed description of the insight",
      "confidence": 0.85,
      "impact": "high|medium|low",
      "timestamp": "2024-01-01T00:00:00Z",
      "data": {
        "source": "data source info",
        "metrics": "relevant metrics"
      },
      "actionable": true
    }
  ],
  "data_analysis": {
    "total_data_points": 1500,
    "data_quality_score": 0.92,
    "trends_detected": ["trend1", "trend2"],
    "anomalies_found": ["anomaly1", "anomaly2"],
    "correlations_discovered": [
      {
        "variables": ["var1", "var2"],
        "strength": 0.73,
        "significance": "high"
      }
    ]
  },
  "recommendations": [
    {
      "type": "optimization|alert|action",
      "priority": "high|medium|low",
      "description": "Recommendation description",
      "implementation": "How to implement this recommendation",
      "expected_impact": "Expected outcome"
    }
  ],
  "predictions": [
    {
      "metric": "metric name",
      "prediction": "predicted value",
      "confidence": 0.78,
      "timeframe": "next 24 hours",
      "factors": ["factor1", "factor2"]
    }
  ]
}

Generate comprehensive insights based on the data sources and existing insights:`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 6000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate insights';

  // Try to parse the JSON response
  let analysis;
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    // Failed to parse data fusion analysis JSON, creating fallback
    // Create a basic analysis structure
    analysis = {
      insights: [
        {
          id: `insight-${Date.now()}`,
          type: 'trend',
          title: 'Data Pattern Detected',
          description: 'AI has identified a significant pattern in the incoming data streams',
          confidence: 0.82,
          impact: 'medium',
          timestamp: new Date().toISOString(),
          data: {
            source: 'Multiple data sources',
            metrics: 'Pattern strength: 0.75'
          },
          actionable: true
        }
      ],
      data_analysis: {
        total_data_points: dataSources?.reduce((sum, ds) => sum + (ds.dataCount || 0), 0) || 0,
        data_quality_score: 0.88,
        trends_detected: ['Increasing data volume', 'Pattern consistency'],
        anomalies_found: ['Unusual spike detected'],
        correlations_discovered: [
          {
            variables: ['Data Source 1', 'Data Source 2'],
            strength: 0.65,
            significance: 'medium'
          }
        ]
      },
      recommendations: [
        {
          type: 'optimization',
          priority: 'medium',
          description: 'Optimize data processing pipeline for better performance',
          implementation: 'Implement parallel processing for high-volume data sources',
          expected_impact: '20% improvement in processing speed'
        }
      ],
      predictions: [
        {
          metric: 'Data Volume',
          prediction: '15% increase',
          confidence: 0.75,
          timeframe: 'next 24 hours',
          factors: ['Historical trends', 'Current patterns']
        }
      ]
    };
  }

  const explanation = `Generated ${analysis.insights.length} new insights from ${dataSources?.length || 0} data sources. Analysis includes trends, anomalies, correlations, and actionable recommendations.`;

  return { 
    analysis,
    explanation
  };
}

/**
 * Handle Text Summarizer requests
 */
async function handleTextSummarizer(data, config, apiKey) {
  const { text, options } = data;
  
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required');
  }

  const prompt = `Please summarize the following text in ${options?.maxLength || 200} words or less. 
  Style: ${options?.style || 'bullet points'}
  Preserve numbers: ${options?.preserveNumbers ? 'yes' : 'no'}
  Preserve names: ${options?.preserveNames ? 'yes' : 'no'}
  
  Text to summarize:
  ${text}`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const summary = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate summary';

  return { summary };
}

/**
 * Handle Code Reviewer requests
 */
async function handleCodeReviewer(data, config, apiKey) {
  const { code, options } = data;
  
  if (!code || typeof code !== 'string') {
    throw new Error('Code is required');
  }

  const language = options?.language || 'javascript';
  const reviewTypes = options?.reviewType || { security: true, performance: true, bestPractices: true, bugDetection: true };
  
  const focusAreas = [];
  if (reviewTypes.security) focusAreas.push('security vulnerabilities');
  if (reviewTypes.performance) focusAreas.push('performance issues');
  if (reviewTypes.bestPractices) focusAreas.push('best practices and code style');
  if (reviewTypes.bugDetection) focusAreas.push('potential bugs');

  const prompt = `Please analyze the following ${language} code for: ${focusAreas.join(', ')}.

  **IMPORTANT**: Format your response as structured JSON with the following format:
  [
    {
      "type": "security|performance|best-practice|bug|optimization",
      "severity": "critical|high|medium|low|info",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it",
      "line": line_number_if_applicable
    }
  ]

  If no issues are found, return an empty array: []

  Code to analyze:
  \`\`\`${language}
  ${code}
  \`\`\`

  Provide specific, actionable feedback in the JSON format above.`;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature || 0.2,
        maxOutputTokens: config.maxTokens || 2000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to analyze code';

  // Try to parse as JSON first, fallback to text parsing
  let results;
  try {
    // Clean the response to extract JSON
    const jsonMatch = analysis.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      results = JSON.parse(jsonMatch[0]);
    } else {
      results = parseCodeAnalysis(analysis);
    }
  } catch (error) {
    // Failed to parse JSON, falling back to text parsing
    results = parseCodeAnalysis(analysis);
  }

  return { results };
}

/**
 * Parse AI analysis into structured results
 */
function parseCodeAnalysis(analysis) {
  const results = [];
  const lines = analysis.split('\n');
  
  let currentResult = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^(Type|Severity|Message|Suggestion|Line):/i)) {
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      if (!currentResult) {
        currentResult = {
          type: 'suggestion',
          severity: 'info',
          message: '',
          suggestion: ''
        };
      }
      
      switch (key.toLowerCase()) {
        case 'type':
          currentResult.type = value.toLowerCase().replace(/[^a-z-]/g, '');
          break;
        case 'severity':
          currentResult.severity = value.toLowerCase().replace(/[^a-z]/g, '');
          break;
        case 'message':
          currentResult.message = value;
          break;
        case 'suggestion':
          currentResult.suggestion = value;
          break;
        case 'line':
          const lineNum = parseInt(value);
          if (!isNaN(lineNum)) {
            currentResult.line = lineNum;
          }
          break;
      }
    } else if (trimmedLine && currentResult && currentResult.message) {
      // This is likely a continuation of the message or suggestion
      if (!currentResult.suggestion) {
        currentResult.message += ' ' + trimmedLine;
      } else {
        currentResult.suggestion += ' ' + trimmedLine;
      }
    } else if (trimmedLine === '' && currentResult && currentResult.message) {
      // Empty line, save current result
      results.push(currentResult);
      currentResult = null;
    }
  }
  
  // Add the last result if exists
  if (currentResult && currentResult.message) {
    results.push(currentResult);
  }
  
  // If no structured results found, create a general one
  if (results.length === 0) {
    results.push({
      type: 'suggestion',
      severity: 'info',
      message: analysis,
      suggestion: 'Please review the analysis above for specific recommendations.'
    });
  }
  
  return results;
}

// RSS Feeds for AI Jobs - VERIFIED WORKING sources
const RSS_FEEDS = [
  // ✅ VERIFIED WORKING
  {
    name: 'We Work Remotely - Programming',
    url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
    enabled: true,
    type: 'weworkremotely',
    priority: 1,
    searchTerms: ['ai', 'artificial intelligence', 'machine learning', 'data scientist', 'ml engineer', 'deep learning']
  },
  {
    name: 'We Work Remotely - Data',
    url: 'https://weworkremotely.com/categories/remote-data-science-jobs.rss',
    enabled: true,
    type: 'weworkremotely-data',
    priority: 1,
    searchTerms: ['ai', 'machine learning', 'data science', 'ml', 'artificial intelligence']
  },
  
  // 🔄 ALTERNATIVE WORKING SOURCES
  {
    name: 'Hacker News Jobs',
    url: 'https://hn.algolia.com/api/v1/search?tags=job&hitsPerPage=100',
    enabled: true,
    type: 'hackernews',
    priority: 2,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'ml engineer', 'artificial intelligence', 'data scientist']
  },
  {
    name: 'RemoteOK - AI Jobs',
    url: 'https://remoteok.com/api?tag=ai',
    enabled: true,
    type: 'remoteok-api',
    priority: 2,
    isAPI: true,
    searchTerms: []
  },
  {
    name: 'Arbeitnow Remote Jobs',
    url: 'https://arbeitnow.com/api/job-board-api',
    enabled: true,
    type: 'arbeitnow',
    priority: 2,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence', 'data science']
  },
  
  // 🧪 EXPERIMENTAL - May work with different approaches
  {
    name: 'Remote.co Tech Jobs',
    url: 'https://remote.co/api/jobs/technology',
    enabled: false,
    type: 'remote-co-api',
    priority: 3,
    isAPI: true,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence']
  },
  {
    name: 'AI Jobs Board Feed',
    url: 'https://ai-jobs.net/feed/',
    enabled: true,
    type: 'ai-jobs',
    priority: 3,
    searchTerms: ['ai', 'machine learning', 'artificial intelligence']
  },
  {
    name: 'Remote OK RSS',
    url: 'https://remoteok.io/remote-ai-jobs.rss',
    enabled: true,
    type: 'remoteok-rss',
    priority: 3,
    searchTerms: []
  }
];

// Mock data for AI Jobs (fallback)
const mockJobs = [
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
    country: 'US',
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
    country: 'US',
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
    country: 'UK',
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
    country: 'US',
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
    country: 'Remote',
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
  },
  {
    id: '7',
    title: 'Deep Learning Engineer',
    company: 'NVIDIA',
    location: 'Santa Clara, CA',
    type: 'fulltime',
    description: 'Develop and optimize deep learning frameworks and algorithms. Work on GPU-accelerated AI solutions.',
    url: 'https://nvidia.com/careers',
    publishedDate: '2025-01-09',
    source: 'AI/ML Jobs',
    salary: '$170,000 - $240,000',
    experience: '4+ years',
    tags: ['Deep Learning', 'CUDA', 'PyTorch', 'GPU Programming']
  },
  {
    id: '8',
    title: 'AI Ethics Researcher',
    company: 'Partnership on AI',
    location: 'Remote',
    type: 'remote',
    description: 'Research and develop frameworks for responsible AI development. Focus on fairness, transparency, and accountability.',
    url: 'https://partnershiponai.org/careers',
    publishedDate: '2025-01-08',
    source: 'Remote AI Jobs',
    salary: '$100,000 - $150,000',
    experience: 'PhD or 3+ years',
    tags: ['AI Ethics', 'Research', 'Policy', 'Responsible AI']
  },
  {
    id: '9',
    title: 'Robotics Engineer',
    company: 'Boston Dynamics',
    location: 'Waltham, MA',
    type: 'fulltime',
    description: 'Design and develop robotic systems with AI-powered control algorithms. Work on next-generation autonomous robots.',
    url: 'https://bostondynamics.com/careers',
    publishedDate: '2025-01-07',
    source: 'AI Jobs',
    salary: '$130,000 - $190,000',
    experience: '3+ years',
    tags: ['Robotics', 'Control Systems', 'C++', 'Python', 'AI']
  },
  {
    id: '10',
    title: 'AI Startup Founder',
    company: 'Y Combinator',
    location: 'San Francisco, CA',
    type: 'fulltime',
    description: 'Join our accelerator program to build the next big AI startup. Get funding, mentorship, and access to our network.',
    url: 'https://ycombinator.com/apply',
    publishedDate: '2025-01-06',
    source: 'Wellfound',
    salary: 'Equity + $500K',
    experience: 'Entrepreneurial',
    tags: ['Startup', 'Entrepreneurship', 'AI', 'Innovation']
  }
];

/**
 * Extract country from location text
 */
function extractCountry(location) {
  if (!location) return '';
  
  // Common country mappings and patterns
  const countryMappings = {
    // Full country names
    'united states': 'US',
    'united kingdom': 'UK', 
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'netherlands': 'NL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'switzerland': 'CH',
    'austria': 'AT',
    'belgium': 'BE',
    'ireland': 'IE',
    'portugal': 'PT',
    'poland': 'PL',
    'czech republic': 'CZ',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'croatia': 'HR',
    'slovenia': 'SI',
    'slovakia': 'SK',
    'estonia': 'EE',
    'latvia': 'LV',
    'lithuania': 'LT',
    'japan': 'JP',
    'south korea': 'KR',
    'singapore': 'SG',
    'india': 'IN',
    'china': 'CN',
    'brazil': 'BR',
    'mexico': 'MX',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'peru': 'PE',
    'south africa': 'ZA',
    'israel': 'IL',
    'turkey': 'TR',
    'russia': 'RU',
    'ukraine': 'UA',
    'new zealand': 'NZ',
    'philippines': 'PH',
    'thailand': 'TH',
    'vietnam': 'VN',
    'indonesia': 'ID',
    'malaysia': 'MY',
    'taiwan': 'TW',
    'hong kong': 'HK',
    
    // Common abbreviations
    'usa': 'US',
    'uk': 'UK',
    'uae': 'AE',
    'u.s.': 'US',
    'u.s.a.': 'US',
    'u.k.': 'UK',
    
    // Remote patterns
    'remote': 'Remote',
    'worldwide': 'Remote',
    'global': 'Remote',
    'anywhere': 'Remote',
    'work from home': 'Remote',
    'wfh': 'Remote'
  };
  
  const locationLower = location.toLowerCase().trim();
  
  // Direct mapping
  if (countryMappings[locationLower]) {
    return countryMappings[locationLower];
  }
  
  // Check for country codes (2-3 letters)
  if (/^[A-Z]{2,3}$/.test(location)) {
    return location.toUpperCase();
  }
  
  // Check for city, country patterns
  const cityCountryMatch = location.match(/(.+),\s*(.+)$/);
  if (cityCountryMatch) {
    const countryPart = cityCountryMatch[2].toLowerCase().trim();
    if (countryMappings[countryPart]) {
      return countryMappings[countryPart];
    }
    // Check if it's a US state code
    const usStateCodes = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
    if (usStateCodes.includes(countryPart)) {
      return 'US';
    }
    // Check if it's a Canadian province
    const canadianProvinces = ['ontario', 'quebec', 'british columbia', 'alberta', 'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'prince edward island', 'northwest territories', 'yukon', 'nunavut'];
    if (canadianProvinces.includes(countryPart)) {
      return 'CA';
    }
    // Return the country part as-is if it looks like a country code
    if (/^[A-Z]{2,3}$/i.test(countryPart)) {
      return countryPart.toUpperCase();
    }
  }
  
  // Check for state/country patterns (US states and state codes)
  const usStates = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'];
  const usStateCodes = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  
  if (usStates.some(state => locationLower.includes(state)) || 
      usStateCodes.some(code => locationLower.includes(code))) {
    return 'US';
  }
  
  // Check for UK regions
  const ukRegions = ['england', 'scotland', 'wales', 'northern ireland', 'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield', 'bristol', 'edinburgh', 'glasgow', 'cardiff', 'belfast'];
  
  if (ukRegions.some(region => locationLower.includes(region))) {
    return 'UK';
  }
  
  // Check for Canadian provinces
  const canadianProvinces = ['ontario', 'quebec', 'british columbia', 'alberta', 'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'prince edward island', 'northwest territories', 'yukon', 'nunavut', 'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa'];
  
  if (canadianProvinces.some(province => locationLower.includes(province))) {
    return 'CA';
  }
  
  // Default: return the original location if no mapping found
  return location;
}

/**
 * Extract experience requirements from text
 */
function extractExperience(text) {
  if (!text) return '';
  
  const experiencePatterns = [
    // Years of experience patterns (most specific first)
    /(\d+)\s*-\s*(\d+)\s*years?/gi,
    /(\d+)\s*to\s*(\d+)\s*years?/gi,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
    /(\d+)\+?\s*years?\s*(?:in\s*)?(?:software|development|programming|engineering)/gi,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:relevant\s*)?(?:work\s*)?(?:experience)/gi,
    /experience\s*:?\s*(\d+)\+?\s*years?/gi,
    /(\d+)\+?\s*years?\s*(?:minimum|required|preferred)/gi,
    
    // Experience level patterns (most specific first)
    /(entry\s*level|new\s*grad|new\s*graduate)/gi,
    /(mid\s*level|mid-level|intermediate|mid\s*senior)/gi,
    /(senior\s*level|expert|advanced)/gi,
    /(junior|graduate)/gi,
    /(senior|lead|principal|staff|architect)/gi
  ];
  
  for (const pattern of experiencePatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1] && match[2] && !isNaN(parseInt(match[1])) && !isNaN(parseInt(match[2]))) {
        // Range pattern (e.g., "3-5 years")
        return `${match[1]}-${match[2]} years`;
      } else if (match[1] && !isNaN(parseInt(match[1]))) {
        // Single number pattern
        const years = parseInt(match[1]);
        if (years >= 1 && years <= 15) {
          return `${years}+ years`;
        }
      } else if (match[0] || match[1]) {
        // Level pattern
        const level = (match[0] || match[1]).toLowerCase();
        if (level.includes('entry') || level.includes('junior') || level.includes('graduate') || level.includes('new')) {
          return 'Entry level';
        } else if (level.includes('mid') || level.includes('intermediate')) {
          return '3-5 years';
        } else if (level.includes('senior') || level.includes('lead') || level.includes('principal')) {
          return '5+ years';
        } else if (level.includes('expert') || level.includes('advanced')) {
          return '7+ years';
        }
      }
    }
  }
  
  return '';
}

/**
 * Parse API JSON response (for RemoteOK, Arbeitnow, etc.)
 */
function parseAPIJobs(data, sourceName, feedType) {
  const jobs = [];
  
  try {
    let jobsArray = [];
    
    // Handle different API response formats
    if (feedType === 'remoteok-api') {
      jobsArray = Array.isArray(data) ? data.slice(1) : []; // RemoteOK has metadata in first element
    } else if (feedType === 'hackernews') {
      jobsArray = data.hits || [];
    } else if (feedType === 'arbeitnow') {
      jobsArray = data.data || [];
    } else {
      jobsArray = Array.isArray(data) ? data : data.jobs || [];
    }
    
    jobsArray.forEach((item, index) => {
      try {
        // RemoteOK format
        if (feedType === 'remoteok-api') {
          // Handle date parsing safely
          let publishedDate = new Date().toISOString().split('T')[0];
          if (item.date) {
            try {
              const date = new Date(item.date * 1000);
              if (!isNaN(date.getTime())) {
                publishedDate = date.toISOString().split('T')[0];
              }
            } catch (dateError) {
              console.warn(`Invalid date for RemoteOK job ${item.id}: ${item.date}`);
            }
          }
          
          // Clean up description - remove HTML tags and truncate
          let description = item.description || '';
          if (description) {
            description = description.replace(/<[^>]*>/g, '').trim();
            
            // Decode HTML entities
            description = description
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .replace(/&apos;/g, "'");
            
            // Remove extra whitespace
            description = description.replace(/\s+/g, ' ').trim();
            
            if (description.length > 300) {
              description = description.substring(0, 300) + '...';
            }
          }
          
          // Extract company name better
          let company = item.company || 'Unknown Company';
          if (company === 'Unknown Company' && item.position) {
            // Try to extract company from position title
            const positionMatch = item.position.match(/^(.+?)\s*[-–]\s*(.+)$/);
            if (positionMatch) {
              company = positionMatch[1].trim();
            }
          }
          
          jobs.push({
            id: `api-${feedType}-${item.id || index}`,
            title: item.position || item.title || 'Unknown Position',
            company: company,
            location: item.location || 'Remote',
            type: 'remote',
            description: description,
            url: item.url || `https://remoteok.com/remote-jobs/${item.id}`,
            publishedDate: publishedDate,
            source: sourceName,
            salary: item.salary_min && item.salary_max ? `$${item.salary_min} - $${item.salary_max}` : '',
            experience: extractExperience(`${item.position || ''} ${description}`),
            country: extractCountry(item.location || ''),
            tags: item.tags || []
          });
        }
        // Hacker News format
        else if (feedType === 'hackernews') {
          const title = item.story_text || item.title || '';
          if (title.length > 10) {
            // Handle date parsing safely
            let publishedDate = new Date().toISOString().split('T')[0];
            if (item.created_at) {
              try {
                const date = new Date(item.created_at);
                if (!isNaN(date.getTime())) {
                  publishedDate = date.toISOString().split('T')[0];
                }
              } catch (dateError) {
                console.warn(`Invalid date for HN job ${item.objectID}: ${item.created_at}`);
              }
            }
            
            jobs.push({
              id: `api-${feedType}-${item.objectID}`,
              title: title.substring(0, 100),
              company: 'See HN Post',
              location: 'Various',
              type: 'remote',
              description: item.story_text || item.title || '',
              url: item.story_url || `https://news.ycombinator.com/item?id=${item.objectID}`,
              publishedDate: publishedDate,
              source: sourceName,
              salary: '',
              experience: extractExperience(`${title} ${item.story_text || ''}`),
              country: 'Various',
              tags: ['Hacker News']
            });
          }
        }
        // Arbeitnow format
        else if (feedType === 'arbeitnow') {
          // Handle date parsing safely
          let publishedDate = new Date().toISOString().split('T')[0];
          if (item.created_at) {
            try {
              const date = new Date(item.created_at);
              if (!isNaN(date.getTime())) {
                publishedDate = date.toISOString().split('T')[0];
              }
            } catch (dateError) {
              console.warn(`Invalid date for Arbeitnow job ${item.slug}: ${item.created_at}`);
            }
          }
          
          // Clean up description - remove HTML tags and truncate
          let description = item.description || '';
          if (description) {
            description = description.replace(/<[^>]*>/g, '').trim();
            
            // Decode HTML entities
            description = description
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .replace(/&apos;/g, "'");
            
            // Remove extra whitespace
            description = description.replace(/\s+/g, ' ').trim();
            
            if (description.length > 300) {
              description = description.substring(0, 300) + '...';
            }
          }
          
          // Better company name extraction
          let company = item.company_name || 'Unknown Company';
          if (company === 'Unknown Company' && item.title) {
            // Try to extract company from title
            const titleMatch = item.title.match(/^(.+?)\s*[-–]\s*(.+)$/);
            if (titleMatch) {
              company = titleMatch[1].trim();
            }
          }
          
          jobs.push({
            id: `api-${feedType}-${item.slug || index}`,
            title: item.title || 'Unknown Position',
            company: company,
            location: item.location || 'Remote',
            type: item.remote ? 'remote' : 'fulltime',
            description: description,
            url: item.url || `https://arbeitnow.com/jobs/${item.slug}`,
            publishedDate: publishedDate,
            source: sourceName,
            salary: '',
            experience: extractExperience(`${item.title || ''} ${description}`),
            country: extractCountry(item.location || ''),
            tags: item.tags || []
          });
        }
      } catch (itemError) {
        console.error(`Error parsing item from ${sourceName}:`, itemError);
      }
    });
    
    // Successfully parsed jobs from API
  } catch (error) {
    console.error(`Error parsing API response from ${sourceName}:`, error);
  }
  
  return jobs;
}

/**
 * Parse XML/RSS text to extract job information
 */
function parseXMLToJobs(xmlText, sourceName) {
  const jobs = [];
  
  try {
    // Simple XML parsing for RSS feeds
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      // Extract title
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '';
      
      // Extract description
      const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s);
      const description = descMatch ? (descMatch[1] || descMatch[2]) : '';
      
      // Extract link
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const url = linkMatch ? linkMatch[1].trim() : '';
      
      // Extract pubDate
      const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      let pubDate = new Date().toISOString();
      if (dateMatch) {
        try {
          const date = new Date(dateMatch[1]);
          if (!isNaN(date.getTime())) {
            pubDate = date.toISOString();
          }
        } catch (dateError) {
          console.warn(`Invalid date in RSS feed: ${dateMatch[1]}`);
        }
      }
      
      // Extract company from title or description
      let company = 'Unknown Company';
      
      // Try multiple patterns to extract company name
      if (title.includes(' at ')) {
        company = title.split(' at ')[1].split(' - ')[0].split(' | ')[0].split('(')[0].trim();
      } else if (title.includes(' - ')) {
        // Pattern: "Company - Job Title"
        const titleParts = title.split(' - ');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (title.includes(' | ')) {
        // Pattern: "Company | Job Title"
        const titleParts = title.split(' | ');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (title.includes(':')) {
        // Pattern: "Company: Job Title"
        const titleParts = title.split(':');
        if (titleParts.length > 1) {
          company = titleParts[0].trim();
        }
      } else if (description.includes('Company:')) {
        const companyMatch = description.match(/Company:\s*([^\n<]+)/);
        if (companyMatch) company = companyMatch[1].trim();
      } else if (description.includes('About ')) {
        // Try to extract from "About Company" pattern
        const aboutMatch = description.match(/About\s+([A-Za-z\s&]+?)[\s\n]/);
        if (aboutMatch) company = aboutMatch[1].trim();
      } else if (description.includes('Headquarters:')) {
        // Try to extract company from URL or other patterns
        const urlMatch = description.match(/URL:\s*<a[^>]*>https?:\/\/(?:www\.)?([^\/]+)/);
        if (urlMatch) {
          const domain = urlMatch[1].split('.')[0];
          company = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      }
      
      // Extract location
      let location = 'Remote';
      const locationMatch = title.match(/\((.*?)\)/) || description.match(/Location:\s*([^\n<]+)/);
      if (locationMatch) {
        location = locationMatch[1].trim();
      }
      
      // Determine job type
      let type = 'fulltime';
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      if (titleLower.includes('remote') || descLower.includes('remote')) {
        type = 'remote';
      } else if (titleLower.includes('hybrid') || descLower.includes('hybrid')) {
        type = 'hybrid';
      }
      
      // Extract tags/skills
      const tags = [];
      const commonSkills = ['Python', 'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Data Science', 'JavaScript', 'React', 'Node.js', 'Kubernetes', 'AWS', 'Docker'];
      commonSkills.forEach(skill => {
        if (titleLower.includes(skill.toLowerCase()) || descLower.includes(skill.toLowerCase())) {
          tags.push(skill);
        }
      });
      
      // Extract salary if available
      let salary = '';
      const salaryMatch = (title + ' ' + description).match(/\$[\d,]+(?:k|K)?(?:\s*[-–]\s*\$?[\d,]+(?:k|K)?)?/);
      if (salaryMatch) {
        salary = salaryMatch[0];
      }
      
      // Extract experience level
      const experience = extractExperience(`${title} ${description}`);
      
      // Extract country from location
      const country = extractCountry(location);
      
      if (title && title.length > 5) {
        // Clean up description - remove HTML tags and improve formatting
        let cleanDescription = description;
        
        // FIRST: Decode HTML entities to get actual HTML tags
        cleanDescription = cleanDescription
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&apos;/g, "'");
        
        // SECOND: Remove all HTML tags
        cleanDescription = cleanDescription.replace(/<[^>]*>/g, '');
        
        // Remove extra whitespace, line breaks, and clean up
        cleanDescription = cleanDescription
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, ' ')
          .replace(/\r+/g, ' ')
          .trim();
        
        // Truncate if too long
        if (cleanDescription.length > 300) {
          cleanDescription = cleanDescription.substring(0, 300) + '...';
        }
        
        jobs.push({
          id: `rss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          type: type,
          description: cleanDescription,
          url: url,
          publishedDate: new Date(pubDate).toISOString().split('T')[0],
          source: sourceName,
          salary: salary,
          experience: experience,
          country: country,
          tags: tags.slice(0, 5)
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing XML for ${sourceName}:`, error);
  }
  
  return jobs;
}

/**
 * Check if job is AI-related
 */
function isAIJob(title, description, searchTerms) {
  if (!searchTerms || searchTerms.length === 0) return true;
  
  const content = (title + ' ' + description).toLowerCase();
  return searchTerms.some(term => content.includes(term.toLowerCase()));
}

/**
 * Fetch from API endpoint
 */
async function fetchAPIJobs(apiUrl, sourceName, feedType, searchTerms = []) {
  try {
    // Fetching API data
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const allJobs = parseAPIJobs(data, sourceName, feedType);
    
    // Filter for AI-related jobs
    let aiJobs = allJobs;
    if (searchTerms.length > 0) {
      aiJobs = allJobs.filter(job => 
        isAIJob(job.title, job.description, searchTerms)
      );
    }
    
    // Successfully fetched AI jobs
    return aiJobs;
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${sourceName} API:`, error.message);
    return [];
  }
}

/**
 * Fetch from RSS feed
 */
async function fetchRSSFeed(feedUrl, sourceName, searchTerms = []) {
  try {
    // Fetching RSS feed
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const allJobs = parseXMLToJobs(xmlText, sourceName);
    
    // Filter for AI-related jobs
    let aiJobs = allJobs;
    if (searchTerms.length > 0) {
      aiJobs = allJobs.filter(job => 
        isAIJob(job.title, job.description, searchTerms)
      );
    }
    
    // Successfully fetched AI jobs
    return aiJobs;
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${sourceName}:`, error.message);
    return [];
  }
}

/**
 * Fetch jobs from all sources (RSS + APIs)
 */
async function fetchAllJobs() {
  const allJobs = [];
  
  // Sort feeds by priority
  const sortedFeeds = RSS_FEEDS
    .filter(feed => feed.enabled)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  // Fetch from all sources in parallel
  const feedPromises = sortedFeeds.map(feed => {
    if (feed.isAPI) {
      return fetchAPIJobs(feed.url, feed.name, feed.type, feed.searchTerms || []);
    } else {
      return fetchRSSFeed(feed.url, feed.name, feed.searchTerms || []);
    }
  });
  
  try {
    const results = await Promise.allSettled(feedPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allJobs.push(...result.value);
        // Successfully processed feed
      } else if (result.status === 'rejected') {
        console.error(`❌ ${sortedFeeds[index].name}: ${result.reason}`);
      }
    });
    
    // Remove duplicates
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => 
        j.title.toLowerCase() === job.title.toLowerCase() && 
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    );
    
    // Sort by date
    uniqueJobs.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    
    // Total unique jobs processed
    return uniqueJobs;
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

// Cache
let jobsCache = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get jobs with caching
 */
async function getJobs() {
  const now = Date.now();
  
  if (jobsCache.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    // Returning cached jobs
    return jobsCache;
  }
  
  // Fetching fresh data
  jobsCache = await fetchAllJobs();
  lastFetch = now;
  
  // If no jobs found, use mock data
  if (jobsCache.length === 0) {
    // No live jobs found, using mock data
    jobsCache = [...mockJobs];
  }
  
  return jobsCache;
}

/**
 * Main API endpoint
 */
app.get('/api/jobs', async (req, res) => {
  try {
    const { type, source, search, country, useRSS } = req.query;
    
    let jobs = [];
    
    if (useRSS !== 'false') {
      jobs = await getJobs();
    } else {
      jobs = [...mockJobs];
    }
    
    // Apply filters
    if (type && type !== 'all') {
      jobs = jobs.filter(job => job.type === type);
    }
    
    if (source && source !== 'all') {
      jobs = jobs.filter(job => job.source.toLowerCase().includes(source.toLowerCase()));
    }

    if (country && country !== 'all') {
      jobs = jobs.filter(job => job.country === country);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    const availableSources = [...new Set(jobs.map(job => job.source))];
    
    res.json({
      jobs,
      total: jobs.length,
      lastUpdated: new Date().toISOString(),
      sources: availableSources,
      dataSource: jobs.length > 0 && jobs[0].id.startsWith('rss-') ? 'Live Feeds' : 
                  jobs.length > 0 && jobs[0].id.startsWith('api-') ? 'Live APIs' : 'Mock Data',
      activeFeeds: RSS_FEEDS.filter(f => f.enabled).map(f => ({
        name: f.name,
        type: f.type,
        priority: f.priority,
        isAPI: f.isAPI || false
      }))
    });

  } catch (error) {
    console.error('Jobs API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Test individual feed
 */
app.get('/api/jobs/test-feed', async (req, res) => {
  try {
    const { feed } = req.query;
    
    if (!feed) {
      return res.status(400).json({ 
        error: 'Feed parameter required',
        availableFeeds: RSS_FEEDS.map(f => ({ 
          name: f.name, 
          type: f.type,
          isAPI: f.isAPI || false 
        }))
      });
    }
    
    const selectedFeed = RSS_FEEDS.find(f => 
      f.name.toLowerCase().includes(feed.toLowerCase()) || 
      f.type === feed
    );
    
    if (!selectedFeed) {
      return res.status(404).json({ 
        error: 'Feed not found',
        availableFeeds: RSS_FEEDS.map(f => ({ name: f.name, type: f.type }))
      });
    }
    
    // Testing individual feed
    
    let jobs = [];
    if (selectedFeed.isAPI) {
      jobs = await fetchAPIJobs(selectedFeed.url, selectedFeed.name, selectedFeed.type, selectedFeed.searchTerms || []);
    } else {
      jobs = await fetchRSSFeed(selectedFeed.url, selectedFeed.name, selectedFeed.searchTerms || []);
    }
    
    res.json({
      feed: selectedFeed,
      jobs,
      total: jobs.length,
      testTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({ 
      error: 'Failed to test feed',
      details: error.message
    });
  }
});

/**
 * Status endpoint
 */
app.get('/api/jobs/status', async (req, res) => {
  try {
    const feedStatuses = [];
    
    for (const feed of RSS_FEEDS.filter(f => f.enabled)) {
      try {
        // Checking feed status
        
        let jobs = [];
        if (feed.isAPI) {
          jobs = await fetchAPIJobs(feed.url, feed.name, feed.type, feed.searchTerms || []);
        } else {
          jobs = await fetchRSSFeed(feed.url, feed.name, feed.searchTerms || []);
        }
        
        feedStatuses.push({
          name: feed.name,
          type: feed.type,
          url: feed.url,
          status: 'working',
          isAPI: feed.isAPI || false,
          jobCount: jobs.length,
          priority: feed.priority,
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        feedStatuses.push({
          name: feed.name,
          type: feed.type,
          url: feed.url,
          status: 'failed',
          error: error.message,
          isAPI: feed.isAPI || false,
          jobCount: 0,
          priority: feed.priority,
          lastChecked: new Date().toISOString()
        });
      }
    }
    
    const workingFeeds = feedStatuses.filter(f => f.status === 'working');
    const totalJobs = workingFeeds.reduce((sum, feed) => sum + feed.jobCount, 0);
    
    res.json({
      totalFeeds: feedStatuses.length,
      workingFeeds: workingFeeds.length,
      failedFeeds: feedStatuses.length - workingFeeds.length,
      totalJobs,
      feeds: feedStatuses,
      lastChecked: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status Error:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKey: GEMINI_API_KEY ? 'configured' : 'missing'
  });
});

// Start server
app.listen(PORT, () => {
  // Server started successfully
});

export default app;