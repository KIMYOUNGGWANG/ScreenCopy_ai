import { AIProvider, GenerateCopyParams, GenerateCopyResult, RefineTextParams, ImageAnalysisResult } from './types'
import { GeminiProvider } from './gemini'
import { AnthropicProvider } from './anthropic'

export class HybridProvider implements AIProvider {
    private gemini: GeminiProvider
    private anthropic: AnthropicProvider

    constructor() {
        this.gemini = new GeminiProvider()
        this.anthropic = new AnthropicProvider()
    }

    /**
     * Uses Claude (Anthropic) for high-quality copy generation
     */
    async generateCopy(params: GenerateCopyParams): Promise<GenerateCopyResult> {
        console.log('🔍 Hybrid Provider: Delegating generateCopy to Claude (Anthropic)...')
        return this.anthropic.generateCopy(params)
    }

    /**
     * Uses Claude (Anthropic) for nuanced text refinement
     */
    async refineText(params: RefineTextParams): Promise<string> {
        console.log('🔍 Hybrid Provider: Delegating refineText to Claude (Anthropic)...')
        return this.anthropic.refineText(params)
    }

    /**
     * Uses Gemini for cost-effective image analysis
     */
    async analyzeImage(file: File): Promise<ImageAnalysisResult> {
        console.log('🔍 Hybrid Provider: Delegating analyzeImage to Gemini...')
        return this.gemini.analyzeImage(file)
    }
}
