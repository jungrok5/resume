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
// 순서 원칙: 문서형 이력서(기본 뷰)의 경력 역순 그대로 — 회사·기간으로 그룹핑.
// 각 씬은 "무엇을 어떻게 만들었는지"가 시각화만 봐도 전달되는 것을 목표로 한다.
export const sections = [
  {
    id: 'hero',
    scene: 'hero',
    align: 'center',
    accent: 'cyan',
    kicker: '20년 · 서버 시스템',
    name: profile.name,
    sub: '20년간 MMO 서버 프레임워크를 백지에서 반복 설계·구축해온 테크니컬 디렉터 — 대규모 게임 월드를 떠받치는 ‘보이지 않는 서버 시스템’을 눈에 보이게.',
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
      '온라인 게임 서버 개발 20년. 서버 팀원에서 시작해 서버팀장·프로그램팀장·서버파트리더를 거쳐, NCSOFT에서 테크니컬 디렉터로 MMO 서버 프레임워크를 백지에서 구축했다 — 지금은 분산 MMO 백엔드를 설계한다.',
    isTimeline: true,
    tags: ['Pantera', 'Miniverse', 'AION2', 'NCSOFT', '위메이드', 'Actozsoft'],
  },

  // ───────── Pantera (2024 — 현재) ─────────
  {
    id: 'pantera',
    scene: 'actorModel',
    align: 'right',
    accent: 'violet',
    num: '02',
    kicker: 'Pantera · 2024 — 현재',
    title: '분산 액터 아키텍처',
    year: 'Orleans Grain · 팀 표준 확립',
    blurb:
      '분산 서버 아키텍처의 방향을 정하고 팀 표준으로 정착시켰다 — Orleans Grain 모델 채택을 주도하고, gRPC→TCP 전송 계층 전환과 샤딩 기반 데이터 분산 구조를 확립. 그레인은 필요할 때 활성화되어 자기 상태를 단일 스레드로 처리하며, 부하에 따라 수평 확장된다.',
    metric: { big: 'Orleans', cap: '액터 모델 동시성 · gRPC → TCP' },
    tags: ['C#', '.NET', 'Orleans', 'gRPC/TCP', 'Redis / Garnet', 'UE5'],
  },
  {
    id: 'pipeline',
    scene: 'dataPipeline',
    align: 'left',
    accent: 'blue',
    num: '03',
    kicker: 'Pantera · 2024 — 현재',
    title: 'proto 단일 소스 파이프라인',
    year: '데이터·스탯 파이프라인 표준화',
    blurb:
      '.proto 하나를 스키마의 단일 진실원으로 삼아 서버·클라 코드, CSV, 유효성 검증까지 자동 생성한다. 기획 데이터가 사람 손을 거치지 않고 배치 1회로 서버·클라에 동시 반영된다 — 팀 전체의 작업 방식으로 채택.',
    metric: { big: 'proto', cap: '단일 소스 → 코드 · CSV · 검증 자동 생성' },
    tags: ['Protobuf', '코드 생성', 'protoc 플러그인 자체 구현', '유효성 검증'],
  },
  {
    id: 'sharding',
    scene: 'sharding',
    align: 'right',
    accent: 'green',
    num: '04',
    kicker: 'Pantera · 2024 — 현재',
    title: '샤딩 · 부하로 규명한 상한',
    year: '데이터 계층 설계 · 부하 테스트 인프라',
    blurb:
      '엔티티를 키로 해싱해 여러 샤드로 라우팅하고, 자체 부하 테스트 인프라로 상한을 실측한다 — gRPC 초당 24만 요청, EntityFramework 5만 TPS. 단일 DB 병목 없이 처리량을 수평으로 늘린다.',
    metric: { big: '24만 req/s', cap: 'gRPC 실측 · EF 5만 TPS · 샤딩' },
    tags: ['샤딩', 'MSSQL · 저장프로시저', 'Redis / Garnet', '부하 테스트'],
  },

  // ───────── Miniverse PC / UE5 (2023 — 2024) ─────────
  {
    id: 'densebuild',
    scene: 'denseBuild',
    align: 'left',
    accent: 'green',
    num: '05',
    kicker: 'Miniverse (UE5) · 2023 — 2024',
    title: '5,000만 프랍 · 2,000명 밀집 건축',
    year: '초대규모 UGC · 액터 모델 락프리',
    blurb:
      '단일 공간에 5,000만 개의 프랍이 쌓이고 2,000명이 동시에 건축한다. 공간당 단일 디스패처 액터 모델이 쓰기를 직렬화해 락 경합을 없애고, zero-copy 브로드캐스트가 직렬화 1회·할당 1회로 모두에게 전파한다 — 총량이 아니라 활성량만 처리한다.',
    metric: { big: '5,000만', cap: '프랍 풀 틱 · 동시 2,000명 건축' },
    tags: ['액터 모델 락프리', 'zero-copy 브로드캐스트', '3단 공간 분할', 'AOI 시야 전송'],
  },
  {
    id: 'renderopt',
    scene: 'renderOpt',
    align: 'right',
    accent: 'green',
    num: '06',
    kicker: 'Miniverse (UE5) · 2023 — 2024',
    title: '렌더링 · 물리 최적화',
    year: '수천만 프랍 월드를 그리는 법',
    blurb:
      'ISM 인스턴싱으로 드로우콜 폭증을 잡고, 물리는 플레이어 인접 청크의 바디만 생성·시뮬레이션한다 — 프랍이 1억 개라도 물리 씬에 상주하는 바디 수는 상수다.',
    metric: {
      pairs: [
        { label: '드로우콜', from: '20,967', to: '503' },
        { label: 'FPS', from: '16.5', to: '47.4' },
      ],
    },
    tags: ['ISM 인스턴싱', '물리 청킹', '드로우콜 배칭', '공간 분할'],
  },
  {
    id: 'navmesh',
    scene: 'voxelNav',
    align: 'left',
    accent: 'cyan',
    num: '07',
    kicker: 'Miniverse (UE5) · 2023 — 2024',
    title: '다이나믹 복셀 네비메시',
    year: '내비게이션 · 서버 물리',
    blurb:
      '서버 권위 이동을 복셀 지형 위에서 A*로 해결한다. 유저가 실시간으로 지형을 바꾸면 영향받은 영역의 복셀 네비메시만 즉시 다시 생성되고, 경로가 실시간으로 우회한다 — 맵 전체를 다시 굽지 않는다.',
    metric: { big: 'A*', cap: '변경 영역만 네비메시 재생성' },
    tags: ['복셀화', 'A* 길찾기', '동적 네비메시', 'Godot 서버 뷰어'],
  },
  {
    id: 'ownership',
    scene: 'clientNpc',
    align: 'right',
    accent: 'green',
    num: '08',
    kicker: 'Miniverse (UE5) · 분산 시뮬레이션',
    title: '클라이언트 위임 분산 시뮬레이션',
    year: '로블록스 분산 물리(네트워크 오너십) 개념을 자체 구현',
    blurb:
      'NPC AI 시뮬레이션을 최근접 클라이언트에 동적으로 위임한다. 그 클라이언트가 AI를 구동해 상태를 브로드캐스트하고, 유저가 멀어지면 오너십이 다음 최근접 클라이언트로 끊김 없이 마이그레이션된다. 서버는 권위 검증·중계만 담당 — 부하가 ‘NPC 총수’가 아닌 ‘유저 주변 활성 NPC 수’로 수렴한다.',
    metric: { big: '오너십 이전', cap: '클라이언트 위임 · 서버 권위 검증' },
    tags: ['분산 시뮬레이션', '오너십 마이그레이션', '클라이언트 위임', '서버 권위 검증'],
  },

  // ───────── Miniverse Web / Godot (2021 — 2023) ─────────
  {
    id: 'web',
    scene: 'webCollab',
    align: 'left',
    accent: 'blue',
    num: '09',
    kicker: 'Miniverse Web (Godot) · 2021 — 2023',
    title: '실시간 협업 · 1,000+ 커서',
    year: '브라우저 기반 메타버스',
    blurb:
      '브라우저 메타버스에서 한 공간에 1,000명 이상의 실시간 커서를 동기화했다. 충돌·병합 없는 동시 편집과 유저 창작 스크립트 런타임 R&D를 함께 구현.',
    metric: { big: '1,000+', cap: '동시 실시간 커서' },
    tags: ['실시간 동기화', '동시 편집', '협업 에디터', '스크립트 런타임'],
  },
  {
    id: 'propgames',
    scene: 'propGames',
    align: 'right',
    accent: 'amber',
    num: '10',
    kicker: 'Miniverse Web · UGC 런타임',
    title: '프랍 조합 미니게임',
    year: '유저 스크립트 · 프랍 메시징',
    blurb:
      '서바이벌, 페인트맨(팀전) 같은 미니게임을 오직 유저 스크립트와 프랍 간 메시지 교환만으로 제작했다. 여러 게임이 하나의 공간에서 동시에 돌아가는 것을 실증.',
    metric: { big: '다중 게임', cap: '한 공간 · 프랍 메시지로 구동' },
    tags: ['UGC 스크립트', '프랍 메시징', '서바이벌 · 페인트맨', '동시 실행'],
  },

  // ───────── AION2 (2016 — 2021) ─────────
  {
    id: 'combat',
    scene: 'denseCombat',
    align: 'left',
    accent: 'amber',
    num: '11',
    kicker: 'AION2 · 2016 — 2021',
    title: '채널 없는 1,000 vs 1,000',
    year: 'NCDP 2019 최우수상 · ~40명 기술 디렉팅',
    blurb:
      'MMO 프레임워크를 백지에서 구축하고 ~40명 프로그래밍 조직을 이끌었다. 한 시야에 1,000명이 모이면 초당 1,300만 패킷 — 세션/필드 서버 분산(처리량 3배↑), 셀 기반 가상 관심영역 브로드캐스팅, Packet Shrink 비트 패킹(트래픽 36%↓)으로 채널 없이 버텨냈고, 이후 2,000 vs 2,000 전투로 확장했다.',
    metric: { big: '1,300만', cap: '패킷/초 → 처리량 3배 · 트래픽 -36%' },
    tags: ['MMO 프레임워크', '관심영역 브로드캐스팅', 'Packet Shrink', '세션/필드 분산'],
  },
  {
    id: 'raycast',
    scene: 'raycast3d',
    align: 'right',
    accent: 'cyan',
    num: '12',
    kicker: 'AION2 · 3D 비행 네비게이션',
    title: '3차원 비행 내비게이션',
    year: '지상 평면을 넘어, 하늘의 길찾기',
    blurb:
      '지상 평면을 넘어, 비행체의 3차원 이동·길찾기를 서버에서 처리하는 네비게이션 구조를 설계했다(복셀 기반 3D 네비게이션). 씬의 비행체는 진행 방향 원뿔로 레이를 쏘아 막힌 방향(붉게 표시)을 피해 열린 쪽으로 조향한다 — 이 시각화는 실제로 레이가 반응한다.',
    metric: { big: '3D', cap: '복셀 기반 비행 네비게이션 · 서버 처리' },
    tags: ['3D 길찾기', '복셀 네비게이션', '장애물 회피', '서버 처리'],
  },

  // ───────── 기술 자문 · 파견 ─────────
  {
    id: 'trickster',
    scene: 'trickster',
    align: 'left',
    accent: 'green',
    num: '13',
    kicker: '기술 자문 · 트릭스터M 파견 (2020 — 2021)',
    title: '동접 2,000 → 8,000',
    year: '3개월 파견 · 같은 하드웨어에서 4배',
    blurb:
      '타 프로젝트의 요청으로 서버 최적화에 파견됐다. 프로파일링으로 메모리릭·브로드캐스팅·DB 병목을 걷어내고 동적 할당을 풀링으로 바꿔, 안정 동접 2천 명이던 서버를 8천 명까지 끌어올린 뒤 파견을 마쳤다.',
    metric: {
      pairs: [{ label: '안정 동접', from: '2,000', to: '8,000' }],
    },
    tags: ['프로파일링', '메모리릭 제거', '브로드캐스팅 최적화', 'DB 부하 분리'],
  },

  // ───────── 현재 · 마무리 ─────────
  {
    id: 'ai',
    scene: 'aiDev',
    align: 'center',
    accent: 'blue',
    num: '14',
    kicker: 'Pantera · AI 개발 생산성 혁신 주도',
    title: 'AI 개발 생산성 혁신',
    year: 'MCP · 에이전트 · 로컬 LLM',
    blurb:
      'MCP 서버를 자체 구현해 자연어 기반 서버 테스트를 자동화하고, AI 테스트·코드리뷰 에이전트 팀을 구성했다. 사내 코드 유출 없는 로컬 LLM 코딩 스택을 구축·배포 — 팀의 개발 생산성을 끌어올리는 AI 주도 개발.',
    metric: { big: 'MCP', cap: '자연어 서버 테스트 · AI 에이전트 · 로컬 LLM' },
    tags: ['MCP 자체 구현', 'AI 테스트·코드리뷰 에이전트', '로컬 LLM (llama.cpp)', 'Claude Agent SDK'],
    contact: true,
    summary: true, // 마지막 패널: 학력·수상·전체 스택도 함께 노출
  },
]

// 타임라인 씬 + 폴백 문서가 쓰는 경력 요약 (최신 → 과거)
export const timeline = [
  ['2024 — 현재', 'Pantera', '분산 MMO 백엔드 (Orleans / .NET / UE5)'],
  ['2023 — 2024', 'Miniverse (UE5)', 'UGC 샌드박스 MMO — 5,000만 프랍 · 2,000명'],
  ['2021 — 2023', 'Miniverse (Web)', '유저 창작 웹 메타버스 (Godot) · 1,000+ 커서'],
  ['2016 — 2021', 'AION2 Mobile', '테크니컬 디렉터 · MMO 프레임워크 백지 구축'],
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
