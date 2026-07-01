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
  education: '홍익대학교 컴퓨터공학 (2000 — 2007)',
  legacy: 'http://resume.jungrok5.workers.dev/',
  competencies: [
    'MMO 서버 아키텍처 — 분산 시스템(Orleans), 액터 모델 동시성, 네트워킹/브로드캐스트, 내비게이션, 서버 물리',
    '성능 최적화 — 프로파일링 기반 병목 제거(CPU·메모리·네트워크·DB), 처리량 스케일링',
    '풀스택 설계 — 서버·클라이언트·DB·웹·툴링을 아우르는 통합 아키텍처',
    '차세대 플랫폼 · UGC — 유저 생성 콘텐츠 스크립트 런타임, 대규모 실시간 UGC 처리',
    'AI 주도 개발 — 커스텀 MCP, AI 테스트/코드리뷰 에이전트, 로컬 LLM 코딩 스택',
  ],
  recognition: [
    'NCDP 2019 우수상',
    'NCSOFT 시니어 면접관 · 직급 위원회 (2019 — 2021)',
    '성능 컨설팅 — 외부 프로젝트 4배 스케일링 달성',
    'ETRI 공동 연구 (2010)',
  ],
}

// accent 키는 theme.css / palette.js 의 색상 변수에 매핑된다.
export const sections = [
  {
    id: 'hero',
    scene: 'hero',
    align: 'center',
    accent: 'cyan',
    kicker: '20년 · 서버 시스템',
    name: profile.name,
    sub: '테크니컬 디렉터 · MMO 서버 아키텍트 — 대규모 게임 월드를 떠받치는 ‘보이지 않는 서버 시스템’을 눈에 보이게.',
  },
  {
    id: 'career',
    scene: 'timeline',
    align: 'left',
    accent: 'cyan',
    num: '01',
    kicker: '커리어 개요',
    title: '20년의 서버 여정',
    year: '2007 — 현재',
    blurb:
      '온라인 게임 서버 개발 20년. 서버팀 리드에서 시작해 프레임워크 아키텍트, 프로그램 디렉터, 테크니컬 디렉터를 거쳐 지금은 분산 MMO 백엔드를 설계한다.',
    isTimeline: true,
    tags: ['Pantera', 'Miniverse', 'AION2 Mobile', 'NCSOFT', '위메이드', 'Actozsoft'],
  },
  {
    id: 'pantera',
    scene: 'actorModel',
    align: 'right',
    accent: 'violet',
    num: '02',
    kicker: 'Pantera · 2024 — 현재',
    title: '분산 액터 아키텍처',
    year: '2024 — 현재',
    blurb:
      'Orleans 기반 가상 액터 백엔드. 그레인이 필요할 때 활성화되어 자기 상태를 단일 스레드로 처리하고, gRPC/TCP로 클러스터 전역에 메시지를 주고받는다. 부하에 따라 수평 확장 — 공유 락도, 뜨거워지는 단일 노드도 없다.',
    metric: { big: 'Orleans', cap: '액터 모델 동시성 · gRPC/TCP' },
    tags: ['C#', '.NET', 'Orleans', 'gRPC', 'Redis / Garnet', 'MSSQL', 'UE5'],
  },
  {
    id: 'pipeline',
    scene: 'dataPipeline',
    align: 'left',
    accent: 'blue',
    num: '03',
    kicker: 'Pantera · 2024 — 현재',
    title: '데이터 파이프라인 자동화',
    year: '2024 — 현재',
    blurb:
      '수집 → 변환 → 검증 → 적재로 이어지는 데이터 파이프라인을 자동화했다. 운영 데이터가 사람 손을 거치지 않고 스테이지를 흘러 대규모 콘텐츠 시스템으로 들어간다.',
    metric: { big: '자동화', cap: '수집 → 변환 → 적재 파이프라인' },
    tags: ['데이터 파이프라인', 'ETL', '자동화', '대규모 콘텐츠'],
  },
  {
    id: 'sharding',
    scene: 'sharding',
    align: 'right',
    accent: 'green',
    num: '04',
    kicker: '풀스택 · 데이터 계층',
    title: '샤딩 · 분산 데이터',
    year: '데이터 계층 설계',
    blurb:
      '엔티티를 키로 해싱해 여러 샤드로 라우팅한다. 단일 DB 병목 없이 처리량을 수평으로 늘리는, MSSQL·Redis·Garnet에 걸친 데이터 계층 설계.',
    metric: { big: 'Sharding', cap: '키 기반 수평 분산' },
    tags: ['MSSQL', 'Redis', 'Garnet', '샤딩', 'EntityFramework', 'MongoDB'],
  },
  {
    id: 'navmesh',
    scene: 'voxelNav',
    align: 'left',
    accent: 'cyan',
    num: '05',
    kicker: 'Miniverse · 2021 — 2024',
    title: '다이나믹 복셀 네비메시',
    year: '내비게이션 · 서버 물리',
    blurb:
      '서버 권위 이동을 복셀 지형 위에서 A*로 해결한다. 무언가 날아와 지형을 파괴하면 부서진 영역의 복셀 네비메시만 즉시 다시 생성되고, 경로가 실시간으로 우회한다 — 맵 전체를 다시 굽지 않는다.',
    metric: { big: 'A*', cap: '파괴 영역만 네비메시 재생성' },
    tags: ['복셀화', 'A* 길찾기', '동적 네비메시', '서버 물리'],
  },
  {
    id: 'raycast',
    scene: 'raycast3d',
    align: 'right',
    accent: 'cyan',
    num: '06',
    kicker: 'Miniverse · 서버 내비게이션',
    title: '3D 레이캐스트 조향',
    year: '3차원 공간 내비게이션',
    blurb:
      '평면 8방향 격자가 아니다. 3D 공간에서 진행 방향 앞쪽으로 ~24개의 레이를 원뿔(구면 캡)로 쏘고, 부딪힌 레이는 붉게 표시되며, 열린 방향으로 조향해 3차원으로 장애물을 헤쳐 나간다.',
    metric: { big: '~24', cap: '원뿔 레이 · 3D 장애물 회피' },
    tags: ['레이캐스팅', '3D 조향', '장애물 회피', '원뿔 샘플링'],
  },
  {
    id: 'ownership',
    scene: 'clientNpc',
    align: 'left',
    accent: 'green',
    num: '07',
    kicker: 'Miniverse · 부하 분산',
    title: '클라이언트 위임 NPC',
    year: '서버 부하 오프로딩',
    blurb:
      'NPC 시뮬레이션을 가장 가까운 유저가 소유한다. 그 클라이언트가 AI를 구동하고 상태를 브로드캐스트하며, 소유자가 멀어지면 오너십이 지금 가장 가까운 유저에게 이전된다 — 권위는 명확히 유지한 채 서버 시뮬레이션 비용을 줄인다.',
    metric: { big: '오너십 이전', cap: '최근접 유저 소유권 이양' },
    tags: ['오너십 이전', '피어 권위', '브로드캐스트', '서버 오프로드'],
  },
  {
    id: 'renderopt',
    scene: 'renderOpt',
    align: 'right',
    accent: 'green',
    num: '08',
    kicker: 'Miniverse · 2021 — 2024',
    title: '렌더링 · 물리 최적화',
    year: '2021 — 2024 · 5,000만 프랍 · 동시접속 2,000',
    blurb:
      '5,000만 개의 프랍이 놓인 UGC 샌드박스에서 동시접속 2,000명. 인스턴싱(ISM)으로 드로우콜 폭증을 잡고, 물리를 플레이어 주변으로 청킹해 가까운 바디만 시뮬레이션한다.',
    metric: {
      pairs: [
        { label: '드로우콜', from: '20,967', to: '503' },
        { label: 'FPS', from: '16.5', to: '47.4' },
      ],
    },
    tags: ['ISM 인스턴싱', '물리 청킹', '드로우콜 배칭', '공간 분할'],
  },
  {
    id: 'web',
    scene: 'webCollab',
    align: 'left',
    accent: 'blue',
    num: '09',
    kicker: 'Miniverse · 웹 메타버스 (Godot)',
    title: '실시간 협업 · 1,000+ 커서',
    year: '브라우저 기반 메타버스',
    blurb:
      '브라우저 메타버스에서 한 공간에 1,000명 이상의 실시간 커서를 동기화했다. 협업 에디터에서 다수의 유저가 동시에 편집하는 환경을 스크립트 런타임 R&D와 함께 구현.',
    metric: { big: '1,000+', cap: '동시 실시간 커서' },
    tags: ['실시간 동기화', 'CRDT류 수렴', '협업 에디터', '웹 런타임'],
  },
  {
    id: 'propgames',
    scene: 'propGames',
    align: 'right',
    accent: 'amber',
    num: '10',
    kicker: 'Miniverse · UGC 런타임',
    title: '프랍 조합 미니게임',
    year: '유저 스크립트 · 프랍 메시징',
    blurb:
      '서바이벌, 페인트맨(팀전) 같은 미니게임을 오직 유저 스크립트와 프랍 간 메시지 교환만으로 제작했다. 여러 게임이 하나의 공간에서 동시에 돌아가는 것을 실증.',
    metric: { big: '다중 게임', cap: '한 공간 · 프랍 메시지로 구동' },
    tags: ['UGC 스크립트', '프랍 메시징', '서바이벌 · 페인트맨', '동시 실행'],
  },
  {
    id: 'combat',
    scene: 'denseCombat',
    align: 'left',
    accent: 'amber',
    num: '11',
    kicker: 'AION2 Mobile · 2016 — 2021',
    title: '1,000명 밀집 전투',
    year: '2016 — 2021 · NCDP 2019 수상',
    blurb:
      'MMO 프레임워크를 처음부터 구축하고 9개 팀 40~50명의 엔지니어를 이끌었다. 순진한 전체 브로드캐스트는 O(n²)라 한곳에 천 명이 모이면 무너진다 — 그리드 기반 관심 관리로 지역 이웃만 남겨 처리량을 끌어올린 프로파일링 기반 최적화(NCDP 2019 수상).',
    metric: { big: '4×', cap: '브로드캐스트 최적화 후 처리량' },
    tags: ['MMO 프레임워크', '관심 관리', '프로파일링', '40~50명 · 9팀 리드'],
  },
  {
    id: 'ai',
    scene: 'aiDev',
    align: 'center',
    accent: 'blue',
    num: '12',
    kicker: '현재 · AI 주도 개발',
    title: '툴체인 속의 에이전트',
    year: '현재 R&D',
    blurb:
      '커스텀 MCP 서버, AI 코드리뷰·테스트 에이전트, 로컬 LLM 코딩 스택을 일상 개발에 녹였다 — 같은 시스템 감각을 ‘무엇을 만드는가’뿐 아니라 ‘어떻게 만드는가’에도.',
    metric: { big: 'MCP', cap: '커스텀 에이전트 · 로컬 LLM' },
    tags: ['MCP', '에이전트 테스팅', '로컬 LLM', 'Claude Agent SDK'],
    contact: true,
    summary: true, // 마지막 패널: 학력·수상·전체 스택도 함께 노출
  },
]

