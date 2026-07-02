# 배포 · 검색 · 통계 설정 가이드

이 저장소는 **하나의 GitHub Pages 사이트**에 두 가지 이력서를 함께 담습니다.

| 경로 | 내용 | 특징 |
|------|------|------|
| `/` (`index.html`) | **문서형 이력서** — 기본 · ATS · 링크드인 · 상세 4개 뷰 + 다크모드 + 인쇄 | 정적 HTML, 매우 빠름, 검색·채용담당자·ATS 친화 (기본 랜딩) |
| `/interactive.html` | **3D 인터랙티브 이력서** — 스크롤 기반 WebGL 체험 (React + Three.js) | 무거운 번들은 이 페이지에서만 로드 |

문서형 상단 스위처의 **`✨ 3D`** 탭을 누르면 인터랙티브 페이지로 이동하고,
인터랙티브 화면 좌상단 **`← 이력서`** 링크로 돌아옵니다.

---

## 1. GitHub Pages 켜기 (최초 1회)

1. 이 브랜치를 `main`에 병합합니다. (배포 워크플로 `.github/workflows/deploy.yml`는 `main` 푸시에서만 동작)
2. GitHub 저장소 **Settings → Pages → Build and deployment → Source: `GitHub Actions`** 선택.
3. `main`에 반영되면 Actions가 빌드·배포하고, 사이트가 아래 주소로 게시됩니다:
   **https://jungrok5.github.io/resume/**

> 로컬 확인: `npm ci && npm run build && npm run preview`

---

## 2. Google Search Console (검색 노출·색인)

1. https://search.google.com/search-console 접속 → 속성 추가.
2. **URL 접두어** 방식으로 `https://jungrok5.github.io/resume/` 입력.
3. 소유 확인 방법 중 **HTML 태그**를 선택하면 `<meta name="google-site-verification" content="...">` 값을 줍니다.
   - `index.html`의 `PASTE_YOUR_GOOGLE_SITE_VERIFICATION_TOKEN` 자리에 그 토큰을 붙여넣고 커밋·배포하세요.
   - (파일 업로드 방식을 쓰려면, 받은 `google*.html` 파일을 `public/`에 넣으면 사이트 루트로 배포됩니다.)
4. 확인 완료 후 **Sitemaps** 메뉴에서 `sitemap.xml` 제출:
   - 전체 주소: `https://jungrok5.github.io/resume/sitemap.xml`
5. `robots.txt`와 `sitemap.xml`은 이미 `public/`에 있어 루트로 배포됩니다.

> 참고: `github.io`는 공유 도메인이라 **도메인 속성**은 불가하고 **URL 접두어 속성**만 됩니다.
> 커스텀 도메인을 붙이면 도메인 단위 색인·검증이 가능합니다(4번 참고).

---

## 3. Google Analytics (방문 통계, GA4)

1. https://analytics.google.com 에서 GA4 속성 생성 → **측정 ID**(`G-XXXXXXXXXX`) 발급.
2. `index.html`과 `interactive.html` 두 파일의 아래 줄을 찾아 실제 ID로 교체:
   ```js
   window.__GA_ID__ = 'G-XXXXXXXXXX'; // ← 여기에 GA4 측정 ID 입력
   ```
3. 커밋·배포하면 자동으로 gtag가 로드되어 방문 통계가 수집됩니다.
   - 플레이스홀더(`G-XXXX...`) 상태에서는 아무 것도 로드하지 않으니, ID를 넣기 전까지는 통계가 잡히지 않습니다.

> 쿠키 없는 대안(Cloudflare Web Analytics / Plausible / GoatCounter)을 원하면 이 스니펫 대신
> 해당 서비스의 스크립트 한 줄을 `<head>`에 넣으면 됩니다. 말씀해 주시면 교체해 드립니다.

---

## 4. (선택) 커스텀 도메인

`jungrok5.github.io/resume/` 대신 `resume.jungrok5.com` 같은 주소를 쓰려면:

1. `public/CNAME` 파일에 도메인 한 줄(예: `resume.jungrok5.com`)을 넣습니다.
2. 이미 Cloudflare(`workers.dev`)를 쓰시므로, DNS에 `CNAME` 레코드로 `jungrok5.github.io` 를 가리키게 합니다.
3. GitHub **Settings → Pages → Custom domain**에 같은 도메인을 입력하고 HTTPS 강제를 켭니다.
4. 도메인이 바뀌면 아래 값들도 새 주소로 갱신하세요:
   - `index.html` / `interactive.html`의 `canonical`·`og:url`
   - `public/robots.txt`의 `Sitemap:` 주소
   - `public/sitemap.xml`의 `<loc>` 주소

---

## 요약 체크리스트

- [ ] 이 브랜치 → `main` 병합, Pages Source = GitHub Actions
- [ ] Search Console 소유 확인 토큰을 `index.html`에 입력
- [ ] Search Console에 `sitemap.xml` 제출
- [ ] GA4 측정 ID를 `index.html`·`interactive.html`에 입력
- [ ] (선택) 커스텀 도메인 + `CNAME` + 주소 갱신
- [ ] (선택) `og.png` 미리보기 이미지 추가
