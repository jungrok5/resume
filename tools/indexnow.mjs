// IndexNow 제출 — Bing · Naver · Yandex · Seznam 에 URL 변경을 즉시 알린다.
// (Google 은 IndexNow 미지원 — Search Console 에서 별도 제출해야 한다.)
// 사용: node tools/indexnow.mjs
import { readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HOST = 'jungrok5.github.io'
const BASE = `https://${HOST}/resume`

// public/ 에 있는 32자리 hex .txt 파일이 IndexNow 키다
const key = readdirSync(resolve(ROOT, 'public'))
  .map((f) => f.match(/^([0-9a-f]{32})\.txt$/)?.[1])
  .find(Boolean)
if (!key) throw new Error('public/ 에서 IndexNow 키 파일(<32자리hex>.txt)을 찾지 못했습니다')

const urlList = [
  `${BASE}/`,
  `${BASE}/en/`,
  `${BASE}/interactive.html`,
  `${BASE}/llms.txt`,
  `${BASE}/llms-en.txt`,
  `${BASE}/llms-full.txt`,
  `${BASE}/sitemap.xml`,
]

const body = { host: HOST, key, keyLocation: `${BASE}/${key}.txt`, urlList }
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})
const text = await res.text()
console.log(`[indexnow] HTTP ${res.status} ${res.statusText}`)
console.log(`[indexnow] URL ${urlList.length}건 제출 · key=${key}`)
if (text.trim()) console.log(`[indexnow] 응답: ${text.trim().slice(0, 300)}`)
// 200/202 = 접수. 4xx 는 키 파일 미배포가 대부분(배포 완료 후 재시도).
process.exit(res.ok ? 0 : 1)
