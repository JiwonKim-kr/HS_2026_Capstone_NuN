import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcpHandler.js';
import { verifyApiKey } from './auth/verifyApiKey.js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  methods: ['POST'],
}));
app.use(express.json({ limit: '64kb' }));

const mcpLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

app.post('/mcp', mcpLimiter, async (req, res) => {
  try {
    const userId = await verifyApiKey(req.headers['authorization'] ?? '');
    if (!userId) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const server = createMcpServer(userId);
    // @modelcontextprotocol/sdk 1.x version requires a specific signature or no arguments
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Prompt-U MCP Server is running on port ${PORT}`);
});
