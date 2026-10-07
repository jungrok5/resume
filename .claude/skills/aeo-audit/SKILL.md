---
name: aeo-audit
description: 이 이력서 사이트(jungrok5.github.io/resume)의 AEO/GEO/SEO 점검 메모. 점검 도구와 방법은 범용 스킬 x-eo(github.com/jungrok5/x-eo)를 쓰고, 여기엔 이 사이트에만 해당하는 사실과 남은 작업만 둔다.
---

# 이력서 사이트 AEO 메모

**도구·워크플로·증거 등급은 범용 스킬 `x-eo`를 쓴다** (중복 관리하면 어긋나서 스크립트를 이 저장소에서 제거함).
```bash
git clone --depth 1 https://github.com/jungrok5/x-eo.git /tmp/x-eo
bash /tmp/x-eo/skills/x-eo/scripts/audit.sh https://jungrok5.github.io/resume/ https://jungrok5.github.io/resume/en/
bash /tmp/x-eo/skills/x-eo/scripts/host-root-check.sh https://jungrok5.github.io/resume/
```

## 이 사이트에만 해당하는 사실 (2026-10-07 측정, geo-optimizer-skill 4.18.3)
- 기준 점수: 한글 63 / 영문 59. 감점 원인은 `llms.txt`(0/18)·AI 디스커버리(0/6) — 파일이 `/resume/` 아래에만 있고 **호스트 루트에는 없음**.
- 루트 저장소 `jungrok5/jungrok5.github.io`가 있어 루트에 `robots.txt`·`sitemap.xml`(sitemapindex)·이동용 `index.html`이 배포돼 있다. 루트에 **`llms.txt`·`/.well-known/ai.txt`·`/ai/*.json`은 아직 없음**.
- 이 파일들은 Tier C(Google이 무시한다고 명시 — 2026-07-10 가이드)라 **점수용 선택 사항**이다. 효과가 입증된 일(Tier A)은 이미 끝남: 크롤러 허용, 구조화 데이터 파싱 통과, 본문 JS 없이 노출, canonical/hreflang.
- Search Console 속성은 URL 접두어 `/resume/` — 루트 sitemap 은 제출 불가(robots.txt 의 `Sitemap:` 로 노출).
- `ncsoft` 키워드 밀도 경고는 경력 서술상 정상(무시). WebMCP·폼 라벨 권고는 이력서와 무관.

## 남은 작업 (원하면)
1. 루트 저장소에 `llms.txt`·`llms-full.txt`(+ 선택: ai.txt, ai/*.json) — Tier C, 점수용.
2. 영문 페이지 WebSite 스키마.
3. Bing Webmaster Tools(Search Console 임포트) — 계정 작업.
