/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Unified API endpoint for all built-in AI tools
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

interface AIRequest {
  tool: 'n8n-builder' | 'agent-builder';
  data: any;
  config: {
    useCustomApi?: boolean;
    apiKey?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * Unified AI tools API endpoint
 * Handles all built-in tools through a single endpoint
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tool, data, config }: AIRequest = req.body;

    // Validate request
    if (!tool || !data || !config) {
      return res.status(400).json({ error: 'Tool, data, and config are required' });
    }

    // Get API key
    const apiKey = config.useCustomApi && config.apiKey 
      ? config.apiKey 
      : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured. Please provide your own API key or contact support.' 
      });
    }

    // Route to appropriate handler based on tool
    let result;
    switch (tool) {
      case 'n8n-builder':
        result = await handleN8nBuilder(data, config, apiKey);
        break;
      case 'agent-builder':
        result = await handleAgentBuilder(data, config, apiKey);
        break;
      default:
        return res.status(400).json({ error: 'Invalid tool specified' });
    }

    res.json(result);

  } catch (error) {
    console.error('AI Tools API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}

/**
 * Handle n8n Builder requests
 */
async function handleN8nBuilder(data: any, config: any, apiKey: string) {
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
    console.log('Failed to parse workflow JSON, creating fallback:', error instanceof Error ? error.message : String(error));
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
async function handleAgentBuilder(data: any, config: any, apiKey: string) {
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
    console.log('Failed to parse agent JSON, creating fallback:', error instanceof Error ? error.message : String(error));
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



