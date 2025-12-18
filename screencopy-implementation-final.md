# 📱 ScreenCopy.ai - 최종 구현 기획서

**버전**: 2.0 (Implemented)  
**작성일**: 2025년 12월 6일  
**현재 상태**: 프로덕션 배포 완료  
**기술 스택**: Next.js 16 + Supabase + Claude 3.5 Sonnet + Gemini + Satori

---

## 1. Executive Summary

### 제품의 진화

ScreenCopy.ai는 두 가지 핵심 기능을 제공하는 AI 기반 마케팅 카피 생성 플랫폼으로 발전했습니다:

1. **V1: App Store 스크린샷 카피 생성기**
   - 앱 스크린샷 업로드 → AI가 마케팅 카피 5개 생성
   - 타겟: 앱 개발자 및 에이전시

2. **V2: Twitter/Social Media "Ghostwriter"**
   - 스크린샷 1장 → 주간 소셜 미디어 콘텐츠 생성 (월/수/금)
   - 타겟: #BuildInPublic 하는 인디 개발자

### 핵심 가치 제안

```
기존: 며칠 고민하며 카피라이팅 → 10초 만에 AI 생성
      카피라이터 $500-2000 → $9.99-149.99
      평범한 문구 → 전문가 수준의 마케팅 카피
```

### 현재 구현 상태 (2025년 12월 기준)

✅ **완료된 기능**
- 사용자 인증 (Supabase Auth)
- 크레딧 시스템 (무료 3 크레딧)
- 이미지 업로드 및 분석
- AI 카피 생성 (Claude + Gemini Hybrid)
- 자동 컨텍스트 추출
- 결과 히스토리 저장
- 카피 정제(Refine) 기능
- 즐겨찾기 및 삭제
- Stripe 결제 연동
- 주간 콘텐츠 일정표 (Weekly Schedule)
- Satori 기반 소셜 이미지 생성
- 랜딩 페이지 + 대시보드

🚧 **개발 중**
- 리퍼럴 프로그램
- 팀 협업 기능
- API 제공

---

## 2. 제품 개요

### 2.1 핵심 기능

#### A. 플랫폼 선택 (Platform-Specific Generation)

사용자는 생성 시 플랫폼을 선택합니다:

```
1. App Store / Google Play
   → 앱 스크린샷용 짧은 헤드라인 (6-10 단어)
   → 5가지 스타일의 카피 옵션
   → 심리적 트리거 분석 포함

2. Twitter / X
   → 주간 스레드 3개 (월요일/수요일/금요일)
   → Origin Story / Feature Deep-dive / Social Proof
   → 자동 디자인 이미지 생성 (Satori)

3. Threads
   → Twitter와 동일하지만 해시태그 최적화
```

#### B. 이미지 분석 및 자동 컨텍스트 추출

**구현된 기능:**
```typescript
// /api/analyze-image
- 스크린샷 업로드 시 Claude Vision이 자동 분석
- 추출 정보:
  * 앱 이름 (appName)
  * 카테고리 (category)
  * 타겟 고객 (targetAudience)
  * 주요 기능 (description)
  * 추천 톤 (tone)
  * 키워드 (keywords)
```

**사용자 경험:**
- 이미지 업로드 → "Analyzing screenshot context..." 로딩
- 2-3초 후 폼 자동 완성
- 사용자는 수정만 하면 됨 (Zero-friction)

#### C. AI 생성 엔진 (Hybrid AI)

**현재 구현:**
```typescript
// /lib/ai/client.ts
export function getAIClient() {
  const provider = process.env.AI_PROVIDER // 'anthropic', 'gemini', 'hybrid'
  
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider()
    case 'gemini':
      return new GeminiProvider()
    case 'hybrid':
      return new HybridProvider() // Claude for analysis, Gemini for generation
  }
}
```

**V1 출력 (App Store):**
```json
[
  {
    "headline": "Never Miss a Deadline Again",
    "subtext": "Stay organized. Stay productive.",
    "style": "bold",
    "reasoning": "Uses FOMO trigger. Speaks to student's fear.",
    "psychologicalTrigger": "FOMO",
    "targetMatch": 92,
    "estimatedImpact": "high"
  },
  // ... 4 more options
]
```

