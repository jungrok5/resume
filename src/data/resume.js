// 콘텐츠 + 씬 메타데이터의 단일 원본(SSOT).
// 각 섹션은 하나의 3D 씬과 하나의 HTML 오버레이 패널에 1:1로 대응된다.
// 시각화가 자연스러운 항목엔 scene을 붙이고, 순수 텍스트 항목은 scene 없이 둔다.

export const profile = {
  name: '오정록',
  nameEn: 'Jeongrok Oh',
  title: '테크니컬 디렉터 · MMO 서버 아키텍트',
  years: 20,
  email: 'jungrok5@gmail.com',
  github: 'https://github.com/jungrok5',
  education: '홍익대학교 컴퓨터정보통신소프트웨어전공 (2000 — 2007)',
  legacy: 'http://resume.jungrok5.workers.dev/',
  // 문서형 이력서(기본 뷰)의 '핵심 역량' 5개와 동일한 내용
  competencies: [
    'MMO 서버를 백지에서 끝까지 반복 설계·구축 — 네트워크·동시성(락프리)·네비게이션·서버 물리·분산 서버(Orleans)',
    'PC MMORPG · 모바일 RPG · 유저 창작 메타버스 · 분산 서버 RPG — 폭넓은 장르·플랫폼·아키텍처',
    '난제 해결·성능 최적화 — 프로파일링으로 CPU·메모리·네트워크·DB 병목 제거, 동접·처리량 수 배',
    '서버 · 클라이언트 · 웹 · DB · 툴 · 개발 인프라 · CI까지 커버하는 풀스택 실무',
    'AI 개발 도구(MCP·에이전트·로컬 LLM) 도입 주도',
  ],
  recognition: [
    'NCDP 2019 최우수상 — "1000 vs 1000 대규모 유저를 채널 없이 서비스 하기 위한 고민들"',
    '서버 최적화·기술 자문 — 트릭스터M 파견, 안정 동접 2천 → 8천(4배)',
    'NCSOFT 시니어 전문면접관 · Job Title 운영위원 (Programming, 2019 — 2021)',
    'ETRI 공동 기술 개발 (2010) — 온라인 게임 서버 부하 테스트',
  ],
}

