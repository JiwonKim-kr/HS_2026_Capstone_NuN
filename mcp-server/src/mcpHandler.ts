import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { generatePromptCandidates } from './lib/services/aiService.js';
import { processFeedback } from './lib/services/feedbackService.js';
import { getUserSessions, getSessionDetails, deleteSession } from './lib/services/historyService.js';

export function createMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: 'prompt-u', version: '1.0.0' });

  // 1. generate_prompt
  server.tool(
    'generate_prompt',
    'Generate personalized prompt candidates from an original draft.',
    {
      originalInput: z.string().min(1).describe("The user's original draft prompt"),
      domain: z.string().optional().describe("Optional domain or context"),
    },
    async ({ originalInput, domain }) => {
      try {
        const result = await generatePromptCandidates({
          userId,
          originalInput,
          context: domain ? { domain } : undefined,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  // 2. submit_feedback
  server.tool(
    'submit_feedback',
    'Submit like/unlike feedback for a generated prompt candidate to update user preferences.',
    {
      logId: z.string().describe("The log ID of the prompt candidate (from generate_prompt response)"),
      targetLikeStatus: z.boolean().describe("true for like, false for unlike"),
      appliedTiers: z.record(z.string(), z.number()).describe("The tiers applied to this candidate, keyed by modality dimension (from generate_prompt response)"),
      targetModality: z.enum(['text', 'image', 'video', 'music']).optional().describe("The detected target modality (from generate_prompt response metadata)"),
    },
    async ({ logId, targetLikeStatus, appliedTiers, targetModality }) => {
      try {
        const result = await processFeedback({
          userId,
          historyId: logId,
          targetLikeStatus,
          appliedTiers,
          targetModality,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  // 3. list_history
  server.tool(
    'list_history',
    'List all previous prompt generation sessions for the user.',
    {},
    async () => {
      try {
        const result = await getUserSessions(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  // 4. get_session
  server.tool(
    'get_session',
    'Get detailed information and candidates for a specific session.',
    {
      sessionId: z.string().describe("The ID of the session"),
    },
    async ({ sessionId }) => {
      try {
        const result = await getSessionDetails(sessionId, userId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  // 5. delete_session
  server.tool(
    'delete_session',
    'Delete a specific session and its candidates.',
    {
      sessionId: z.string().describe("The ID of the session to delete"),
    },
    async ({ sessionId }) => {
      try {
        const result = await deleteSession(sessionId, userId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  return server;
}