**V2 출력 (Twitter):**
```json
{
  "design_config": {
    "accent_color": "#3B82F6",
    "suggested_layout": "bento"
  },
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "I built this in 48 hours...",
      "thread": [
        "Tweet 1: Setup and problem",
        "Tweet 2: The aha moment",
        "Tweet 3: What I learned",
        "Tweet 4: CTA"
      ]
    },
    { "day": "Wednesday", ... },
    { "day": "Friday", ... }
  ]
}
```

#### D. 자동 디자인 엔진 (Satori)

**V2 전용 기능:**
```typescript
// /lib/design-engine.tsx
export async function generateSocialImage(
  title: string,
  subtitle: string,
  items: string[],
  accentColor: string
): Promise<Buffer>
```

**생성 방식:**
1. Claude가 스크린샷에서 `accent_color` 추출
2. Satori가 React 컴포넌트를 PNG로 렌더링
3. Bento Grid 스타일 이미지 생성
4. Supabase Storage에 업로드
5. 결과 화면에서 바로 다운로드 가능

**스타일:**
- **The Bento**: 그리드 형태 (기능 강조)
- **Device Frame** (미구현): 아이폰/맥북 목업
- **Typography** (미구현): 텍스트 중심

#### E. 카피 정제 (Refine) 기능

**구현 위치:** `ResultCard.tsx`

```typescript
// 사용자가 "Refine" 버튼 클릭
// → 모달에서 수정 요청 입력
// → /api/refine 호출
// → Claude가 기존 카피를 개선
```

**예시:**
```
원본: "Boost Your Productivity"
요청: "Make it more emotional and add urgency"
결과: "Stop Wasting Time. Reclaim Your Day Today."
```

#### F. 히스토리 및 즐겨찾기

**구현된 기능:**
- `/history` 페이지에서 과거 생성 목록 확인
- 각 항목에 ⭐ 즐겨찾기 버튼
- 🗑️ 삭제 버튼
- 필터링: 전체 / 즐겨찾기만 보기
- Supabase RLS로 사용자별 데이터 보호

---

## 3. 기술 스택 (실제 구현)

### 3.1 프론트엔드
```json
{
  "framework": "Next.js 16.0.7 (App Router)",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 4",
  "components": "shadcn/ui (Radix UI)",
  "animations": "Framer Motion, GSAP, Lenis (smooth scroll)",
  "forms": "React Hook Form + Zod",
  "toast": "Sonner",
  "icons": "Lucide React"
}
```

### 3.2 백엔드
```json
{
  "runtime": "Next.js API Routes (Edge Functions)",
  "database": "PostgreSQL (Supabase)",
  "auth": "Supabase Auth (Email + Google OAuth)",
  "storage": "Supabase Storage (Public Bucket)",
  "orm": "@supabase/supabase-js"
}
```

### 3.3 AI/ML
```json
{
  "primary": "Claude 3.5 Sonnet (Anthropic)",
  "secondary": "Gemini Pro Vision (Google)",
  "imageGen": "Satori + @vercel/og",
  "strategy": "Hybrid (Claude for analysis, Gemini for copy)"
}
```

**프롬프트 전략:**
- BAN WORDS: "Revolutionary", "Game-changer", "Unleash"
- TONE: Humble, Vulnerable, Data-driven
- Silicon Valley Growth Engineer 페르소나

### 3.4 결제 및 수익화
```json
{
  "processor": "Stripe",
  "products": [
    { "name": "Starter", "credits": 10, "price": "$9.99" },
    { "name": "Pro", "credits": 50, "price": "$39.99" },
    { "name": "Agency", "credits": 200, "price": "$149.99" }
  ],
  "webhook": "/api/stripe/webhook"
}
```

### 3.5 호스팅 및 모니터링
```json
{
  "hosting": "Vercel (Edge Network)",
  "analytics": "Vercel Analytics, PostHog",
  "errors": "Sentry (예정)",
  "domain": "screencopy.ai"
}
```