// accent 키는 theme.css / palette.js 의 색상 변수에 매핑된다.
// 패널 구성 원칙: 이력서(기본 뷰)를 충실히 요약한 핵심 불릿 + 대표 수치 하나.
// 장식성 요소(태그·중복 서브타이틀)는 두지 않는다. 씬이 '어떻게'를 보여주고,
// 불릿이 '무엇을 했는지'를 말한다.
export const sections = [
  {
    id: 'hero',
    scene: 'hero',
    align: 'center',
    accent: 'cyan',
    kicker: '게임 서버 프로그래머 · 경력 20년',
    name: profile.name,
    sub: '20년간 MMO 서버 프레임워크를 백지에서 반복 설계·구축해온 Technical Director. 네트워크·동시성·네비게이션·서버 물리를 근본부터 다루며, 대규모 트래픽 최적화와 난제 해결이 강점입니다.',
  },
  {
    id: 'career',
    scene: 'timeline',
    align: 'left',
    accent: 'cyan',
    num: '01',
    kicker: '커리어 개요 · 2007 — 현재',
    title: '20년의 서버 여정',
    points: [
      '매니징보다 기술을 직접 주도하고 혁신을 만들어내는 역할을 지향',
      '2007–2015 국내·일본·중국·태국 다수 타이틀 상용 서비스·라이브 운영',
    ],
    isTimeline: true,
  },

  // ───────── NCSOFT · Pantera (2024 — 현재) ─────────
  {
    id: 'pantera',
    scene: 'actorModel',
    align: 'right',
    accent: 'violet',
    num: '02',
    kicker: 'NCSOFT · Pantera · 2024 — 현재',
    title: '분산 액터 아키텍처',
    metric: { big: 'Orleans', cap: '액터 모델 동시성 · gRPC → TCP' },
    points: [
      'Orleans Grain 모델 채택 주도 — 분산 서버 아키텍처 방향 결정, 팀 표준 정착',
      'gRPC→TCP 전송 계층 전환, 샤딩 기반 데이터 분산 구조 확립',
      '영역전(대규모 진영전) · 슬라임대난투(3:3 팀 PvP) · 용던 등 대형 컨텐츠 서버 설계·구현',
    ],
  },
  {
    id: 'pipeline',
    scene: 'dataPipeline',
    align: 'left',
    accent: 'blue',
    num: '03',
    kicker: 'NCSOFT · Pantera · 2024 — 현재',
    title: '데이터 파이프라인 단일 소스 표준화',
    metric: { big: 'proto', cap: '단일 소스 → 서버·클라 코드 · CSV · 검증' },
    points: [
      'proto 단일 소스에서 서버·클라 코드·CSV·유효성 검증을 자동 생성',
      '스탯 계산 코드 생성으로 신규 항목 추가 비용 최소화 — 팀 전체 작업 방식으로 채택',
    ],
  },
  {
    id: 'sharding',
    scene: 'sharding',
    align: 'right',
    accent: 'green',
    num: '04',
    kicker: 'NCSOFT · Pantera · 2024 — 현재',
    title: '부하 테스트 · 서버/DB 최적화',
    metric: { big: '24만 req/s', cap: 'gRPC 실측 · EntityFramework 5만 TPS' },
    points: [
      '부하 테스트 인프라 구축 — gRPC 초당 24만 요청, EF 5만 TPS 상한 실측',
      '키 해싱 샤드 라우팅 — 단일 DB 병목 없이 처리량 수평 확장',
      '저장프로시저 전환·dacpac 형상 관리, Orleans·브로드캐스팅·DB 계층 병목 제거',
    ],
  },

  // ───────── NCSOFT · Miniverse PC / UE5 (2023 — 2024) ─────────
  {
    id: 'densebuild',
    scene: 'denseBuild',
    align: 'left',
    accent: 'green',
    num: '05',
    kicker: 'NCSOFT · Miniverse UE5 · 2023 — 2024',
    title: '초대규모 UGC 처리',
    metric: { big: '5,000만', cap: '프랍 풀 틱 · 동시 2,000명 밀집 건축' },
    points: [
      '단일 공간 5,000만 프랍 풀 틱 실시간 처리 + 동시 2,000명 밀집 건축',
      '공간당 단일 디스패처 액터 모델 — 락프리 · zero-copy 브로드캐스트로 락 경합 제거',
      '집터·청크·셀 3단 공간 분할과 시야 기반 전송으로 트래픽·메모리 관리',
    ],
  },
  {
    id: 'renderopt',
    scene: 'renderOpt',
    align: 'right',
    accent: 'green',
    num: '06',
    kicker: 'NCSOFT · Miniverse UE5 · 2023 — 2024',
    title: '렌더링 · 물리 최적화',
    metric: {
      pairs: [
        { label: '드로우콜', from: '20,967', to: '503' },
        { label: 'FPS', from: '16.5', to: '47.4' },
      ],
    },
    points: [
      'ISM 인스턴싱으로 드로우콜 폭증 해소',
      '플레이어 주변 물리 청킹 — 물리 씬 상주 바디 수가 프랍 총수와 무관',
    ],
  },
  {
    id: 'navmesh',
    scene: 'voxelNav',
    align: 'left',
    accent: 'cyan',
    num: '07',
    kicker: 'NCSOFT · Miniverse UE5 · 2023 — 2024',
    title: '서버사이드 다이나믹 네비메시',
    metric: { big: 'A*', cap: '변경된 복셀 타일만 재생성' },
    points: [
      '유저가 실시간으로 바꾸는 지형에 대응 — 영향받은 타일만 재계산, 맵 전체를 다시 굽지 않음',
      '서버 권위 이동 · A* 길찾기 (복셀 기반)',
      '지형·길찾기·충돌을 실시간 시각화하는 Godot 기반 서버 뷰어 자체 개발',
    ],
  },
  {
    id: 'ownership',
    scene: 'clientNpc',
    align: 'right',
    accent: 'green',
    num: '08',
    kicker: 'NCSOFT · Miniverse UE5 · 2023 — 2024',
    title: '클라이언트 위임 분산 시뮬레이션',
    metric: { big: '오너십 이전', cap: '클라이언트 위임 · 서버 권위 검증' },
    points: [
      '로블록스 분산 물리(네트워크 오너십) 개념을 NPC AI에 자체 구현',
      'NPC 시뮬레이션을 최근접 클라이언트에 위임 — 유저 이동에 따라 오너십 무중단 마이그레이션',
      "서버는 권위 검증·중계만 담당 — 부하가 'NPC 총수'가 아닌 '유저 주변 활성 NPC 수'로 수렴",
    ],
  },

  // ───────── NCSOFT · Miniverse Web / Godot (2021 — 2023) ─────────
  {
    id: 'web',
    scene: 'webCollab',
    align: 'left',
    accent: 'blue',
    num: '09',
    kicker: 'NCSOFT · Miniverse Web (Godot) · 2021 — 2023',
    title: '웹 실시간 협업 에디터',
    metric: { big: '1,000+', cap: '동시 실시간 커서' },
    points: [
      '브라우저 한 공간에서 1,000명 이상 동시 커서 동기화, 충돌·병합 없는 동시 편집',
      '유저 창작 스크립트 런타임 R&D — 무패치 로직 다운로드 실행, 서버 권위 판정(치팅 방지)',
      'Node.js → C# 데디 서버 전환, 소켓/프로토콜 성능 실측으로 구조 결정',
    ],
  },
  {
    id: 'propgames',
    scene: 'propGames',
    align: 'right',
    accent: 'amber',
    num: '10',
    kicker: 'NCSOFT · Miniverse Web (Godot) · 2021 — 2023',
    title: '프랍 조합 미니게임',
    metric: { big: '다중 게임', cap: '한 공간 · 프랍 메시지로 구동' },
    points: [
      '서바이벌 · 페인트맨(팀전)을 유저 스크립트와 프랍 간 메시지 교환만으로 제작',
      '한 공간에서 다중 게임 동시 플레이 실증 — 사내 취업 설명회 공개',
    ],
  },

  // ───────── NCSOFT · AION2 (2016 — 2021) ─────────
  {
    id: 'combat',
    scene: 'denseCombat',
    align: 'left',
    accent: 'amber',
    num: '11',
    kicker: 'NCSOFT · AION2 · 2016 — 2021',
    title: '채널 없는 대규모 밀집 전투',
    metric: { big: '1,300만', cap: '패킷/초 → 처리량 3배 · 트래픽 -36%' },
    points: [
      'MMO 서버 프레임워크 전체를 백지에서 설계·구축 — 프로그래머 ~40명 기술 디렉팅',
      '한 시야 1,000명 전투의 초당 1,300만 패킷을 세션/필드 분산(3배↑) · 셀 브로드캐스팅 · Packet Shrink(-36%)로 해결',
      '이후 2,000 vs 2,000 전투로 확장 — NCDP 2019 최우수상',
    ],
  },
  {
    id: 'raycast',
    scene: 'raycast3d',
    align: 'right',
    accent: 'cyan',
    num: '12',
    kicker: 'NCSOFT · AION2 · 2016 — 2021',
    title: '3D 공간 비행 네비게이션',
    metric: { big: '3D', cap: '복셀 기반 · 서버 처리' },
    points: [
      '지상 평면을 넘어, 비행체의 3차원 이동·길찾기를 서버에서 처리 (복셀 기반)',
      '씬의 비행체는 실제로 레이를 쏘아 장애물을 피해 조향한다 — 반응하는 시각화',
    ],
  },

  // ───────── NCSOFT · 기술 자문 파견 ─────────
  {
    id: 'trickster',
    scene: 'trickster',
    align: 'left',
    accent: 'green',
    num: '13',
    kicker: 'NCSOFT · 트릭스터M 서버 최적화 파견 · 2020 — 2021',
    title: '동접 2,000 → 8,000',
    metric: {
      pairs: [{ label: '안정 동접', from: '2,000', to: '8,000' }],
    },
    points: [
      '타 프로젝트 요청으로 3개월 파견 — 같은 하드웨어에서 수용량 4배',
      '메모리릭 제거 · 브로드캐스팅 최적화(시야 통합) · DB 처리 분리 · 동적 할당 풀링',
    ],
  },

  // ───────── 현재 · 마무리 ─────────
  {
    id: 'ai',
    scene: 'aiDev',
    align: 'center',
    accent: 'blue',
    num: '14',
    kicker: 'NCSOFT · Pantera · AI 개발 생산성 혁신 주도',
    title: 'AI 개발 생산성 혁신',
    metric: { big: 'MCP', cap: '자연어 서버 테스트 · AI 에이전트 · 로컬 LLM' },
    points: [
      'MCP 서버 자체 구현 — 자연어 기반 서버 테스트 자동화',
      'AI 테스트·코드리뷰 에이전트 팀 구성 (테스트 → 로그 분석 → DB 검증 → 보고서)',
      '사내 코드 유출 없는 로컬 LLM 코딩 스택 구축·배포',
    ],
    contact: true,
    summary: true, // 마지막 패널: 학력·수상·전체 스택도 함께 노출
  },
]

