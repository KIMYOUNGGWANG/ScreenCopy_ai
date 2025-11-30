# 📱 ScreenCopy.ai v2.0 - 확장 기획안 (Expansion Plan)

**버전**: 2.0 (The Marketing Suite)  
**작성일**: 2025년 11월  
**개발 환경**: Antigravity (SaaS Boilerplate)  
**목표**: 단순 '카피 생성기'에서 **'올인원 앱 마케팅 도구'**로 진화, 재사용률(Retention) 300% 증대

---

## 1. Executive Summary

### 한 줄 요약
**"앱스토어 등록 후에도 매일 쓰게 만드는, 개발자를 위한 자동 SNS 마케팅 & 디자인 합성 도구"**

### 변화의 핵심 (Pivot Point)
- **Before (v1.0)**: 앱 출시할 때 '한 번' 쓰는 도구 (Low Frequency)
- **After (v2.0)**: 출시 후 매주 홍보할 때 **'계속'** 쓰는 도구 (High Frequency)

### 핵심 가치 제안 (Updated)
- **Multi-Channel**: 스크린샷 1장으로 트위터, 링크드인, 인스타 홍보물 동시 생성
- **Design-Free**: 텍스트만 주는 게 아니라, '디자인된 이미지'를 즉시 다운로드
- **Global-Ready**: 단순 번역이 아닌, 현지 문화에 맞는 '로컬라이징 마케팅'

### 목표 시장 확장
- **기존**: 앱 출시 직전의 인디 개발자
- **확장**: 라이브 서비스를 운영하며 **지속적인 유입(User Acquisition)**이 필요한 1인 창업가

---

## 2. 문제 정의 (New Pain Points)

### 문제 1: 출시 후의 막막함 (The "Now What?" Problem)
> "앱스토어에 올리긴 했는데... 이제 홍보는 어떻게 하죠?"

- 개발자는 '기능 구현'은 잘하지만, 매일 트위터/링크드인에 무슨 글을 써야 할지 모름
- "새로운 기능이 나왔어요!" 외에는 할 말이 없음
- 지속적인 노출이 없으면 앱은 묻힘

### 문제 2: 디자인의 병목 (The Design Bottleneck)
> "ScreenCopy가 써준 문구는 좋은데, 이걸로 다시 카드뉴스를 만들려니 귀찮아요."

- v1.0의 한계: 텍스트 복사 → Figma 실행 → 붙여넣기 → 폰트 조절 → 내보내기
- 이 과정이 귀찮아서 문구를 받고도 활용하지 못하는 유저 다수 발생
- 개발자는 디자인 툴을 여는 것 자체가 스트레스

### 문제 3: 글로벌 진출의 언어 장벽
> "한국에서는 반응이 좋은데, 미국/일본 진출은 엄두가 안 나요."

- DeepL/Google 번역기는 '마케팅 뉘앙스'를 살리지 못함
- 현지 앱스토어/SNS 감성에 맞는 톤앤매너를 모름

---

## 3. 솔루션 & 확장 전략

### 제품 개요
**ScreenCopy v2.0**은 단순 텍스트 생성을 넘어, **"이미지 합성"**과 **"SNS 바이럴 콘텐츠"**를 생성하는 종합 마케팅 에이전트입니다.

### ⚔️ 핵심 기능 확장 (The Upgrade)

#### 1. SocialSnap™ (SNS 포스트 자동 생성) - [Retention Key]
| 구분 | v1.0 (앱스토어용) | v2.0 (SNS용) |
| :--- | :--- | :--- |
| **길이** | 짧은 헤드라인 중심 (6-10단어) | 플랫폼별 최적화된 긴 글 + 해시태그 |
| **목적** | 구매 전환(Install) 유도 | 참여(Engagement) 및 바이럴 유도 |
| **빈도** | 1년에 1~2회 | **매주 1~3회 (구독 모델의 근거)** |

**지원 포맷**:
- **Twitter(X)**: 스레드(Thread) 구조, #BuildInPublic 스타일
- **LinkedIn**: 전문적인 톤, 비즈니스 인사이트 구조
- **Instagram**: 감성적인 캡션 + 이모지 활용

#### 2. Auto-Design Engine (디자인 자동 합성) - [Value Key]
| 구분 | v1.0 (텍스트만) | v2.0 (이미지 완성본) |
| :--- | :--- | :--- |
| **방식** | 텍스트 클립보드 복사 | 템플릿에 텍스트+스크린샷 자동 합성 |
| **결과** | 사용자 추가 작업 필요 | 즉시 업로드 가능한 `.png` 다운로드 |

**기술**: `satori` + `html2canvas` 활용하여 서버 부하 없이 클라이언트/Edge에서 생성

