// index.html 의 '상세' 뷰(#view-detail)를 평문으로 추출해 public/llms-full.txt 를 생성한다.
// 손으로 관리하면 이력서를 고칠 때마다 낡는다 — 실제로 llms.txt 가 그렇게 두 달 낡았다.
// 빌드(`npm run build`) 전에 자동 실행된다(package.json prebuild).
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://jungrok5.github.io/resume'
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8')

// 상세 뷰만 잘라낸다. (기본/출력 뷰는 같은 내용의 요약본이라 중복)
const start = html.indexOf('<div id="view-detail"')
if (start < 0) throw new Error('#view-detail 을 찾지 못했습니다 — index.html 구조가 바뀐 듯합니다')
const end = html.indexOf('<div id="view-ats"', start)
const body = html.slice(start, end > start ? end : undefined)

const ENT = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
  '&rarr;': '→', '&times;': '×', '&middot;': '·', '&mdash;': '—', '&ndash;': '–',
}
const decode = (s) => s.replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? m)

const text = body
  // 미디어·스크립트·스타일은 평문에서 의미가 없다
  .replace(/<(script|style|video|img|svg)\b[\s\S]*?<\/\1>/gi, '')
  .replace(/<(img|video|source|br)\b[^>]*\/?>/gi, '\n')
  // 표는 행 단위로 펼친다(셀 구분자는 ' | ')
  .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, ' | ')
  .replace(/<\/tr>/gi, '\n')
  // 제목·문단·목록에 줄바꿈 부여
  .replace(/<h([1-6])[^>]*>/gi, (_, n) => '\n\n' + '#'.repeat(Number(n)) + ' ')
  .replace(/<\/h[1-6]>/gi, '\n')
  .replace(/<li[^>]*>/gi, '\n- ')
  .replace(/<\/(p|div|ul|ol|table|section)>/gi, '\n')
  .replace(/<hr\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .split('\n').map((l) => decode(l).replace(/[ \t]+/g, ' ').trim()).join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim()

const today = new Date().toISOString().slice(0, 10)
const out = `# 오정록 (Jeongrok Oh) — 상세 이력서 전문

> AI 검색·답변 엔진을 위한 전문(full text) 버전입니다. 요약본은 ${SITE}/llms.txt 에 있습니다.
> 원본 웹 이력서: ${SITE}/  ·  최종 갱신: ${today}
> 이 문서의 모든 수치는 실제 프로젝트에서 측정한 값입니다.

연락처: jungrok5@gmail.com · GitHub: https://github.com/jungrok5

${text}
`
writeFileSync(resolve(ROOT, 'public/llms-full.txt'), out)
console.log(`[llms-full] public/llms-full.txt 생성 — ${out.length.toLocaleString()}자`)
