import type { GoogleGenAI } from '@google/genai';

export class GoogleGenAIClient {
  private client: GoogleGenAI | null = null;
  private modelName: string;
  private projectId: string;
  private region: string;

  constructor(modelName: string = 'gemini-3.0-flash', projectId: string, region: string) {
    // Validate required environment variables
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is required');
    }
    if (!region) {
      throw new Error('GCP_REGION environment variable is required');
    }
    
    this.modelName = modelName;
    this.projectId = projectId;
    this.region = region;
  }

  public async runModelWithObject(gcsUrl: string, prompt: string) {

    if (!this.client) {
      const { GoogleGenAI } = await import("@google/genai");
      this.client = new GoogleGenAI({ vertexai: true, project: this.projectId, location: this.region});
    }

    // Validate base64
    if (!gcsUrl || typeof gcsUrl !== 'string') {
      throw new Error('Invalid base64 provided');
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }


    try {
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                fileData: {
                  fileUri: gcsUrl,
                  mimeType: 'image/png'
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      });

      return response.text;
    } catch (error: any) {
      throw error;
    }
  }

  public async runTextOnlyModel(prompt: string, temperature: number = 0, maxTokens: number = 2000) {
    if (!this.client) {
      const { GoogleGenAI } = await import("@google/genai");
      this.client = new GoogleGenAI({ vertexai: true, project: this.projectId, location: this.region});
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json'
        }
      });

      return response;
    } catch (error: any) {
      throw error;
    }
  }
}