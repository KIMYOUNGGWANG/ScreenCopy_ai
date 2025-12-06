import { AIProvider } from './types'
import { AnthropicProvider } from './anthropic'
import { GeminiProvider } from './gemini'

import { HybridProvider } from './hybrid'

export function getAIClient(): AIProvider {
    const provider = process.env.AI_PROVIDER?.toLowerCase()

    if (provider === 'gemini') {
        return new GeminiProvider()
    }

    if (provider === 'hybrid') {
        return new HybridProvider()
    }

    // Default to Anthropic
    return new AnthropicProvider()
}
