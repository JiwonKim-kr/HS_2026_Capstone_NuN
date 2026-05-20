#!/usr/bin/env node
/**
 * Claude Desktop용 Stdio -> HTTP 프록시 (브릿지)
 * Claude Desktop은 아직 원격 HTTP 연결을 네이티브로 지원하지 않아,
 * 로컬에서 이 스크립트를 실행해 원격 서버와 HTTP로 통신하도록 중계합니다.
 */

const url = process.env.MCP_SERVER_URL || 'http://localhost:3001/mcp';
const apiKey = process.env.MCP_API_KEY || '';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'bridge_debug.log');
function logInfo(msg) { try { fs.appendFileSync(logFile, `[INFO] ${new Date().toISOString()} - ${msg}\n`); } catch(e){} }
function logError(msg, err) { try { fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} - ${msg}: ${err}\n`); } catch(e){} }

logInfo('Bridge started with URL: ' + url);

// Catch unhandled exceptions
process.on('uncaughtException', (err) => logError('Uncaught Exception', err));
process.on('unhandledRejection', (err) => logError('Unhandled Rejection', err));

// Stdio 스트림 처리
process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // 마지막의 완성되지 않은 라인은 남겨둠

  for (const line of lines) {
    if (!line.trim()) continue;
    logInfo('Received line from Claude: ' + line);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${apiKey}`
        },
        body: line
      });

      if (!response.ok) {
        logError(`HTTP Error: ${response.status} ${response.statusText}`);
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        // Return a JSON-RPC error so Claude Desktop doesn't hang
        try {
           const parsedLine = JSON.parse(line);
           if (parsedLine.id) {
             const errorResponse = {
               jsonrpc: "2.0",
               id: parsedLine.id,
               error: { code: -32000, message: `HTTP Error: ${response.status}` }
             };
             process.stdout.write(JSON.stringify(errorResponse) + '\n');
           }
        } catch(e) {}
        continue;
      }

      const responseText = await response.text();
      logInfo('Response from server: ' + responseText);
      // 서버가 SSE(text/event-stream) 형식으로 응답할 경우를 대비해 data만 추출
      const resLines = responseText.split('\n');
      for (const rl of resLines) {
        if (rl.startsWith('data: ')) {
          const dataPayload = rl.substring(6);
          logInfo('Sending to Claude: ' + dataPayload);
          process.stdout.write(dataPayload + '\n');
        }
      }
    } catch (error) {
      logError('Fetch error', error);
      console.error('Fetch error:', error);
    }
  }
});