---

## 4. 데이터베이스 스키마

### Supabase Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `generations`
```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  input_context JSONB NOT NULL,
  output_copy JSONB NOT NULL,
  is_favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL, -- -1 (생성), +1 (환불), +10 (구매)
  type TEXT NOT NULL, -- 'generation', 'refund', 'purchase'
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `stripe_customers` (결제용)
```sql
CREATE TABLE stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. 주요 API 엔드포인트

### 5.1 인증
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/user
```

### 5.2 생성
```
POST /api/analyze-image
  - Input: FormData { file: File }
  - Output: { success, data: ContextFormData }
  - 기능: 스크린샷 분석하여 컨텍스트 자동 추출

POST /api/generate
  - Input: FormData { file, appName, category, ... }
  - Output: { success, data: GeneratedCopy[] | GhostwriterOutput }
  - 기능: 메인 카피 생성 엔진

POST /api/refine
  - Input: { originalCopy, userRequest, context }
  - Output: { success, refinedCopy }
  - 기능: 기존 카피 개선

POST /api/refine-tweet
  - Input: { day, originalThread, userRequest }
  - Output: { success, refinedThread }
  - 기능: 트위터 스레드 개선
```

### 5.3 히스토리
```
GET    /api/generations
  - Query: ?favorited=true
  - Output: { generations: Generation[] }

GET    /api/generations/[id]
  - Output: { generation: Generation }

DELETE /api/generations/[id]
  - Output: { success }

PATCH  /api/generations/[id]
  - Input: { is_favorited: boolean }
  - Output: { success }
```

### 5.4 결제
```
POST /api/stripe/checkout
  - Input: { priceId, quantity }
  - Output: { url: stripe_checkout_url }

POST /api/stripe/webhook
  - Stripe의 payment_intent.succeeded 이벤트 처리
  - 자동 크레딧 지급
```

---

## 6. 사용자 플로우

### 6.1 신규 사용자 온보딩

```
1. 랜딩 페이지 방문 (/)
   ↓
2. "Get Started Free" 버튼 클릭
   ↓
3. 회원가입 (/login?mode=signup)
   - 이메일 + 비밀번호
   - 또는 Google OAuth
   ↓
4. 자동으로 3 크레딧 지급
   ↓
5. 대시보드로 리다이렉트 (/dashboard)
   ↓
6. "Start Generating" 버튼 → 생성 페이지
```

### 6.2 카피 생성 플로우 (V1: App Store)

```
1. /generate 페이지
   ↓
2. 스크린샷 드래그앤드롭
   ↓
3. [자동] 이미지 분석 중... (2-3초)
   ↓
4. 폼 자동 완성 (사용자는 수정만)
   - Platform: App Store
   - App Name: MyApp
   - Category: Productivity
   - ...
   ↓
5. "Generate Copy" 버튼 클릭
   ↓
6. 크레딧 1 차감
   ↓
7. AI 생성 (5-10초)
   ↓
8. 5개 카피 옵션 표시
   - 각각 Copy 버튼
   - Refine 버튼
   - 👍👎 피드백 버튼
   ↓
9. 마음에 드는 카피 복사
   ↓
10. [선택] Refine으로 개선
```

### 6.3 주간 콘텐츠 생성 플로우 (V2: Twitter)

```
1. /generate 페이지
   ↓
2. 스크린샷 업로드
   ↓
3. Platform: Twitter 선택
   ↓
4. 컨텍스트 입력
   ↓
5. "Generate Copy" 버튼
   ↓
6. AI가 주간 스레드 3개 생성 (월/수/금)
   ↓
7. WeeklyScheduleView 표시:
   - 좌측: 캘린더 (Mon/Wed/Fri 탭)
   - 우측: 생성된 이미지 미리보기
   ↓
8. 각 날짜별로:
   - 스레드 텍스트 Copy
   - 이미지 Download
   - Refine 가능
   ↓