// 타임라인 씬 + 폴백 문서가 쓰는 경력 요약 (최신 → 과거)
export const timeline = [
  ['2024 — 현재', 'Pantera', '분산 MMO 백엔드 (Orleans / .NET / UE5)'],
  ['2021 — 2024', 'Miniverse', 'UGC 샌드박스 MMO · 웹 메타버스 (Godot)'],
  ['2016 — 2021', 'AION2 Mobile', '테크니컬 디렉터 · MMO 프레임워크 구축'],
  ['2007 — 2015', 'Actozsoft · 위메이드 · 자이언트드림 · KB온라인 · 코어크리에이티브', '서버팀 리드 / 프로그램 디렉터 / 프레임워크 아키텍트'],
]

export const stack = {
  언어: ['C++', 'C#', 'TypeScript', 'Python', 'Lua', 'GDScript'],
  백엔드: ['.NET', 'Orleans', 'gRPC', 'ASP.NET', 'Node.js', 'WebSocket'],
  데이터: ['MSSQL', 'Redis', 'Garnet', 'MongoDB', 'EntityFramework', '샤딩'],
  엔진: ['Unreal 3/4/5', 'Unity', 'Godot', 'Gamebryo'],
  인프라: ['Perforce', 'Jenkins', '.NET Aspire', 'Claude Agent SDK'],
}