#### 3. Global Launcher (다국어 로컬라이징)
- 단순 번역이 아닌 **'Transcreation(창조적 번역)'**
- 예: "Save Time" (영어) → "칼퇴를 부르는 효율" (한국어 문화 반영)
- **지원 언어**: 한국어, 영어, 일본어, 스페인어 (주요 앱 시장)

---

## 4. 타겟 고객 확장

### Core Target: "Running Solo" (운영 중인 1인 개발자)
- **상태**: 앱을 출시했고, 초기 유저 100~500명 보유
- **고민**: "코딩할 시간도 부족한데 마케팅 콘텐츠 만들 시간이 없다"
- **니즈**: 스크린샷만 던져주면 알아서 일주일치 트위터 글을 써주는 비서

### New Target: "SaaS Builders"
- 앱스토어뿐만 아니라 웹 서비스(SaaS)를 운영하는 창업가
- Product Hunt 런칭 준비 중인 메이커
- 랜딩 페이지 헤더 카피와 SNS 홍보가 동시에 필요함

---

## 5. 핵심 기능 상세 (v2.0 Spec)

### 5.1 SocialSnap (SNS 생성기)

**Workflow**:
1. 스크린샷 업로드 (기존 동일)
2. 상황 선택: `새 기능 출시` / `성과 공유` / `개발 비하인드` / `사용자 후기`
3. AI 생성:
   - **Hook**: 시선을 끄는 첫 문장
   - **Body**: 문제 해결 스토리텔링
   - **CTA**: 다운로드 링크 유도
4. 플랫폼별 변환 버튼 (Twitter / LinkedIn / Insta)

**프롬프트 전략**:
Role: Viral Social Media Manager Input: Screenshot analysis + App Context Task: Write a Twitter thread using #BuildInPublic style. Tone: Humble but excited, professional yet personal. Structure:

Tweet 1: The Problem (Hook)

Tweet 2: The Old Way (Pain)

Tweet 3: My Solution (Screenshot)

Tweet 4: Result/Benefit

Tweet 5: Link (CTA)

### 5.2 Auto-Design (템플릿 엔진)

**제공 템플릿 (MVP 5종)**:
1. **The Minimalist**: 흰 배경, 그림자 효과, 중앙 배치 (Apple 스타일)
2. **The Bold**: 강렬한 배경색(브랜드 컬러), 큰 타이포그래피
3. **The Device**: 최신 아이폰 목업(Mockup) 프레임 자동 적용
4. **The Review**: 사용자 별점(⭐⭐⭐⭐⭐)과 리뷰 텍스트 강조
5. **The Feature**: 화살표와 말풍선으로 기능 강조

**구현 로직**:
- React 컴포넌트로 템플릿 미리 구현
- AI가 생성한 텍스트를 Props로 전달
- 사용자가 선택 시 해당 DOM 요소를 이미지로 변환 및 다운로드

---

## 6. 기술 스택 (With Antigravity)

### Base Platform (Antigravity 활용)
- **Framework**: Next.js (App Router)
- **Auth**: Antigravity 내장 인증 (Google/Email)
- **Database**: PostgreSQL (Prisma/Supabase)
- **Payment**: Stripe (Antigravity 설정 활용)

### Frontend & Image Gen
- **Satori (Vercel)**: HTML/CSS를 SVG/PNG로 변환 (서버리스 친화적)
- **html2canvas**: 클라이언트 사이드 이미지 생성 (백업용)
- **Lucide React**: 템플릿 내 아이콘 에셋

### AI & Backend
- **GPT-4o (Vision)**: 기존 동일 (프롬프트만 추가)
- **DeepL API (Optional)**: 로컬라이징 품질 보완용
- **Vercel Blob**: 생성된 이미지 임시 호스팅 (필요시)

---

## 7. 수익 모델 개선 (SaaS 전환)

### 7.1 Hybrid Model (Credit + Subscription)

| 플랜 | 가격 | 제공 가치 | 타겟 |
| :--- | :--- | :--- | :--- |
| **Pay-as-you-go** | $9/10credits | v1.0 기능 (앱스토어 카피만) | 초기 런칭만 하는 개발자 |
| **Pro Monthly** | **$19/월** | - **SNS 포스트 무제한 생성**<br>- 디자인 템플릿 전체 사용<br>- 워터마크 제거<br>- 다국어 생성 | **지속적 홍보가 필요한 운영자** |
| **Pro Yearly** | $190/년 | Pro 월간 혜택 + 2개월 무료 | 장기 운영자 |

### 7.2 Upsell Strategy
- 기존 v1.0 구매자(Credit user)에게 이메일 발송:
  > "앱 런칭 축하드립니다! 이제 홍보하셔야죠?
  > 남은 크레딧으로 **SNS 마케팅 포스트**를 무료로 만들어보세요."
