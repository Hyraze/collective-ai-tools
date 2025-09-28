/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Unified API endpoint for all built-in AI tools
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

interface AIRequest {
  tool: 'text-summarizer' | 'code-reviewer' | 'n8n-builder' | 'agent-builder';
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

/**
 * Handle Text Summarizer requests
 */
async function handleTextSummarizer(data: any, config: any, apiKey: string) {
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
async function handleCodeReviewer(data: any, config: any, apiKey: string) {
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
    console.log('Failed to parse JSON, falling back to text parsing:', error instanceof Error ? error.message : String(error));
    results = parseCodeAnalysis(analysis);
  }

  return { results };
}

/**
 * Parse AI analysis into structured results
 */
function parseCodeAnalysis(analysis: string) {
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
            (currentResult as any).line = lineNum;
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
