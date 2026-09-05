require('dotenv').config();
const { tools } = require('./tools/arogyaTools');

console.log('======================================================');
console.log(' ArogyaGrid Model Context Protocol (MCP) Server v1.0.0');
console.log('======================================================');
console.log(`Registered Tools (${tools.length}):`);
tools.forEach(t => console.log(` - ${t.name}: ${t.description.substring(0, 60)}...`));

// Simple stdio JSON-RPC interface
process.stdin.on('data', async (data) => {
  try {
    const msg = JSON.parse(data.toString().trim());
    if (msg.method === 'tools/list') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools } }) + '\n');
    } else if (msg.method === 'tools/call') {
      const tool = tools.find(t => t.name === msg.params.name);
      if (!tool) {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Tool not found' } }) + '\n');
      } else {
        const result = await tool.handler(msg.params.arguments || {});
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } }) + '\n');
      }
    }
  } catch (err) {
    // Ignore malformed input
  }
});

console.log('MCP Server ready for AI Agent connections over Stdio / SSE.');