- **Lock-in**: 앱 정보를 한 번 저장해두면, 매주 클릭 한 번으로 콘텐츠가 나오므로 구독 해지 방어.

---

## 8. 마케팅 & 진입 전략 (v2.0 GTM)

### 전략 1: "Dogfooding via BuildInPublic"
**실행**:
- ScreenCopy의 업데이트 과정을 ScreenCopy로 찍어서 트위터에 올림.
- "이 트윗도 ScreenCopy가 써준 겁니다"라고 마지막에 공개.
- **효과**: 개발자들에게 제품의 성능을 실시간 증명.

### 전략 2: "The Template Drop"
**실행**:
- 매주 새로운 '유행하는 디자인 템플릿'을 추가.
- 예: "요즘 실리콘밸리에서 유행하는 Bento Grid 스타일 템플릿 추가됨"
- **효과**: 기존 유저 재방문 유도.

### 전략 3: "Global Challenge"
**실행**:
- "당신의 앱을 일본/한국 시장에 소개하세요." 캠페인.
- Global Launcher 기능을 무료 체험(1회) 제공.
- 해외 유저 유입 맛을 보여주고 유료 전환 유도.

---

## 9. 개발 로드맵 (Antigravity Accelerated Sprint)

**전제**: Antigravity 사용으로 기본 인프라(로그인/결제) 구축 시간 단축.

### Week 1: SocialSnap 엔진 (Text Expansion)
- [ ] SNS용 시스템 프롬프트(Twitter, LinkedIn) 최적화
- [ ] UI에 '플랫폼 선택' 탭 추가
- [ ] 결과물 복사 기능 개선 (스레드 형식 지원)

### Week 2: Auto-Design 구현 (Visual Expansion)
- [ ] Satori 라이브러리 연동 테스트
- [ ] 기본 템플릿 3종(Minimal, Bold, Device) 코딩
- [ ] 텍스트+이미지 합성 및 다운로드 기능 구현

### Week 3: Subscription & Localization (Antigravity 연동)
- [ ] Stripe 정기 결제(Subscription) 플랜 활성화
- [ ] 다국어 프롬프트 테스트 (한/영/일)
- [ ] 기존 유저 DB 마이그레이션 (Credit 보상)

### Week 4: QA & Relaunch
- [ ] 기존 유저 대상 뉴스레터 발송 (v2.0 티저)
- [ ] Product Hunt "ScreenCopy 2.0" 페이지 준비
- [ ] 전체 기능 통합 테스트 및 런칭

---

## 10. 리스크 관리

### 리스크 1: 디자인 퀄리티 불만
- **문제**: "템플릿이 너무 뻔해요" 또는 "내 앱이랑 안 어울려요"
- **대응**:
    - "Canva를 대체하는 게 아닙니다. **빠르게 80점짜리를 만드는 것**이 목표입니다"라고 기대치 조절.
    - Figma 파일 내보내기 기능(추후)으로 커스텀 가능성 열어둠.

### 리스크 2: SNS API 변동
- **문제**: 트위터/링크드인 API 연동이 까다로움.
- **대응**: v2.0에서는 **'자동 업로드'는 지원하지 않음.** (복사/붙여넣기 방식 유지)
    - 계정 연동의 번거로움을 없애고 개발 공수 최소화.

---

## 11. 성공 지표 (KPIs)

### v2.0 Success Metrics
| 지표 | 목표 | 의미 |
| :--- | :--- | :--- |
| **MRR** | $1,000+ | 구독 모델 안착 여부 |
| **Retention** | 30% (Month 2) | 지속 사용 가치 증명 (기존 5% 미만 예상) |
| **User Action** | 유저당 주 2회 생성 | 마케팅 툴로서의 효용성 |
| **Share Rate** | 10% | 생성된 이미지가 실제 SNS에 올라가는 비율 |

---

## 12. 결론: Why Upgrade?

ScreenCopy v1.0이 **"개발자의 귀찮음(글쓰기)을 한 번 해결해 주는 진통제"**였다면,
ScreenCopy v2.0은 **"개발자의 성공(유저 유입)을 돕는 영양제"**입니다.

이미 구축된 인프라(Antigravity) 위에 **'SNS'**와 **'디자인'**이라는 날개를 달아,
단순 툴(Tool)에서 **필수 SaaS**로 넘어가는 가장 확실한 단계입니다.

**Next Step:**
오늘 바로 `SocialSnap` 프롬프트를 테스트하여, 기존 유저들에게 이메일로 "트위터 글 무료로 써드립니다"를 제안해보세요. 반응이 온다면 v2.0은 성공입니다. 🚀