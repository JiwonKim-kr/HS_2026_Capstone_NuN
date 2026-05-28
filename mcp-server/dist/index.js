import express from 'express';
import helmet from 'helmet';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcpHandler.js';
import { verifyApiKey } from './auth/verifyApiKey.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
// 보안 헤더 (X-Frame-Options, X-Content-Type-Options, HSTS 등)
app.use(helmet());
// 요청 body 크기 1 MB로 제한 (대용량 payload 공격 방어)
app.use(express.json({ limit: '1mb' }));
app.post('/mcp', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error handling MCP request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Prompt-U MCP Server is running on port ${PORT}`);
});
