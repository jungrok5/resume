import { sections } from '../data/resume'
import HeroScene from './scenes/HeroScene'
import TimelineScene from './scenes/TimelineScene'
import VoxelNavScene from './scenes/VoxelNavScene'
import Raycast3DScene from './scenes/Raycast3DScene'
import ClientNpcScene from './scenes/ClientNpcScene'
import ActorModelScene from './scenes/ActorModelScene'
import DataPipelineScene from './scenes/DataPipelineScene'
import ShardingScene from './scenes/ShardingScene'
import RenderOptScene from './scenes/RenderOptScene'
import DenseBuildScene from './scenes/DenseBuildScene'
import SpatialTiersScene from './scenes/SpatialTiersScene'
import CircuitKitScene from './scenes/CircuitKitScene'
import DenseCombatScene from './scenes/DenseCombatScene'
import TricksterScene from './scenes/TricksterScene'
import WebCollabScene from './scenes/WebCollabScene'
import PropGamesScene from './scenes/PropGamesScene'
import AiDevScene from './scenes/AiDevScene'

const REGISTRY = {
  hero: HeroScene,
  timeline: TimelineScene,
  voxelNav: VoxelNavScene,
  raycast3d: Raycast3DScene,
  clientNpc: ClientNpcScene,
  actorModel: ActorModelScene,
  dataPipeline: DataPipelineScene,
  sharding: ShardingScene,
  renderOpt: RenderOptScene,
  denseBuild: DenseBuildScene,
  spatialTiers: SpatialTiersScene,
  circuitKit: CircuitKitScene,
  denseCombat: DenseCombatScene,
  trickster: TricksterScene,
  webCollab: WebCollabScene,
  propGames: PropGamesScene,
  aiDev: AiDevScene,
}

// 모든 씬을 한 번씩 마운트하고, 각 씬은 스크롤 범위로 스스로 컬링한다.
export default function SceneRig({ mobile }) {
  const total = sections.length
  return (
    <group>
      {sections.map((s, i) => {
        const Scene = REGISTRY[s.scene]
        if (!Scene) return null
        return <Scene key={s.id} index={i} total={total} mobile={mobile} accent={s.accent} />
      })}
    </group>
  )
}
