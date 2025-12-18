import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, GenerateCopyParams, GenerateCopyResult, RefineTextParams, ImageAnalysisResult } from './types'

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 3000

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  /**
   * Extracts JSON from Gemini's potentially messy text response
   */
  private extractJSON(text: string): any {
    // Try to find JSON in various formats
    const patterns = [
      // Standard markdown code block
      /```json\s*([\s\S]*?)\s*```/,
      // Code block without language
      /```\s*([\s\S]*?)\s*```/,
      // Raw JSON object
      /(\{[\s\S]*\})/,
      // Raw JSON array
      /(\[[\s\S]*\])/,
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        try {
          const cleaned = match[1].trim()
          return JSON.parse(cleaned)
        } catch {
          // Try next pattern
          continue
        }
      }
    }

    // Last resort: try parsing the whole text
    try {
      return JSON.parse(text.trim())
    } catch {
      console.error('Failed to extract JSON from Gemini response:', text.substring(0, 500))
      throw new Error('Gemini returned invalid JSON format')
    }
  }

  /**
   * Delays execution for a given time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Generates content with automatic retry and model fallback
   */
  private async generateWithFallback(
    modelName: string,
    prompt: string | Array<string | any>,
    fallbackModelName: string = "gemini-2.5-flash"
  ): Promise<string> {
    const models = [modelName, fallbackModelName]

    for (const currentModel of models) {
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          console.log(`Gemini: Trying ${currentModel} (attempt ${attempt}/${this.MAX_RETRIES})`)
          const model = this.client.getGenerativeModel({ model: currentModel })
          const result = await model.generateContent(prompt)
          const response = await result.response
          return response.text()
        } catch (error: any) {
          const isRetryable = error.status === 503 || error.status === 429
          console.warn(`Gemini ${currentModel} attempt ${attempt} failed:`, error.message)

          if (isRetryable && attempt < this.MAX_RETRIES) {
            console.log(`Retrying in ${this.RETRY_DELAY}ms...`)
            await this.delay(this.RETRY_DELAY * attempt) // Exponential backoff
            continue
          }

          // Not retryable or max retries reached, try next model
          break
        }
      }
    }

    throw new Error('All Gemini models failed after retries')
  }

  async generateCopy(params: GenerateCopyParams): Promise<GenerateCopyResult> {
    const { file, context } = params

    const arrayBuffer = await file.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')

    // Enhanced prompt with few-shot examples for Gemini
    const prompt = this.getSystemPrompt(context)
    const enhancedPrompt = `${prompt}

═══════════════════════════════════════════════════
📝 EXAMPLE OUTPUTS (Follow this EXACT format)
═══════════════════════════════════════════════════
${context.platform === 'app_store' ? `
EXAMPLE 1 (Fitness App):
[
  {"headline": "Track. Train. Transform.", "subtext": "Your journey starts here", "style": "power", "reasoning": "Power words for motivation"},
  {"headline": "1M+ Goals Crushed", "subtext": "Join winners", "style": "social_proof", "reasoning": "Social proof builds trust"}
]

EXAMPLE 2 (Finance App):
[
  {"headline": "Money. Simplified.", "subtext": "See where every dollar goes", "style": "power", "reasoning": "Direct and clear"},
  {"headline": "Save 5 hours/month", "subtext": "Automatic tracking", "style": "benefit", "reasoning": "Time-saving benefit"}
]` : `
EXAMPLE 1 (SaaS Product):
{
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "I wasted 6 months building something nobody wanted.",
      "key_message": "Validate before you build",
      "thread": [
        "I wasted 6 months building something nobody wanted.\\n\\nHere's what I learned:",
        "The mistake?\\n\\nI never talked to a single user.\\n\\nI just built what I thought was cool.",
        "Then I discovered user interviews.\\n\\n5 calls changed everything.",
        "Now? 2K users. $8K MRR.\\n\\nAll because I finally listened.",
        "My advice: Talk to users BEFORE you code.\\n\\nTry it → [link]"
      ]
    },
    {
      "day": "Wednesday",
      "theme": "Feature Deep-dive",
      "hook": "How I save 3 hours every week (with one simple trick)",
      "key_message": "Automation is freedom",
      "thread": [
        "How I save 3 hours every week (with one simple trick):",
        "I used to manually update spreadsheets.\\n\\nEvery. Single. Day.",
        "Now I use [ProductName].\\n\\nIt syncs automatically.",
        "The result?\\n\\n• 3 hours saved weekly\\n• Zero errors\\n• More time for what matters",
        "Want to try it?\\n\\n→ Free trial: [link]"
      ]
    },
    {
      "day": "Friday",
      "theme": "Social Proof",
      "hook": "From 0 to 1000 users in 30 days. Here's the playbook:",
      "key_message": "Consistency beats virality",
      "thread": [
        "From 0 to 1000 users in 30 days.\\n\\nHere's the playbook:",
        "Week 1: Posted daily.\\n\\nNo likes. No comments. Crickets.",
        "Week 2: One tweet went mini-viral.\\n\\n50 signups in a day.",
        "Week 4: 1000 users.\\n\\nThe secret? I just didn't quit.",
        "If you're building in public:\\n\\nKeep showing up.\\n\\nThe algorithm will find you."
      ]
    }
  ]
}`}

═══════════════════════════════════════════════════
🧠 THINKING PROCESS (You MUST do this internally)
═══════════════════════════════════════════════════
STEP 1 - ANALYZE: What makes this app unique? Who uses it?
STEP 2 - BRAINSTORM: Generate 5 different angles
STEP 3 - CRITIQUE: Is it too generic? Too corporate? Does it feel human?
STEP 4 - SELECT: Pick the most authentic, engaging version

⚠️ CRITICAL RULES:
1. Output ONLY valid JSON (no markdown, no explanation)
2. Be CREATIVE - do NOT copy the examples word-for-word
3. Sound like a real indie hacker, not a marketing department

Now analyze the screenshot and generate:`

    const content = [
      enhancedPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: file.type
        }
      }
    ]

    // Use gemini-3-flash-preview (latest) for quality + speed
    const text = await this.generateWithFallback("gemini-3-flash-preview", content)
    const generatedCopy = this.extractJSON(text)

    return { generatedCopy }
  }

  async refineText(params: RefineTextParams): Promise<string> {
    const { text, instruction, context } = params

    // Detect if Korean
    const isKorean = /[\uac00-\ud7af]/.test(text)

    const prompt = `
You are a Twitter ghostwriter specializing in #BuildInPublic content.
Your refined tweets get 2-3x more engagement.

ORIGINAL TWEET: "${text}"
INSTRUCTION: ${instruction}
CONTEXT: ${context || 'General'}

═══════════════════════════════════════════════════
📏 RULES (MUST FOLLOW)
═══════════════════════════════════════════════════
1. Max 240 characters (strict limit)
2. Keep core meaning and tone
3. No hashtags unless requested
4. No emojis unless requested
5. ${isKorean ? '한국어 인디해커 톤: 반말, 짧은 문장, 솔직함' : 'Indie hacker voice: humble, authentic, punchy'}

═══════════════════════════════════════════════════
📝 EXAMPLES (FOLLOW THIS STYLE)
═══════════════════════════════════════════════════
${isKorean ? `
BEFORE: "저는 지난 몇 달 동안 앱을 만들고 있었고 드디어 출시할 준비가 된 것 같습니다."
AFTER: "6개월 밤샘 코딩.

오늘 드디어 런칭."

BEFORE: "이 기능을 추가하면 사용자들이 정말 좋아할 것 같아요."
AFTER: "유저한테 물어봄.

다들 이거 원한대.

바로 만들었음."

BEFORE: "오늘 처음으로 유료 사용자가 생겼습니다. 정말 기쁘네요."
AFTER: "첫 유료 고객.

솔직히 울뻔.

이제 시작이다."
` : `
BEFORE: "I've been working on my app for the past few months and I think it's finally ready to launch."
AFTER: "6 months of late nights.

Today, we ship."

BEFORE: "I'm really excited to share that we just hit 1000 users on our platform."
AFTER: "1000 users.

No ads. No funding. Just building."
`}

═══════════════════════════════════════════════════
🧠 THINKING (Do this internally)
═══════════════════════════════════════════════════
1. What's the core message?
2. What's weak about it?
3. Draft 3 versions, pick the best.

═══════════════════════════════════════════════════
📤 OUTPUT
═══════════════════════════════════════════════════
Return ONLY the refined tweet. No quotes. No explanation.
`

    const resultText = await this.generateWithFallback("gemini-3-flash-preview", prompt)
    return resultText.trim()
  }

  async analyzeImage(file: File): Promise<ImageAnalysisResult> {
    const arrayBuffer = await file.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')

    const prompt = `
You are an expert App Store Optimization (ASO) and UI/UX specialist.
Analyze this app screenshot and extract the following metadata to pre-fill a marketing form.

Fields to extract:
1. App Name: Look for the logo or header. If not found, infer a generic name or leave empty.
2. Category: Choose one from [productivity, game, social, health, education, business, other].
3. Target Audience: Infer who would use this app (e.g., "Fitness enthusiasts", "Students", "Project Managers").
4. Tone: Infer the brand voice from the UI style [professional, casual, playful, inspirational].
5. Description: A 1-sentence summary of what the app does.
6. Keywords: 5-7 relevant ASO keywords (comma separated).
7. Accent Color: Extract the dominant brand color from the UI (buttons, headers, logos). Return as Hex Code (e.g., "#FF5733").
8. Suggested Layout: Based on the screenshot density, suggest the best layout for a marketing card:
   - "bento": If the screen has many distinct feature blocks.
   - "device": If the screen is a clean, single view (best for wrapping in a phone frame).
   - "viral": If the screen is text-heavy or simple (best for typography focus).

═══════════════════════════════════════════════════
📝 EXAMPLE OUTPUT (for a todo/task app):
═══════════════════════════════════════════════════
{
  "appName": "TaskFlow",
  "category": "productivity",
  "targetAudience": "Busy professionals seeking simple task management",
  "tone": "professional",
  "description": "A minimalist task manager that helps you focus on what matters",
  "keywords": "todo, task manager, productivity, checklist, planner, GTD, focus",
  "accentColor": "#6366F1",
  "suggestedLayout": "device"
}

═══════════════════════════════════════════════════
📤 OUTPUT FORMAT (JSON ONLY - NO OTHER TEXT)
═══════════════════════════════════════════════════
{
  "appName": "string",
  "category": "string",
  "targetAudience": "string",
  "tone": "string",
  "description": "string",
  "keywords": "string",
  "accentColor": "#HexCode",
  "suggestedLayout": "bento|device|viral"
}

IMPORTANT: Output ONLY the JSON. No markdown code blocks. No explanation.
`

    const content = [
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: file.type
        }
      }
    ]

    // Use gemini-3-flash-preview for fastest image analysis
    const text = await this.generateWithFallback("gemini-3-flash-preview", content)
    return this.extractJSON(text)
  }

  private getSystemPrompt(context: GenerateCopyParams['context']): string {
    const { appName, category, targetAudience, tone, description, keywords, language, platform } = context
    const isKorean = language?.toLowerCase().includes('korean') || language?.toLowerCase().includes('한국어')

    const commonContext = `
CONTEXT:
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- App Description: ${description}
- Keywords: ${keywords || 'None'}
- Language: ${language || 'English'}
`

    if (platform === 'app_store') {
      return `
You are a senior App Store Optimization (ASO) specialist who has worked on 500+ top-charting apps.
Your copy has achieved 40%+ conversion rate improvements for apps like Calm, Headspace, and Notion.

${commonContext}

═══════════════════════════════════════════════════
📏 CHARACTER LIMITS (CRITICAL - MUST FOLLOW)
═══════════════════════════════════════════════════
${isKorean ? `
- Headline: 최대 15자 (공백 포함)
- Subtext: 최대 30자 (공백 포함)
- 모든 텍스트는 한국어로 작성
` : `
- Headline: Max 30 characters (including spaces)
- Subtext: Max 60 characters (including spaces)
- All text in ${language || 'English'}
`}

═══════════════════════════════════════════════════
🎯 CATEGORY BENCHMARKS (Match This Quality)
═══════════════════════════════════════════════════
${category === 'productivity' ? '- Reference: Notion ("Your wiki, docs, & projects"), Todoist ("Organize your life"), Things 3 ("Get things done")' :
          category === 'game' ? '- Reference: Candy Crush ("Sweet!"), Clash Royale ("Enter the Arena"), Genshin Impact ("Open World Adventure")' :
            category === 'health' ? '- Reference: Calm ("Sleep more. Stress less."), Headspace ("Be kind to your mind"), MyFitnessPal ("Reach your goals")' :
              category === 'social' ? '- Reference: Instagram ("Capture and Share"), BeReal ("Your friends for real"), Threads ("Say more")' :
                category === 'education' ? '- Reference: Duolingo ("Learn for free. Forever."), Khan Academy ("You can learn anything"), Quizlet ("Study smarter")' :
                  category === 'business' ? '- Reference: Slack ("Where work happens"), Zoom ("Meet happy"), Notion ("All-in-one workspace")' :
                    '- Reference: Match the premium quality of top 10 apps in this category'}

═══════════════════════════════════════════════════
📱 SAFE ZONE RULES
═══════════════════════════════════════════════════
- TOP: Avoid top 12% (Dynamic Island / Status Bar area)
- BOTTOM: Avoid bottom 8% (Home indicator area)
- Best zones: "top" (below status bar), "center", "bottom" (above home indicator)
- For busy screenshots: Use "split" layout (headline top, subtext bottom)

═══════════════════════════════════════════════════
✍️ 5 VARIATIONS (EACH MUST BE DISTINCTLY DIFFERENT)
═══════════════════════════════════════════════════
1. POWER: Bold, confident, 3-5 words. ("Master your finances" / "Think. Plan. Do.")
2. BENEFIT: Clear value proposition. ("Save 3 hours daily" / "Sleep better tonight")
3. SOCIAL PROOF: Numbers or rankings. ("#1 Productivity App" / "10M+ happy users")
4. FEATURE: Highlight key capability. ("AI-powered summaries" / "Offline mode included")
5. EMOTIONAL: Address pain point. ("Finally, peace of mind" / "No more forgotten tasks")

═══════════════════════════════════════════════════
🚫 BANNED PHRASES (Never use these)
═══════════════════════════════════════════════════
- "Revolutionary", "Game-changer", "Best app ever"
- "Download now", "Try today" (too generic)
- "Amazing", "Awesome", "Incredible" (empty adjectives)

═══════════════════════════════════════════════════
📤 OUTPUT FORMAT (JSON ARRAY - EXACTLY 5 ITEMS)
═══════════════════════════════════════════════════
[
  {
    "headline": "Max ${isKorean ? '15' : '30'} chars headline",
    "subtext": "Max ${isKorean ? '30' : '60'} chars supporting text",
    "style": "power|benefit|social_proof|feature|emotional",
    "layout": "top|bottom|center|split",
    "color_hex": "#FFFFFF (high contrast with screenshot)",
    "aso_score": 85,
    "benchmark_ref": "Inspired by [App Name]'s style",
    "reasoning": "Why this works for ${targetAudience}"
  }
]

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation.
Verify each headline is under ${isKorean ? '15' : '30'} characters before responding.
`
    } else {
      return `
You are "ThreadMaster", the lead ghostwriter at a top-tier Twitter agency.
You've written viral threads for 50+ indie hackers with 100K+ followers.
Your threads have generated $2M+ in product revenue.

${commonContext}

═══════════════════════════════════════════════════
🎭 INTERNAL AGENTS (Work sequentially in your mind)
═══════════════════════════════════════════════════
1. WRITER AGENT: Draft raw content based on the screenshot and context.
   - Focus on authenticity and storytelling
   - Extract the core value proposition
   
2. EDITOR AGENT: Refine the draft for maximum engagement.
   - Shorten sentences (max 15 words each)
   - Add line breaks for readability
   - Ensure each tweet stands alone but connects to the next
   - Remove ALL fluff words

After both agents complete, output the final polished version.

═══════════════════════════════════════════════════
📏 CHARACTER LIMITS (STRICT - VERIFY BEFORE OUTPUT)
═══════════════════════════════════════════════════
${isKorean ? `
- Hook: 최대 50자 (스크롤 멈추게 하는 한 줄)
- 개별 트윗: 최대 240자
- 모든 텍스트: 한국어/반말 (친근하게)
` : `
- Hook: Max 50 characters (scroll-stopping)
- Individual tweets: Max 240 characters
- Language: ${language || 'English'}
`}

═══════════════════════════════════════════════════
🎣 HOOK GENERATOR (Choose ONE pattern per day)
═══════════════════════════════════════════════════
MONDAY (Origin Story) - Create curiosity gap:
• "I spent [X hours] on [thing]. Here's what happened:"
• "Everyone said [X] was impossible. They were wrong."
• "[Old way] was killing me. Then I found this:"
Key Points: Personal story, vulnerability, transformation

WEDNESDAY (Feature Focus) - Provide immediate value:
• "How I [result] with just [simple action]:"
• "[Number] ways to [benefit] (most miss #3):"
• "The secret to [outcome] isn't what you think:"
Key Points: Practical tips, specific numbers, actionable advice

FRIDAY (Vision/Proof) - Inspire and validate:
• "[X] users in [Y] days. Here's the playbook:"
• "What I learned after [milestone]:"
• "The future of [category] looks like this:"
Key Points: Social proof, lessons learned, future vision

═══════════════════════════════════════════════════
🔗 THREAD STRUCTURE (Each tweet has a purpose)
═══════════════════════════════════════════════════
Tweet 1 (HOOK): Scroll-stopper. Create curiosity.
  → Key Point: Make them NEED to read more

Tweet 2 (PROBLEM): The pain point or old way.
  → Key Point: Relatable struggle they recognize

Tweet 3 (SOLUTION): Your app/approach.
  → Key Point: Simple, clear value proposition

Tweet 4 (RESULT): Proof or benefit.
  → Key Point: Specific outcome or data point

Tweet 5 (CTA): Clear next step.
  → Key Point: Single, simple action to take

═══════════════════════════════════════════════════
🚫 BANNED (Editor Agent removes these)
═══════════════════════════════════════════════════
- "Revolutionary", "Game-changer", "Unleash", "Elevate"
- "Excited to share", "Thrilled to announce", "Dive in"
- "Leverage", "Synergy", "Empower", "Best-in-class"
- More than 2 emojis per tweet
- Sentences over 15 words
- Passive voice

═══════════════════════════════════════════════════
✅ VOICE GUIDE (Indie Hacker Authentic)
═══════════════════════════════════════════════════
- Humble: "Still learning, but here's what works..."
- Vulnerable: "I almost quit when..."
- Data-driven: "Day 30: 500 users, $2K MRR"
- Punchy: Short. Clear. Impact.

Example good tweet:
"I spent 3 months building the wrong thing.

Then I talked to users.

Everything changed."

═══════════════════════════════════════════════════
📤 OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════════════════════════
{
  "design_config": {
    "accent_color": "#HexFromScreenshot",
    "suggested_layout": "bento"
  },
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "Max 50 chars - curiosity gap",
      "key_message": "One sentence summary of the thread's core message",
      "thread": [
        "Tweet 1: Hook that stops the scroll",
        "Tweet 2: The problem/struggle",
        "Tweet 3: The solution (${appName})",
        "Tweet 4: The result/proof",
        "Tweet 5: CTA with link placeholder"
      ]
    },
    {
      "day": "Wednesday",
      "theme": "Feature Deep-dive",
      "hook": "How-to style hook",
      "key_message": "Core takeaway",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    },
    {
      "day": "Friday",
      "theme": "Social Proof / Vision",
      "hook": "Aspirational hook",
      "key_message": "Core takeaway",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }
  ]
}

═══════════════════════════════════════════════════
✔️ SELF-CHECK (Before returning, verify ALL)
═══════════════════════════════════════════════════
□ Every tweet under 240 characters
□ Every hook under 50 characters
□ No banned words used
□ Each tweet has a clear purpose
□ Threads are genuinely different from each other
□ CTA is specific and actionable

Return ONLY the JSON. No markdown blocks. No explanation.
`
    }
  }
}
