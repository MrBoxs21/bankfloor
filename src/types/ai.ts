export interface AIRequestBody {
  prompt: string
  modelName?: string
}

export interface AIResponse {
  content: string
}

export interface AIError {
  error: string
}
