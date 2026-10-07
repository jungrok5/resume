---
name: aeo-audit
description: 웹사이트(특히 이력서 사이트 jungrok5.github.io)의 AEO·GEO·SEO 준비도를 점수로 측정하고 우선순위별 수정안을 낸다. "AI 검색 점수", "AEO/GEO 점검", "llms.txt·구조화 데이터 확인", "tryoreum 점수가 낮다" 같은 요청에 사용.
---

# AEO / GEO / SEO 점검

## 1. 측정 (API 키 불필요, 약 10초)

```bash
bash .claude/skills/aeo-audit/scripts/audit.sh                 # 이력서 한/영 페이지
bash .claude/skills/aeo-audit/scripts/audit.sh https://example.com
```
내부적으로 `geo-optimizer-skill`(Auriti-Labs, MIT)을 임시 venv에 설치해 `geo audit --format json`을 돌린다.
추가 명령: `geo audit --url U --threshold 70`(미달 시 exit 1, CI용) · `geo fix --url U`(수정안 미리보기) ·
`geo llms --base-url U`(llms.txt 생성) · `geo citations --brand X --domain D`(AI가 실제로 인용하는지, **LLM API 키 필요**).

## 2. 도구 비교 (2026-10 조사)

| 도구 | 라이선스·상태 | 특징 | 판단 |
|---|---|---|---|
| **Auriti-Labs/geo-optimizer-skill** | MIT · 1,000★+ · v4.18 · 테스트 2,000+ | 8개 카테고리 0–100, AI봇 27종, RAG 청크·Trust Stack, CLI/Python/MCP/GitHub Action, html·pdf·sarif 출력 | **기본 도구** |
| pooriaarab/usegeoaeo (`npx geoaeo audit`) | MIT · 신생(0★) | 25개 가중 체크 + llms.txt·JSON-LD **생성기**, MCP | 생성기가 필요할 때 보조 |
| g-shevchenko/geo-audit | MIT · 3★ · v0.2 | 7모듈, `actions.md`로 P0–P3 정리, 브랜드 언급은 LLM 키 필요 | 액션플랜 형식 참고용 |
| ngstcf/ai-seo-auditor, qq136692547-cmyk/geo-score | 소규모 | 11카테고리 / 웹 기반 | 검증 안 함 |
| **tryoreum.com** (SaaS) | 무료 진단 + 유료 | 한국 검색 전용. 온페이지·콘텐츠(본문 300자 미만, H1, alt)·링크·크롤링·속도·**AI 검색 준비(질문형 헤더, llms.txt, 콘텐츠/코드 비율)** | 로그인 필요라 자동화 불가. 한국어/네이버 관점 보완용 |

점수 체계가 도구마다 달라 **서로 비교하지 말고 같은 도구의 전/후만 비교**한다.

## 3. 이 사이트에서 확인된 사실 (2026-10-07, geo-optimizer 4.18.3)

기준 점수 **63/100 Foundation**(한글 페이지; 영문 `/en/`은 59): robots 18/18 · **llms 0/18** · schema 10/16 · meta 14/14 · content 12/12 · signals 4/6 · **ai_discovery 0/6** · brand 6/10.

- **호스트 루트 규칙이 핵심.** `robots.txt`·`llms.txt`·`/.well-known/`·`/ai/*`는 `jungrok5.github.io/` 루트에 있어야 읽힌다.
  이력서는 프로젝트 페이지(`/resume/`)라 `/resume/llms.txt`는 도구도 크롤러도 못 본다(루트는 `jungrok5/jungrok5.github.io` 저장소).
- GSC URL 접두어 속성(`/resume/`)에는 그 아래 sitemap만 제출 가능. 루트 sitemap은 robots.txt의 `Sitemap:` 줄로 알린다.
- `ncsoft` 키워드 밀도 3.3% 경고는 경력 서술상 정상이라 무시 가능. WebMCP·폼 라벨 권고는 이력서와 무관.
- 영문 페이지는 WebSite 스키마가 없다고 감점(한글 페이지 `@graph`에는 있음).

## 4. 수정 우선순위 (효과/비용)

1. 루트 저장소에 `llms.txt`(+`llms-full.txt`) 배치 → llms 0→18 예상
2. `/.well-known/ai.txt`, `/ai/summary.json`, `/ai/faq.json`을 루트에 → ai_discovery 0→6
3. 영문 페이지에 WebSite 스키마, `sameAs`에 Wikipedia/Wikidata/Crunchbase류 추가(현재 1/4 — 개인은 현실적으로 어려움, 무리하지 않는다)
4. 질문형 헤더(`## 어떤 일을 했나요?` 등)와 문단 첫 문장 정의형 — RAG 청크 56/100, tryoreum의 "질문형 헤더"에도 해당
5. RSS 피드, 영상에 VideoObject·자막(Hellfarm 영상)

## 5. 주의
- llms.txt는 **검증된 순위 요인이 아니다**(도구 자체도 명시). 구조 신호로만 취급한다.
- 점수를 올리려고 키워드를 늘리거나 사실이 아닌 내용을 넣지 않는다. 이력서의 수치는 전부 실측 기준을 유지한다.
- 측정 후엔 변경 → 배포(Pages 반영 ~1분) → 재측정. IndexNow는 `npm run indexnow`(이력서 저장소).
