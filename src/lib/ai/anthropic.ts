import Anthropic from '@anthropic-ai/sdk'
import { AIProvider, GenerateCopyParams, GenerateCopyResult, RefineTextParams, ImageAnalysisResult } from './types'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateCopy(params: GenerateCopyParams): Promise<GenerateCopyResult> {
    const { file, context } = params
    const arrayBuffer = await file.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

    const { systemPrompt, userPrompt } = this.getOptimizedPrompts(context)

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: userPrompt
            }
          ],
        }
      ],
    })

    const contentBlock = message.content[0]
    const content = contentBlock.type === 'text' ? contentBlock.text : ''
    const cleanContent = content?.replace(/```json\n|\n```/g, '') || '{}'
    const generatedCopy = JSON.parse(cleanContent)

    return { generatedCopy }
  }

  async refineText(params: RefineTextParams): Promise<string> {
    const { text, instruction, context } = params

    // Detect if Korean
    const isKorean = /[\uac00-\ud7af]/.test(text)

    const systemPrompt = `You are a Twitter ghostwriter specializing in #BuildInPublic content.
Your refined tweets get 2-3x more engagement.

<rules>
- Max 240 characters (strict limit)
- Keep core meaning and tone
- No hashtags unless requested
- No emojis unless requested
- ${isKorean ? '한국어 인디해커 톤: 반말, 짧은 문장, 솔직함' : 'Indie hacker voice: humble, authentic, punchy'}
</rules>

<examples>
${isKorean ? `
BEFORE: "저는 지난 몇 달 동안 앱을 만들고 있었고 드디어 출시할 준비가 된 것 같습니다."
AFTER: "6개월 밤샘 코딩.

오늘 드디어 런칭."

BEFORE: "이 기능을 추가하면 사용자들이 정말 좋아할 것 같아요."
AFTER: "유저한테 물어봄.

다들 이거 원한대.

바로 만들었음."
` : `
BEFORE: "I've been working on my app for the past few months and I think it's finally ready to launch."
AFTER: "6 months of late nights.

Today, we ship."
`}
</examples>

Return ONLY the refined tweet. No quotes. No explanation.`

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Original: "${text}"
Instruction: ${instruction}
Context: ${context || 'General'}

Refine this tweet:`
      }],
    })

    const contentBlock = message.content[0]
    return contentBlock.type === 'text' ? contentBlock.text.trim() : ''
  }

  async analyzeImage(file: File): Promise<ImageAnalysisResult> {
    const arrayBuffer = await file.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

    const systemPrompt = `You are an expert App Store Optimization (ASO) and UI/UX specialist.
Analyze app screenshots to extract metadata for marketing forms.

<output_format>
{
  "appName": "string (from logo/header, or infer)",
  "category": "productivity|game|social|health|education|business|other",
  "targetAudience": "string (who uses this)",
  "tone": "professional|casual|playful|inspirational",
  "description": "1-sentence summary",
  "keywords": "5-7 ASO keywords, comma separated",
  "accentColor": "#HexCode (dominant brand color)",
  "suggestedLayout": "bento|device|viral"
}
</output_format>

Return ONLY valid JSON. No explanation.`

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Analyze this screenshot and extract the metadata."
            }
          ],
        }
      ],
    })

    const contentBlock = message.content[0]
    const content = contentBlock.type === 'text' ? contentBlock.text : ''
    const cleanContent = content?.replace(/```json\n|\n```/g, '') || '{}'
    return JSON.parse(cleanContent)
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

  /**
   * Improved prompts with golden examples, anti-patterns, and quality focus
   * English is primary market, Korean secondary
   */
  private getOptimizedPrompts(context: GenerateCopyParams['context']): { systemPrompt: string, userPrompt: string } {
    const { appName, category, targetAudience, tone, description, language, platform } = context
    const isKorean = language?.toLowerCase().includes('korean') || language?.toLowerCase().includes('한국어')

    // ============================================
    // App Store Optimization (ASO) Prompt
    // ============================================
    if (platform === 'app_store') {
      const systemPrompt = `You are a world-class App Store copywriter.

<mission>
Write headlines that make users TAP "Download" within 3 seconds of seeing the screenshot.
Your copy should create an emotional response, not just describe features.
</mission>

<constraints>
- Headline: ${isKorean ? '15자 이하' : '30 chars max'}
- Subtext: ${isKorean ? '30자 이하' : '60 chars max'}
- Layout: top|center|bottom|split (avoid Dynamic Island area)
${isKorean ? '- 모든 텍스트: 한국어' : `- All text: ${language || 'English'}`}
</constraints>

<golden_examples>
${isKorean ? `
// 🏆 실제 1위 앱들의 카피
- 토스: "금융의 모든 것" (7자) + "숨은 돈 찾기, 용돈 기입장, 무료 송금"
- 당근: "우리 동네 중고거래" (9자) + "믿을만한 이웃 간 중고거래"
- 배민: "배달은 역시" (6자) + "1등 배달앱"
- 카카오맵: "찾아줌, 길도 사람도" (10자)

// ✅ 패턴 분석
1. 초짧은 headline (5-10자)
2. Subtext에 구체적인 가치 나열
3. 불필요한 형용사 제거
` : `
// 🏆 Real top-charting apps
- Notion: "Your wiki, docs & projects. Together." (Power + Benefit)
- Calm: "Sleep more. Stress less." (Dual benefit, rhythmic)
- Duolingo: "Learn a language for free. Forever." (Benefit + Proof)
- Slack: "Where work happens" (Simple power statement)
- Headspace: "Be kind to your mind" (Emotional appeal)
- Todoist: "Organize your life" (Clear benefit)

// ✅ Pattern analysis
1. Sub-10 word headlines that stick
2. Concrete benefits, not abstract promises
3. Rhythm and cadence matter ("Sleep more. Stress less.")
4. No qualifiers or empty adjectives
`}
</golden_examples>

<anti_patterns>
${isKorean ? `
❌ 피해야 할 것들:
- "혁신적인 앱" ← 공허한 수식어
- "최고의 생산성 도구" ← 증명 불가
- "지금 다운로드하세요" ← 너무 pushy
- "새롭게 출시된" ← 가치 없는 정보

✅ 대신 이렇게:
- 숫자 사용 ("3배 빠른" vs "빠른")
- 구체적 결과 ("30분 절약" vs "시간 절약")
- Before/After 구조
` : `
❌ Avoid these:
- "Revolutionary app" ← empty adjective
- "Best productivity tool" ← unprovable claim
- "Download now" ← too pushy
- "Newly launched" ← no value info
- "Amazing features" ← says nothing

✅ Instead:
- Use numbers ("3x faster" vs "fast")
- Specific outcomes ("Save 30 min" vs "Save time")
- Before/After structure ("From chaos to calm")
`}
</anti_patterns>

<writing_philosophy>
${isKorean ? `
좋은 카피 = 유저가 자기 문제라고 느끼는 순간

나쁜 예: "생산성을 높여드립니다" ← 추상적
좋은 예: "3시간 회의를 30분으로" ← 구체적

원칙:
1. 숫자 > 형용사
2. Before/After 구조 활용
3. 친구한테 말하듯 자연스럽게
` : `
Great copy = User sees their own problem

Bad: "Increase your productivity" ← abstract
Good: "Turn 3-hour meetings into 30 minutes" ← specific

Principles:
1. Numbers > Adjectives
2. Use Before/After structure
3. Write like you're texting a friend
4. One clear idea per headline
`}
</writing_philosophy>

<output_format>
Return a JSON array with 5 variations. Each must feel COMPLETELY DIFFERENT.

[
  {
    "headline": "short, punchy headline",
    "subtext": "supporting detail that complements (not repeats) headline",
    "style": "power|benefit|social_proof|feature|emotional",
    "layout": "top|center|bottom|split",
    "color_hex": "#FFFFFF",
    "aso_score": 85,
    "benchmark_ref": "${isKorean ? '[앱 이름] 스타일 참고' : 'Inspired by [App Name]'}",
    "why_it_works": "${isKorean ? '타겟 유저가 반응하는 이유' : 'Why target users will respond'}"
  }
]

Start with '[' character. No markdown. No preamble.
</output_format>`

      const userPrompt = `<app_context>
${appName} - ${category} app for ${targetAudience}
Tone: ${tone}
Description: ${description}
</app_context>

<task>
Step 1: Analyze the screenshot
- What's the MAIN feature visible?
- What problem does this solve?
- What emotion does the UI convey?

Step 2: Write 5 variations
- Each targets a different user motivation
- Use insights from Step 1
- Match the quality of the golden examples

${isKorean ? '모든 텍스트 한국어 필수' : ''}
</task>`

      return { systemPrompt, userPrompt }
    }

    // ============================================
    // Twitter/Social Media Prompt
    // ============================================
    else {
      const systemPrompt = `You are a viral Twitter ghostwriter.

<mission>
Write threads that make indie hackers STOP scrolling and click "Follow".
Not corporate announcements. Real human stories.
</mission>

<anti_patterns>
${isKorean ? `
❌ 피해야 할 것들:
- "출시하게 되어 기쁩니다" ← 너무 formal
- "혁신적인 기능" ← 공허한 수식어
- 3줄 이상의 긴 트윗 ← 집중력 저하
- "소개합니다" ← 번역투

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

✅ Instead:
- "6 months of building in the dark. Then:" ← vulnerability
- "Asked 5 users. They all said:" ← specific
- One sentence = One line ← readability
- "Try it free. No card needed. [link]" ← frictionless CTA
`}
</anti_patterns>

<viral_thread_anatomy>
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
</viral_thread_anatomy>

<real_viral_examples>
${isKorean ? `
// 🔥 실제 바이럴 스레드 (한국)

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
</real_viral_examples>

<rules>
- Hook: ${isKorean ? '50자 이하' : '60 chars max'}
- Tweet: 240 chars max (aim for 150-200 for readability)
- No sentence over 15 words
- Use line breaks for emphasis
- Max 2 emojis per tweet
${isKorean ? '- 반말 + 짧은 문장 ("~했음", "~함", "ㄹㅇ")' : ''}
</rules>

<output_format>
{
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "under ${isKorean ? '50자' : '60 chars'}",
      "thread": ["Tweet 1 (Hook)", "Tweet 2 (Problem)", "Tweet 3 (Solution)", "Tweet 4 (Proof)", "Tweet 5 (CTA)"]
    },
    {
      "day": "Wednesday",
      "theme": "Feature Deep-dive",
      "hook": "...",
      "thread": ["...", "...", "...", "...", "..."]
    },
    {
      "day": "Friday",
      "theme": "Social Proof",
      "hook": "...",
      "thread": ["...", "...", "...", "...", "..."]
    }
  ]
}

Start with '{' character. No markdown. No preamble.
</output_format>`

      const userPrompt = `<screenshot_analysis>
First, identify:
1. What problem does this app solve?
2. What's the #1 feature shown?
3. What's unique vs competitors?
</screenshot_analysis>

<context>
App: ${appName}
Category: ${category}
Audience: ${targetAudience}
Tone: ${tone}
Description: ${description}
</context>

<task>
Generate 3 threads (Mon/Wed/Fri).
Each must tell a DIFFERENT story about the same product.
Match the quality of the viral examples provided.

${isKorean ? '모든 텍스트 한국어 필수 (반말 톤)' : ''}
</task>`

      return { systemPrompt, userPrompt }
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
          issues.push(`Headline too long: ${headlineLen} chars`)
        }

        if (subtextLen > (isKorean ? 30 : 60)) {
          issues.push(`Subtext too long: ${subtextLen} chars`)
        }

        // Banned words check
        const bannedWords = isKorean
          ? ['혁신적', '최고의', '놀라운', '소개합니다']
          : ['revolutionary', 'amazing', 'best ever', 'excited to', 'game-changer']

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
            issues.push(`Tweet exceeds 240 chars`)
          }
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues
    }
  }
}