9. 실제 트위터에 붙여넣기
```

---

## 7. 수익 모델 (현재 구현)

### 7.1 크레딧 시스템

```
┌─────────────┬──────────┬─────────┬──────────┐
│  패키지     │ 크레딧   │  가격   │ 크레딧당 │
├─────────────┼──────────┼─────────┼──────────┤
│  무료       │    3     │  $0     │    -     │
│  Starter    │   10     │  $9.99  │  $1.00   │
│  Pro        │   50     │ $39.99  │  $0.80   │
│  Agency     │  200     │ $149.99 │  $0.75   │
└─────────────┴──────────┴─────────┴──────────┘

특징:
- 1 크레딧 = 1회 생성 (플랫폼 무관)
- 크레딧 만료 없음
- 생성 실패 시 자동 환불
- 환불 정책: 7일 이내 미사용분
```

### 7.2 비용 분석

```
원가 (per generation):
- Claude API: $0.20-0.30
- Gemini API: $0.05-0.10
- Supabase Storage: $0.02
- Vercel Functions: $0.03
─────────────────────
  총 원가: ~$0.35

마진:
- Starter: $1.00 - $0.35 = 65% 마진
- Pro: $0.80 - $0.35 = 56% 마진
- Agency: $0.75 - $0.35 = 53% 마진
```

### 7.3 수익 예측 (보수적)

```
Month 3 목표:
- 사용자: 500명
- 유료 전환율: 15% = 75명
- 평균 구매: $40
─────────────────────
  MRR: $3,000

Month 6 목표:
- 사용자: 2,000명
- 유료 전환율: 20% = 400명
- 평균 구매: $60
─────────────────────
  MRR: $24,000

Month 12 목표:
- 사용자: 5,000명
- 유료 전환율: 25% = 1,250명
- 평균 구매: $80
─────────────────────
  MRR: $100,000
  ARR: $1.2M
```

---

## 8. 마케팅 전략

### 8.1 타겟 고객

#### Primary: "The Inconsistent Indie Hacker"
```
페르소나:
- 1인 개발자 또는 초기 스타트업
- #BuildInPublic 하고 싶지만 시간 없음
- 디자인 감각 부족
- 예산: $50 이하
- 플랫폼: Twitter, Indie Hackers, Product Hunt

고통:
"개발하기도 바쁜데 매일 뭘 올려야 할지 모르겠어"

해결책:
"스크린샷만 던지세요. 3일치 콘텐츠를 10초 만에 만들어드립니다"
```

### 8.2 런칭 전략

#### A. Dogfooding (가장 중요!)
```
전략:
- 개발하는 과정 자체를 ScreenCopy로 생성한 콘텐츠로 공유
- "이 트윗도 제 AI가 썼습니다" 메시지

효과:
- 제품의 품질을 직접 증명
- 자연스러운 바이럴
```

#### B. Product Hunt
```
준비:
✓ 썸네일 (1270x760px)
✓ 갤러리 5개
✓ 데모 영상
✓ 태그라인: "AI ghostwriter for your #BuildInPublic journey"

목표:
- Top 10 Product of the Day
- 100+ 업보트
```

#### C. 커뮤니티 마케팅
```
플랫폼:
1. Twitter/X
   - #BuildInPublic 해시태그
   - 주 3-5회 포스팅
   
2. Indie Hackers
   - 개발 과정 공유
   - 피드백 요청
   
3. Reddit
   - r/SideProject (토요일)
   - r/IndieDev
```

### 8.3 성장 해킹

#### A. 제품 내 바이럴
```
구현:
- 생성된 이미지에 "Made with ScreenCopy.ai" 워터마크 (Pro는 제거)
- 소셜 공유 버튼
- 리퍼럴 프로그램 (친구 초대 시 10 크레딧)
```

#### B. SEO
```
타겟 키워드:
- "app store screenshot copy"
- "twitter thread generator"
- "social media ghostwriter"
- "#buildinpublic tools"

