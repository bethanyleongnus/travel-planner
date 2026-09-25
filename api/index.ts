import express, { Request, Response } from 'express';
import { MCP_TOOLS_REGISTRY, MCP_TOOLS_METADATA } from '../mcp/plantrip-server.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// Status check (Never exposes any API key or secret token)
apiRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    server: 'plantrip-mcp-server',
    version: '1.0.0',
    toolsCount: MCP_TOOLS_METADATA.length,
    hasPlantripKey: Boolean(process.env.PLANTRIP_API_KEY),
    protocol: 'model-context-protocol/1.0',
    uptime: process.uptime()
  });
});

// List all 14 MCP tools
apiRouter.get('/mcp/tools', (_req: Request, res: Response) => {
  res.json({
    tools: MCP_TOOLS_METADATA
  });
});

// Call any MCP tool by name
apiRouter.post('/mcp/call', async (req: Request, res: Response) => {
  try {
    const { tool, arguments: toolArgs = {} } = req.body;
    if (!tool || typeof tool !== 'string') {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const handler = MCP_TOOLS_REGISTRY[tool];
    if (!handler) {
      return res.status(404).json({ error: `Tool "${tool}" not found in MCP registry` });
    }

    const result = await handler(toolArgs);
    return res.json({
      success: true,
      tool,
      result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Tool execution failed'
    });
  }
});

// Model Context Protocol JSON-RPC 2.0 handler (for MCP HTTP/SSE clients)
apiRouter.post('/mcp/rpc', async (req: Request, res: Response) => {
  const { jsonrpc = '2.0', id = 1, method, params = {} } = req.body;

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'plantrip-mcp-server', version: '1.0.0' }
      }
    });
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS_METADATA.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: { type: 'object', properties: {} }
        }))
      }
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs = {} } = params;
    const handler = MCP_TOOLS_REGISTRY[name];
    if (!handler) {
      return res.status(404).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool "${name}" not found` }
      });
    }

    try {
      const output = await handler(toolArgs);
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }]
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err?.message || 'Internal tool error' }
      });
    }
  }

  return res.status(400).json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method "${method}" not implemented` }
  });
});

// Convenient direct endpoint: POST /api/tools/:name
apiRouter.post('/tools/:name', async (req: Request, res: Response) => {
  const toolName = req.params.name;
  const handler = MCP_TOOLS_REGISTRY[toolName];
  if (!handler) {
    return res.status(404).json({ error: `Tool "${toolName}" not found` });
  }

  try {
    const result = await handler(req.body);
    return res.json({ success: true, tool: toolName, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed' });
  }
});

// Export default handler for Vercel Serverless Function entry (/api)
const app = express();
app.use(express.json());

// Handle both with /api prefix and without /api prefix for Vercel proxy compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback for unmatched API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.url}`,
    availableEndpoints: ['/api/status', '/api/mcp/tools', '/api/mcp/call', '/api/mcp/rpc', '/api/tools/:name']
  });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}