// 타임라인 씬 + 폴백 문서가 쓰는 경력 요약 (최신 → 과거)
export const timeline = [
  ['2024 — 현재', 'NCSOFT · Pantera', '분산 MMO 백엔드 (Orleans / .NET / UE5)'],
  ['2023 — 2024', 'NCSOFT · Miniverse (UE5)', 'UGC 샌드박스 MMO — 5,000만 프랍 · 2,000명'],
  ['2021 — 2023', 'NCSOFT · Miniverse (Web)', '유저 창작 웹 메타버스 (Godot) · 1,000+ 커서'],
  ['2016 — 2021', 'NCSOFT · AION2 모바일', '테크니컬 디렉터 · MMO 프레임워크 백지 구축'],
  ['2007 — 2015', '액토즈소프트 · KB온라인 · 자이언트드림 · 위메이드 · 코어크리에이티브', '서버팀장 / 프로그램팀장 / 서버파트리더 — 국내·일본·중국·태국 상용 서비스'],
]

// 문서형 이력서(기본 뷰)의 '기술 스택' 그룹과 동일
export const stack = {
  언어: ['C++ (11–20)', 'C#', 'TypeScript / JS', 'Python', 'Lua', 'GDScript'],
  '서버 · 분산': ['Orleans', 'gRPC / TCP', 'ASP.NET', 'Node.js', 'IOCP', 'WebSocket'],
  데이터: ['MSSQL · 저장프로시저', 'Redis / Garnet', 'MongoDB', 'EntityFramework', '샤딩'],
  '엔진 · 네비 · 물리': ['Unreal 3/4/5', 'Unity3D', 'Godot', 'Gamebryo', 'Recast / Detour', '복셀 네비메시'],
  'AI · 인프라': ['Claude · Agent SDK', 'MCP (자체 구현)', '로컬 LLM (llama.cpp)', 'Perforce', 'Jenkins', '.NET Aspire'],
}