전략:
- 블로그 콘텐츠
- 메타 태그 최적화
- 구조화된 데이터 (Schema.org)
```

---

## 9. 로드맵

### Phase 1: MVP ✅ (완료)
```
✅ 인증 시스템
✅ 크레딧 시스템
✅ 이미지 업로드
✅ AI 생성 (V1 + V2)
✅ 히스토리
✅ Stripe 결제
✅ 랜딩 페이지
```

### Phase 2: 개선 🚧 (진행 중)
```
🚧 리퍼럴 프로그램
🚧 이메일 알림 (Resend)
🚧 프로모션 코드
🚧 A/B 테스팅 가이드
⬜ 다국어 지원 (한국어, 일본어)
```

### Phase 3: 확장 (3-6개월)
```
⬜ 팀 협업 기능
⬜ API 제공
⬜ Figma 플러그인
⬜ 경쟁사 분석 기능
⬜ 월 구독 모델 ($79/월)
```

### Phase 4: Enterprise (6-12개월)
```
⬜ White-label 옵션
⬜ 전담 지원
⬜ SLA 보장
⬜ App Store Connect 통합
⬜ 자동 A/B 테스팅
```

---

## 10. 핵심 성공 지표 (KPIs)

### 10.1 제품 지표
```
추적:
- 일일/주간 신규 가입
- 활성화율 (가입 → 첫 생성)
- 주간 유지율 (Weekly Retention)
- 평균 생성 횟수/사용자

목표 (Month 3):
- 신규 가입: 500명
- 활성화율: 60%
- 주간 유지율: 40%
- 평균 생성: 5회/사용자
```

### 10.2 수익 지표
```
추적:
- MRR (Monthly Recurring Revenue)
- 유료 전환율
- ARPU (Average Revenue Per User)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)

목표:
- LTV/CAC > 3
- Churn Rate < 5%/월
```

### 10.3 품질 지표
```
추적:
- AI 생성 시간 (목표: <10초)
- 에러율 (목표: <1%)
- 사용자 만족도 (1-5 별점)
- 실제 사용률 (카피한 비율)

목표:
- 평균 별점: 4.2+
- 실제 사용률: 70%+
```

---

## 11. 경쟁 우위

### 11.1 차별점

```
1. 비주얼 컨텍스트 이해
   경쟁자: 텍스트만 분석 (Copy.ai, Jasper)
   우리: 이미지 + 텍스트 함께 분석
   → 스크린샷과 어울리는 카피

2. 플랫폼 특화
   경쟁자: 범용 카피라이팅
   우리: App Store + Twitter 전용
   → 각 플랫폼의 문법에 100% 최적화

3. 주간 배치 생성 (V2)
   경쟁자: 1회성 생성
   우리: 월/수/금 3일치 한번에
   → 일주일치 콘텐츠를 10초 만에

4. 자동 디자인
   경쟁자: 텍스트만 제공
   우리: 텍스트 + 이미지 자동 생성 (Satori)
   → 바로 트위터에 올릴 수 있는 완성품

5. 가격
   경쟁자: $49-2000/월
   우리: $9.99-149.99 (1회 구매)
   → 필요할 때만 구매, 부담 없음
```

### 11.2 진입 장벽

```
우리가 구축한 해자(Moat):

1. 선점 효과
   - "앱스토어 스크린샷 카피" = ScreenCopy
   - "#BuildInPublic AI" = ScreenCopy

2. 프롬프트 엔지니어링
   - 수백 번의 테스트로 최적화된 프롬프트
   - BAN WORDS 리스트 (AI 티 나는 단어 제거)
   - 심리 트리거 시스템

3. 데이터 축적
   - 사용자 피드백 (👍👎)
   - 어떤 카피가 실제로 선택되는지 학습
   - 시간이 갈수록 정확도 향상

4. 커뮤니티
   - 인디 개발자 커뮤니티 내 입소문
   - 네트워크 효과
```

---

## 12. 보안 및 개인정보 보호

### 12.1 구현된 보안 기능

```
✅ Supabase RLS (Row Level Security)
   - 사용자는 자신의 데이터만 접근
   
✅ Rate Limiting
   - API 호출 제한 (시간당 50회)
   
