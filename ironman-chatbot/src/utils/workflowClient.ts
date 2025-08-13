/**
 * Workflow Client Utilities
 * Optimized for n8n code nodes with better error handling and response processing
 */

export interface WorkflowMessage {
  message: string;
  timestamp?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowResponse {
  success: boolean;
  data?: any;
  error?: string;
  contentType?: string;
  audioBlob?: Blob;
  textResponse?: string;
}

export interface WorkflowClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Enhanced workflow client designed to work optimally with n8n code nodes
 */
export class WorkflowClient {
  private config: WorkflowClientConfig;
  private controller?: AbortController;

  constructor(config: WorkflowClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };
  }

  /**
   * Send message to workflow with enhanced error handling
   * Optimized for code node responses
   */
  async sendMessage(payload: WorkflowMessage): Promise<WorkflowResponse> {
    const { baseUrl, timeout, retries } = this.config;
    
    // Cancel any existing request
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();
    
    // Enhanced payload for code nodes
    const enhancedPayload = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      sessionId: payload.sessionId || this.generateSessionId(),
      nodeType: 'code', // Hint for workflow routing
    };

    for (let attempt = 1; attempt <= retries!; attempt++) {
      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Workflow-Type': 'code-node',
            ...this.config.headers,
          },
          body: JSON.stringify(enhancedPayload),
          signal: AbortSignal.timeout(timeout!),
        });

        return await this.processResponse(response);
      } catch (error) {
        console.warn(`Workflow request attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          return {
            success: false,
            error: `Failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
        
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    return {
      success: false,
      error: 'Maximum retries exceeded',
    };
  }

  /**
   * Process workflow response with enhanced content type detection
   * Designed for code node output patterns
   */
  private async processResponse(response: Response): Promise<WorkflowResponse> {
    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        contentType,
      };
    }

    // Handle audio responses (code nodes can return binary data)
    if (contentType.startsWith('audio/') || contentType.includes('octet-stream')) {
      try {
        const audioBlob = await response.blob();
        return {
          success: true,
          contentType,
          audioBlob,
          data: { type: 'audio', size: audioBlob.size },
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to process audio response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // Handle JSON responses (most common from code nodes)
    if (contentType.includes('application/json')) {
      try {
        const jsonData = await response.json();
        
        // Enhanced parsing for code node responses
        const textResponse = this.extractTextFromCodeNodeResponse(jsonData);
        
        return {
          success: true,
          contentType,
          data: jsonData,
          textResponse,
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // Handle text responses
    try {
      const textResponse = await response.text();
      return {
        success: true,
        contentType,
        textResponse,
        data: { text: textResponse },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process text response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Extract text response from various code node response patterns
   */
  private extractTextFromCodeNodeResponse(data: any): string {
    // Common patterns for code node responses
    if (typeof data === 'string') return data;
    if (data?.reply) return data.reply;
    if (data?.message) return data.message;
    if (data?.response) return data.response;
    if (data?.text) return data.text;
    if (data?.content) return data.content;
    if (data?.output) return data.output;
    if (data?.result) return data.result;
    
    // Handle nested data structures common in code nodes
    if (data?.data?.reply) return data.data.reply;
    if (data?.data?.message) return data.data.message;
    if (data?.data?.response) return data.data.response;
    
    // Handle arrays (code nodes might return multiple responses)
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === 'string') return firstItem;
      return this.extractTextFromCodeNodeResponse(firstItem);
    }
    
    // Fallback to JSON stringification
    return JSON.stringify(data);
  }

  /**
   * Upload file to workflow (for audio/multipart data)
   * Enhanced for code node file processing
   */
  async uploadFile(file: File | Blob, metadata?: Record<string, any>): Promise<WorkflowResponse> {
    const { baseUrl, timeout } = this.config;
    
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nodeType', 'code');
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'X-Workflow-Type': 'code-node',
          ...this.config.headers,
        },
        body: formData,
        signal: AbortSignal.timeout(timeout!),
      });

      return await this.processResponse(response);
    } catch (error) {
      return {
        success: false,
        error: `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Cancel any ongoing requests
   */
  cancel(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = undefined;
    }
  }

  /**
   * Generate unique session ID for workflow tracking
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a configured workflow client instance
 */
export const createWorkflowClient = (config: Partial<WorkflowClientConfig> = {}): WorkflowClient => {
  const defaultConfig: WorkflowClientConfig = {
    // Keep n8n URL server-side; route through Next API
    baseUrl: process.env.NEXT_PUBLIC_CHAT_API || '/api/chat',
    timeout: 30000,
    retries: 3,
    headers: {
      'User-Agent': 'JARVIS-ChatBot/1.0',
    },
  };

  return new WorkflowClient({ ...defaultConfig, ...config });
};

/**
 * Hook for workflow client with React state management
 */
export const useWorkflowClient = (config?: Partial<WorkflowClientConfig>) => {
  const client = createWorkflowClient(config);
  
  return {
    client,
    sendMessage: client.sendMessage.bind(client),
    uploadFile: client.uploadFile.bind(client),
    cancel: client.cancel.bind(client),
  };
};