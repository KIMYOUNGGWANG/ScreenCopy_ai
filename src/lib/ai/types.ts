export interface AIProvider {
    generateCopy(params: GenerateCopyParams): Promise<GenerateCopyResult>
    refineText(params: RefineTextParams): Promise<string>
    analyzeImage(file: File): Promise<ImageAnalysisResult>
}

export interface GenerateCopyParams {
    file: File
    context: {
        appName: string
        category: string
        targetAudience: string
        tone: string
        description: string
        keywords: string
        language: string
        platform: string
    }
}

export interface GenerateCopyResult {
    generatedCopy: any
    imageUrl?: string
}

export interface RefineTextParams {
    text: string
    instruction: string
    context: string
}

export interface ImageAnalysisResult {
    appName: string
    category: string
    targetAudience: string
    tone: string
    description: string
    keywords: string
    accentColor: string
    suggestedLayout: string
}