✅ CORS 정책
   - Next.js Middleware로 제어
   
✅ 환경 변수 보호
   - Vercel Environment Variables
   - .env.local은 .gitignore
   
✅ Stripe Webhook 서명 검증
   - 위조 요청 차단
   
✅ Input Validation
   - Zod 스키마로 모든 입력 검증
```

### 12.2 개인정보 처리

```
수집 정보:
- 이메일 (인증용)
- 업로드된 이미지 (Supabase Storage)
- 생성 히스토리 (JSONB)

보관 기간:
- 이미지: 사용자 삭제 시까지
- 히스토리: 사용자 삭제 시까지
- 트랜잭션 로그: 영구 (회계용)

사용자 권리:
- 데이터 다운로드 (향후 구현)
- 계정 삭제 (모든 데이터 삭제)
```

---

## 13. 기술적 도전과 해결

### 13.1 AI 응답 일관성

**문제:**
```
Claude와 Gemini가 가끔 프롬프트를 무시하고
엉뚱한 형식으로 응답
```

**해결:**
```typescript
// Hybrid Provider 구현
// Claude: 이미지 분석 (Vision 강점)
// Gemini: 카피 생성 (비용 효율적)

// JSON Schema 강제
const systemPrompt = `
YOU MUST respond ONLY with valid JSON.
NO markdown, NO explanations, NO extra text.
...
`
```

### 13.2 크레딧 동시성 문제

**문제:**
```
사용자가 빠르게 여러 번 클릭
→ 크레딧 2번 차감되는 버그
```

**해결:**
```typescript
// 낙관적 차감 (Optimistic Deduction)
// 1. 크레딧 먼저 차감
// 2. AI 생성 시도
// 3. 실패 시 자동 환불

if (deductError) {
  throw new Error('Failed to process credit')
}
creditDeducted = true

// ... AI generation ...

catch (error) {
  if (creditDeducted && userId) {
    await restoreCredit(userId)
  }
}
```

### 13.3 Satori 이미지 생성 속도

**문제:**
```
Satori가 PNG 생성하는데 3-5초 소요
전체 응답 시간 증가
```

**해결:**
```typescript
// 비동기 처리
// 1. 먼저 텍스트 카피 응답
// 2. 백그라운드에서 이미지 생성
// 3. 생성 완료 시 imageUrl 업데이트

try {
  const imageBuffer = await generateSocialImage(...)
  // Upload to Supabase Storage
} catch (designError) {
  // Fallback to original screenshot
  // Don't fail the entire request
}
```

---

## 14. 환경 변수 설정

### 필수 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# AI Providers
AI_PROVIDER=hybrid # 'anthropic' | 'gemini' | 'hybrid'
ANTHROPIC_API_KEY=sk-ant-xxx...
GOOGLE_AI_API_KEY=AIzaSyxxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...

# Optional
NEXT_PUBLIC_APP_URL=https://screencopy.ai
```

---

## 15. 배포 및 CI/CD

### Vercel 배포 설정

```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install

Environment Variables:
- Production: 위 환경 변수 모두 설정
- Preview: 테스트용 Stripe Key 사용

Auto-deploy:
- main 브랜치 푸시 → Production 배포
- PR 생성 → Preview 배포
```

### Git Workflow

```
main (프로덕션)
  │
  ├─ develop (스테이징)
  │   │
  │   ├─ feature/twitter-v2
  │   ├─ feature/refine-ui
  │   └─ bugfix/credit-race-condition
```

---

## 16. 향후 개선 사항

### 16.1 단기 (1-2개월)

```
1. 이메일 알림 (Resend)
   - 환영 이메일
   - 크레딧 부족 알림
   - 결제 영수증

2. 프로모션 코드
   - LAUNCH50: 50 크레딧 (첫 100명)
   - FRIEND20: 20 크레딧 (리퍼럴)

3. 리퍼럴 프로그램
   - 친구 초대 시 10 크레딧
   - 대시보드에서 추적

4. 고급 필터링
   - 히스토리 페이지에서 날짜/플랫폼별 검색
```

