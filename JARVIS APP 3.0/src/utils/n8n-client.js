const axios = require('axios');
require('dotenv').config();

const n8nClient = axios.create({
    baseURL: process.env.N8N_BASE_URL || 'http://localhost:5678',
    headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Content-Type': 'application/json'
    }
});

async function executeN8nWorkflow(command) {
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        
        const response = await n8nClient.post(webhookUrl, {
            command: command.text,
            context: command.context,
            timestamp: new Date().toISOString()
        });
        
        return response.data;
    } catch (error) {
        console.error('n8n workflow execution error:', error);
        throw new Error('Failed to execute workflow');
    }
}

async function getWorkflowStatus(workflowId) {
    try {
        const response = await n8nClient.get(`/workflows/${workflowId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get workflow status:', error);
        throw error;
    }
}

module.exports = {
    executeN8nWorkflow,
    getWorkflowStatus
};