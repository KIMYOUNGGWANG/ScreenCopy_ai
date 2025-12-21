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

    // Use gemini-3-flash (latest, released 2025.12.17) for quality + speed
    let generatedCopy = null
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      const text = await this.generateWithFallback("gemini-3-flash", content)
      generatedCopy = this.extractJSON(text)

      // Validate quality
      const validation = this.validateCopyQuality(generatedCopy, context)
      if (validation.passed) {
        break
      }

      // Log validation issues and retry
      console.warn(`Copy validation failed (attempt ${attempts + 1}):`, validation.issues)
      attempts++

      if (attempts >= maxAttempts) {
        console.warn('Max validation attempts reached, using last generated copy')
      }
    }

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

    const resultText = await this.generateWithFallback("gemini-3-flash", prompt)
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

    // Use gemini-3-flash for fastest image analysis
    const text = await this.generateWithFallback("gemini-3-flash", content)
    return this.extractJSON(text)
  }

  private getSystemPrompt(context: GenerateCopyParams['context']): string {
    const { appName, category, targetAudience, tone, description, keywords, language, platform } = context
    const isKorean = language?.toLowerCase().includes('korean') || language?.toLowerCase().includes('한국어')

    if (platform === 'app_store') {
      return `<role>
You are a world-class App Store copywriter who has worked on 500+ top-charting apps.
Your copy has achieved 40%+ conversion rate improvements for apps like Calm, Headspace, and Notion.
</role>

<mission>
Write headlines that make users TAP "Download" within 3 seconds of seeing the screenshot.
Your copy should create an emotional response, not just describe features.
</mission>

<app_context>
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Description: ${description}
- Keywords: ${keywords || 'None'}
- Language: ${language || 'English'}
</app_context>

<constraints>
${isKorean ? `
- Headline: 최대 15자 (공백 포함) - 절대 초과 금지
- Subtext: 최대 30자 (공백 포함)
- 모든 텍스트: 한국어로 작성 (번역투 금지)
` : `
- Headline: Max 30 characters (including spaces) - STRICT
- Subtext: Max 60 characters (including spaces)
- All text in ${language || 'English'}
`}
- Layout: top|center|bottom|split (avoid Dynamic Island/Home indicator areas)
</constraints>

<golden_examples>
${isKorean ? `
// 🏆 실제 1위 한국 앱들의 카피 (이 수준을 목표로)
- 토스: "금융의 모든 것" (7자) + "숨은 돈 찾기, 용돈 기입장, 무료 송금"
- 당근: "우리 동네 중고거래" (9자) + "믿을만한 이웃 간 중고거래"
- 배민: "배달은 역시" (6자) + "1등 배달앱"
- 카카오맵: "찾아줌, 길도 사람도" (10자)
- 쿠팡: "로켓배송" (4자) + "새벽배송, 당일배송"
- 무신사: "패션 쇼핑" (5자) + "10대부터 30대까지"

// ✅ 성공 패턴 분석
1. 초짧은 headline (5-10자가 베스트)
2. Subtext에 구체적인 가치 3개 나열
3. 불필요한 형용사 완전 제거
4. 숫자와 구체성으로 신뢰 확보
` : `
// 🏆 Real top-charting apps (match this quality)
- Notion: "Your wiki, docs & projects. Together." (Power + Benefit)
- Calm: "Sleep more. Stress less." (Dual benefit, rhythmic)
- Duolingo: "Learn a language for free. Forever." (Benefit + Proof)
- Slack: "Where work happens" (Simple power statement)
- Headspace: "Be kind to your mind" (Emotional appeal)
- Todoist: "Organize your life" (Clear benefit)
- Things 3: "Get things done" (Action-oriented)
- Bear: "Write beautifully" (Aspirational)

// ✅ Pattern analysis
1. Sub-10 word headlines that stick
2. Concrete benefits, not abstract promises
3. Rhythm and cadence matter ("Sleep more. Stress less.")
4. No qualifiers or empty adjectives
5. Period for emphasis. Line breaks for drama.
`}
</golden_examples>

<anti_patterns>
${isKorean ? `
❌ 절대 피해야 할 것들:
- "혁신적인 앱" ← 공허한 수식어, 증명 불가
- "최고의 생산성 도구" ← 모든 앱이 이렇게 말함
- "지금 다운로드하세요" ← 너무 pushy
- "새롭게 출시된" ← 유저에게 가치 없는 정보
- "놀라운 기능" ← 구체성 없음
- "~입니다", "~합니다" ← 번역투, 부자연스러움

✅ 이렇게 바꾸세요:
- "혁신적인" → "3배 빠른" (숫자 사용)
- "시간 절약" → "30분 절약" (구체적 결과)
- "쉬운 사용" → "3탭이면 끝" (행동 중심)
` : `
❌ NEVER use these:
- "Revolutionary app" ← empty adjective, unprovable
- "Best productivity tool" ← every app says this
- "Download now" ← too pushy
- "Newly launched" ← no value info
- "Amazing features" ← says nothing
- "Check it out" ← weak call to action

✅ Replace with:
- "Revolutionary" → "3x faster" (use numbers)
- "Save time" → "Save 30 min/day" (specific outcome)
- "Easy to use" → "3 taps to done" (action-focused)
- "Great features" → "AI summaries in 10 sec" (specific)
`}
</anti_patterns>

<writing_philosophy>
${isKorean ? `
좋은 카피 = 유저가 "이거 나한테 필요해"라고 느끼는 순간

원칙:
1. 숫자 > 형용사 (항상)
2. Before/After 구조 활용 ("혼란에서 명확하게")
3. 친구한테 말하듯 자연스럽게 (반말 OK)
4. 한 headline = 한 가지 아이디어만
5. 2초 안에 이해 안 되면 실패
` : `
Great copy = User sees their own problem and feels "I need this"

Principles:
1. Numbers > Adjectives (always)
2. Use Before/After structure ("From chaos to clarity")
3. Write like you're texting a friend
4. One headline = One clear idea
5. If it takes more than 2 seconds to understand, it fails
6. Specificity builds trust
`}
</writing_philosophy>

<category_benchmarks>
${category === 'productivity' ? 'Study: Notion, Todoist, Things 3, Bear, Craft - clean, minimal, action words' :
          category === 'game' ? 'Study: Candy Crush, Clash Royale, Genshin - excitement, rewards, adventure' :
            category === 'health' ? 'Study: Calm, Headspace, Noom, MyFitnessPal - wellness, aspirational, gentle' :
              category === 'social' ? 'Study: Instagram, BeReal, Threads, Discord - community, connection, FOMO' :
                category === 'education' ? 'Study: Duolingo, Khan Academy, Quizlet - growth, progress, achievement' :
                  category === 'business' ? 'Study: Slack, Zoom, Notion, Monday - efficiency, team, simplicity' :
                    category === 'finance' ? 'Study: 토스, Mint, YNAB, Robinhood - trust, clarity, smart money' :
                      'Study: Top 10 apps in your category for tone and length benchmarks'}

// 🎯 카테고리별 참고 앱 (${category}):
${this.getCategoryExamples(category, isKorean)}
</category_benchmarks>

<output_format>
Return a JSON array with EXACTLY 5 variations. Each must feel COMPLETELY DIFFERENT.

[
  {
    "headline": "${isKorean ? '최대 15자' : 'max 30 chars'}",
    "subtext": "${isKorean ? '최대 30자, headline을 보완 (반복 금지)' : 'max 60 chars, complements headline (no repetition)'}",
    "style": "power|benefit|social_proof|feature|emotional",
    "layout": "top|center|bottom|split",
    "color_hex": "#FFFFFF (high contrast with screenshot)",
    "aso_score": 85,
    "benchmark_ref": "${isKorean ? '[앱이름] 스타일 참고' : 'Inspired by [App Name]'}",
    "reasoning": "${isKorean ? '이 카피가 효과적인 이유 (심리적 트리거, 타겟 분석 포함) - 최소 2문장' : 'Why this works: psychological triggers, keyword strategy - minimum 2 sentences'}"
  }
]

CRITICAL:
- "reasoning" field MUST be detailed (2+ sentences). Explain the psychology.
- Start with '[' character. No markdown. No preamble.
- Verify EVERY headline is under ${isKorean ? '15' : '30'} characters before responding.
</output_format>`
    } else {
      return `<role>
You are "ThreadMaster", the lead ghostwriter at a top-tier Twitter agency.
You've written viral threads for 50+ indie hackers with 100K+ followers.
Your threads have generated $2M+ in product revenue.
</role>

<mission>
Write threads that make indie hackers STOP scrolling and click "Follow".
Not corporate announcements. Real human stories that feel authentic.
</mission>

<app_context>
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Description: ${description}
- Keywords: ${keywords || 'None'}
- Language: ${language || 'English'}
</app_context>

<constraints>
${isKorean ? `
- Hook: 최대 50자 (스크롤 멈추게 하는 한 줄)
- 개별 트윗: 최대 240자
- 모든 텍스트: 한국어/반말 (친근하게, "~했음", "~함", "ㄹㅇ")
- 이모지: 트윗당 2개 이하
` : `
- Hook: Max 60 characters (scroll-stopping)
- Individual tweets: Max 240 characters (aim for 150-200 for readability)
- No sentence over 15 words
- Max 2 emojis per tweet
- Language: ${language || 'English'}
`}
</constraints>

<viral_examples>
${isKorean ? `
// 🔥 실제 바이럴 한국 스레드

"6개월간 야간 코딩.

오늘 드디어 런칭.

근데 유저 0명.

뭐가 문제였을까? (thread)"

→ 후킹: 실패 고백 + 호기심 자극


"투자 안 받음.
마케팅 안 함.
그냥 유저 10명이랑 매일 통화함.

3개월 후 100만원 MRR.

방법 공개함:"

→ 역설 + 구체적 숫자


"아이디어 있음 → 코딩함 → 출시함 → 망함.

이걸 3번 반복함.

4번째는 달랐음.

뭘 바꿨냐면:"

→ 패턴 깨기 + 학습 스토리
` : `
// 🔥 Real viral threads

"Built in public for 6 months.

Launched today.

0 customers.

Here's what I learned: (thread)"

→ Vulnerability hook + curiosity gap. 10K+ likes.


"No investors.
No ads.
Just talked to 10 users every day.

3 months later: $5K MRR.

The playbook:"

→ Contrarian + specific numbers. 5K+ retweets.


"I made $100K from a side project.

Total marketing spend: $0

Here's exactly how: (thread)"

→ Proof + curiosity. Massive engagement.
`}
</viral_examples>

<anti_patterns>
${isKorean ? `
❌ 피해야 할 것들:
- "출시하게 되어 기쁩니다" ← 너무 formal, 번역투
- "혁신적인 기능" ← 공허한 수식어
- 3줄 이상의 긴 트윗 ← 집중력 저하
- "소개합니다" ← 번역투
- "함께해요" ← 오글거림

✅ 대신 이렇게:
- "6개월 삽질함. 근데 결국:" ← 솔직함
- "유저 5명한테 물어봤더니" ← 구체적
- 한 문장 = 한 줄 ← 가독성
` : `
❌ Avoid:
- "Excited to announce" ← corporate speak
- "Revolutionary feature" ← empty adjective
- 3+ line tweets ← attention span killer
- "I'm thrilled to share" ← LinkedIn energy
- "Check out our website" ← weak CTA
- "Let's dive in" ← overused

✅ Instead:
- "6 months of building in the dark. Then:" ← vulnerability
- "Asked 5 users. They all said:" ← specific
- One sentence = One line ← readability
- "Try it free. No card needed. [link]" ← frictionless CTA
`}
</anti_patterns>

<thread_structure>
Tweet 1 (HOOK): Open a curiosity gap
  Bad: "I built an app"
  Good: "I quit my job with $0 in the bank. Here's what happened:"

Tweet 2 (PROBLEM): Make them nod
  Bad: "Productivity is hard"
  Good: "I was spending 3 hours/day in Notion. Just organizing."

Tweet 3 (SOLUTION): Show, don't tell
  Bad: "My app solves this"
  Good: "Built a tool. 30 min setup. Now I'm done in 20 minutes."

Tweet 4 (PROOF): Receipts
  Bad: "Users love it"
  Good: "Day 14: 50 users. Day 30: 500. Day 60: $2K MRR."

Tweet 5 (CTA): Frictionless
  Bad: "Check out our website"
  Good: "Try it free. No card needed. [link]"
</thread_structure>

<hook_patterns>
MONDAY (Origin Story) - Create curiosity gap:
- "[Time] spent on [thing]. Here is what happened:"
- "Everyone said [X] was impossible. They were wrong."
Key Points: Personal story, vulnerability, transformation

WEDNESDAY (Feature Focus) - Provide immediate value:
- "How I [result] with just [simple action]:"
- "[Number] ways to [benefit] (most miss #3):"
Key Points: Practical tips, specific numbers, actionable advice

FRIDAY (Social Proof) - Inspire and validate:
- "[X] users in [Y] days. Here is the playbook:"
- "What I learned after [milestone]:"
Key Points: Social proof, lessons learned, future vision
</hook_patterns>

<voice_guide>
${isKorean ? `
한국 인디해커 톤:
- 반말 사용 ("~했음", "~함")
- 짧은 문장 (15자 이하)
- 솔직함 ("망했었음", "삽질함")
- 숫자로 증명 ("30일째: 500명 유입")
` : `
Indie Hacker Authentic Voice:
- Humble: "Still learning, but here is what works..."
- Vulnerable: "I almost quit when..."
- Data-driven: "Day 30: 500 users, $2K MRR"
- Punchy: Short. Clear. Impact.
`}
</voice_guide>

<output_format>
{
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "${isKorean ? '50자 이하' : 'under 60 chars'}",
      "key_message": "${isKorean ? '핵심 메시지 한 문장' : 'One sentence summary'}",
      "thread": [
        "Tweet 1 (Hook)",
        "Tweet 2 (Problem)",
        "Tweet 3 (Solution with ${appName})",
        "Tweet 4 (Proof)",
        "Tweet 5 (CTA)"
      ]
    },
    {
      "day": "Wednesday",
      "theme": "Feature Deep-dive",
      "hook": "...",
      "key_message": "...",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    },
    {
      "day": "Friday",
      "theme": "Social Proof",
      "hook": "...",
      "key_message": "...",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }
  ]
}

CRITICAL:
- Start with '{' character. No markdown. No preamble.
- Every tweet under 240 characters.
- Every hook under ${isKorean ? '50' : '60'} characters.
- Each thread must tell a DIFFERENT story.
</output_format>`
    }
  }

  // ============================================
  // Quality Validation
  // ============================================
  private validateCopyQuality(
    generated: unknown,
    context: GenerateCopyParams['context']
  ): { passed: boolean; issues: string[] } {
    const issues: string[] = []
    const isKorean = context.language?.toLowerCase().includes('korean')

    if (Array.isArray(generated)) {
      // App Store validation
      for (const item of generated) {
        const headlineLen = (item as { headline?: string }).headline?.length || 0
        const subtextLen = (item as { subtext?: string }).subtext?.length || 0

        if (headlineLen > (isKorean ? 15 : 30)) {
          issues.push(`Headline too long: ${headlineLen} chars (max ${isKorean ? 15 : 30})`)
        }

        if (subtextLen > (isKorean ? 30 : 60)) {
          issues.push(`Subtext too long: ${subtextLen} chars (max ${isKorean ? 30 : 60})`)
        }

        // Banned words check
        const bannedWords = isKorean
          ? ['혁신적', '최고의', '놀라운', '소개합니다', '다운로드하세요']
          : ['revolutionary', 'amazing', 'best ever', 'excited to', 'game-changer', 'download now']

        const text = `${(item as { headline?: string }).headline} ${(item as { subtext?: string }).subtext}`.toLowerCase()
        for (const word of bannedWords) {
          if (text.includes(word.toLowerCase())) {
            issues.push(`Contains banned word: "${word}"`)
          }
        }
      }
    } else {
      // Twitter validation
      const threads = (generated as { weekly_batch?: Array<{ hook?: string; thread?: string[] }> }).weekly_batch || []
      for (const thread of threads) {
        if ((thread.hook?.length || 0) > (isKorean ? 50 : 60)) {
          issues.push(`Hook too long: ${thread.hook?.length} chars`)
        }

        for (const tweet of thread.thread || []) {
          if (tweet.length > 240) {
            issues.push(`Tweet exceeds 240 chars: ${tweet.length}`)
          }
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues
    }
  }

  // ============================================
  // Category-based Dynamic Examples
  // ============================================
  private getCategoryExamples(category: string, isKorean: boolean): string {
    const examples: Record<string, { kr: string; en: string }> = {
      productivity: {
        kr: `
- 노션: "모두를 위한 워크스페이스" + "문서, 위키, 프로젝트"
- 투두앱: "할일 정리" + "하루 5분으로 생산성 2배"
- 클로바노트: "회의록 자동 작성" + "AI가 요약까지"`,
        en: `
- Notion: "Your wiki, docs & projects" + "Together."
- Todoist: "Organize your life" + "Get things done"
- Things 3: "Get things done" + "Beautiful task manager"`
      },
      game: {
        kr: `
- 쿠키런: "달려라!" + "전세계 8천만 달성"
- 브롤스타즈: "배틀로얄" + "3분 액션"
- 원신: "모험을 시작하세요" + "오픈월드 RPG"`,
        en: `
- Candy Crush: "Sweet!" + "Match 3 puzzle"
- Clash Royale: "Enter the Arena" + "Real-time battles"
- Genshin Impact: "Open World Adventure" + "Free to play"`
      },
      health: {
        kr: `
- 캄: "숙면, 스트레스 없이" + "명상 앱 1위"
- 눔: "습관을 바꾸세요" + "심리학 기반 다이어트"
- 삼성헬스: "건강한 하루" + "운동, 수면, 식단"`,
        en: `
- Calm: "Sleep more. Stress less." + "#1 meditation app"
- Headspace: "Be kind to your mind" + "Meditation made simple"
- MyFitnessPal: "Reach your goals" + "Track food & exercise"`
      },
      finance: {
        kr: `
- 토스: "금융의 모든 것" + "송금, 투자, 보험"
- 카카오뱅크: "모바일에서 쉽게" + "26주 적금"
- 뱅크샐러드: "내 돈 관리" + "카드 추천, 자산관리"`,
        en: `
- Mint: "Money made simple" + "Track spending & save"
- YNAB: "Every dollar has a job" + "Budgeting that works"
- Robinhood: "Invest with no commission" + "Stocks & crypto"`
      },
      social: {
        kr: `
- 인스타그램: "순간을 공유하세요" + "사진과 스토리"
- 당근: "우리 동네 중고거래" + "이웃과 연결"
- 에브리타임: "대학생 필수앱" + "시간표, 커뮤니티"`,
        en: `
- Instagram: "Capture and Share" + "Photos & Stories"
- BeReal: "Your friends for real" + "Authentic moments"
- Threads: "Say more" + "Text conversations"`
      },
      education: {
        kr: `
- 듀오링고: "무료로 언어 배우기" + "게임처럼 재밌게"
- 클래스101: "취미를 시작하세요" + "드로잉, 요리, 자수"
- 야나두: "10분 영어" + "매일 꾸준히"`,
        en: `
- Duolingo: "Learn for free. Forever." + "Language made fun"
- Khan Academy: "You can learn anything" + "Free world-class education"
- Quizlet: "Study smarter" + "Flashcards that work"`
      },
      business: {
        kr: `
- 슬랙: "업무가 이루어지는 곳" + "팀 협업 도구"
- 줌: "화상회의" + "어디서든 연결"
- 먼데이닷컴: "워크 OS" + "팀 프로젝트 관리"`,
        en: `
- Slack: "Where work happens" + "Team collaboration"
- Zoom: "Meet happy" + "Video conferencing"
- Monday: "Work OS" + "Manage any project"`
      }
    }

    const categoryExamples = examples[category.toLowerCase()] || examples['productivity']
    return isKorean ? categoryExamples.kr : categoryExamples.en
  }
}