### 16.2 중기 (3-6개월)

```
1. 팀 협업
   - 팀원 초대
   - 크레딧 공유
   - 댓글 기능

2. API 제공
   - RESTful API
   - Webhooks
   - Rate limiting

3. Figma 플러그인
   - Figma에서 바로 카피 생성
   - 레이어에 자동 적용

4. 다국어 지원
   - UI: 영어, 한국어, 일본어
   - AI 생성: 다국어 프롬프트
```

### 16.3 장기 (6-12개월)

```
1. 모바일 앱
   - React Native
   - 카메라에서 바로 촬영 → 생성

2. 크롬 익스텐션
   - 웹페이지 스크린샷 → 카피 생성

3. AI 학습
   - 사용자 피드백으로 프롬프트 자동 개선
   - 개인화된 스타일 학습

4. 마켓플레이스
   - 사용자가 프롬프트 템플릿 공유
   - 수익 분배 (70/30)
```

---

## 17. 팀 및 리소스

### 개발 리소스

```
필수 인력:
- 풀스택 개발자 1명 (현재)
- 디자이너 0.5명 (외주)

향후 확장:
- 백엔드 개발자 1명 (스케일링)
- 프론트엔드 개발자 1명 (모바일 앱)
- 마케터 1명 (커뮤니티 매니저)
```

### 월간 비용 (추정)

```
인프라:
- Vercel Pro: $20/월
- Supabase Pro: $25/월
- Claude API: $100-500/월 (사용량 기반)
- Gemini API: $50-200/월
- Stripe 수수료: 2.9% + $0.30

합계: ~$200-750/월 (초기)
```

---

## 18. 결론 및 다음 단계

### 현재 상태 요약

ScreenCopy.ai는 **프로덕션 준비 완료** 상태입니다:

✅ **기술적 완성도**
- Next.js 16 + TypeScript + Supabase로 안정적 구현
- Claude + Gemini Hybrid AI로 고품질 생성
- Stripe 결제 완전 통합

✅ **제품-시장 적합성 (PMF) 검증 준비**
- V1 (App Store) + V2 (Twitter) 모두 지원
- 명확한 타겟: 인디 개발자
- 차별화된 가치 제안: 이미지 분석 + 주간 배치

✅ **수익화 모델**
- 크레딧 시스템 구현
- Stripe 결제 연동
- 명확한 가격 정책

### 즉시 실행 가능한 다음 단계

#### Week 1: 소프트 런칭
```
[ ] Product Hunt 준비
    - 썸네일 제작
    - 데모 영상 촬영
    - First Comment 작성

[ ] Twitter 계정 활성화
    - #BuildInPublic 시작
    - 개발 과정 공유

[ ] 베타 테스터 10명 모집
    - Indie Hackers DM
    - 피드백 수집
```

#### Week 2: 본 런칭
```
[ ] Product Hunt 런칭
    - 00:01 AM PST 제출
    - 24시간 모니터링

[ ] 커뮤니티 포스팅
    - Twitter, Indie Hackers, Reddit

[ ] 피드백 수집 및 버그 수정
```

#### Week 3-4: 개선 및 성장
```
[ ] 리퍼럴 프로그램 구현
[ ] 이메일 알림 추가
[ ] SEO 최적화
[ ] 첫 10명의 유료 고객 확보
```

---

## Appendix: 참고 자료

### 유용한 링크
```
- Supabase Docs: https://supabase.com/docs
- Anthropic API: https://docs.anthropic.com
- Satori: https://github.com/vercel/satori
- shadcn/ui: https://ui.shadcn.com
```

### 커뮤니티
```
- Indie Hackers: https://indiehackers.com
- Product Hunt: https://producthunt.com
- Twitter: #BuildInPublic #IndieDev
```

---

**최종 업데이트**: 2025년 12월 6일  
**버전**: 2.0 (Implementation Final)  
**상태**: ✅ Production Ready

**다음 마일스톤**: Product Hunt 런칭 및 첫 100명 사용자 확보
