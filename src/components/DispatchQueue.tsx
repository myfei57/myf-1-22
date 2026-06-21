import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Package,
  Truck,
  Sparkles,
  Heart,
  Clock,
  RotateCcw,
  CheckCircle,
  SkipForward,
  Play,
  Trash2,
  ListChecks,
  Bot,
  AlertTriangle,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { QueueItem, QueueItemStatus, MissionType } from '../types';

const missionIcons: Record<MissionType, typeof Package> = {
  transport: Truck,
  cleaning: Sparkles,
  rescue: Heart,
  combat: Swords,
};

const missionTextClasses: Record<MissionType, string> = {
  transport: 'text-neon-blue',
  cleaning: 'text-neon-cyan',
  rescue: 'text-neon-green',
  combat: 'text-neon-red',
};

const missionBgClasses: Record<MissionType, string> = {
  transport: 'bg-neon-blue/20',
  cleaning: 'bg-neon-cyan/20',
  rescue: 'bg-neon-green/20',
  combat: 'bg-neon-red/20',
};

const statusMeta: Record<
  QueueItemStatus,
  { label: string; icon: typeof Clock; colorClass: string; bgClass: string; dotClass: string }
> = {
  waiting: {
    label: '等待中',
    icon: Clock,
    colorClass: 'text-white/60',
    bgClass: 'bg-white/10',
    dotClass: 'bg-white/50',
  },
  executing: {
    label: '执行中',
    icon: RotateCcw,
    colorClass: 'text-neon-blue',
    bgClass: 'bg-neon-blue/20',
    dotClass: 'bg-neon-blue',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle,
    colorClass: 'text-neon-green',
    bgClass: 'bg-neon-green/20',
    dotClass: 'bg-neon-green',
  },
  skipped: {
    label: '已跳过',
    icon: SkipForward,
    colorClass: 'text-neon-orange',
    bgClass: 'bg-neon-orange/20',
    dotClass: 'bg-neon-orange',
  },
};

interface DispatchQueueProps {
  items: QueueItem[];
  isRunning: boolean;
  onStart: () => void;
  onClear: () => void;
  onReset: () => void;
  onRemove: (id: string) => void;
}

export function DispatchQueue({
  items,
  isRunning,
  onStart,
  onClear,
  onReset,
  onRemove,
}: DispatchQueueProps) {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { waiting: 0, executing: 0, completed: 0, skipped: 0 } as Record<QueueItemStatus, number>
  );

  const hasWaiting = counts.waiting > 0;
  const hasFinished = counts.completed > 0 || counts.skipped > 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <h3 className="font-display font-bold text-neon-purple flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          派遣队列
          <span className="text-sm font-mono text-white/40">({items.length})</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={onStart}
            disabled={isRunning || !hasWaiting}
            className="btn btn-success px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                执行中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始队列
              </>
            )}
          </button>
          <button
            onClick={onReset}
            disabled={isRunning || !hasFinished}
            className="btn btn-ghost px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            title="重置已完成/已跳过的项为等待中"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </button>
          <button
            onClick={onClear}
            disabled={isRunning || items.length === 0}
            className="btn btn-ghost px-3 text-neon-red border-neon-red/40 hover:bg-neon-red/20 disabled:opacity-40 disabled:cursor-not-allowed"
            title="清空队列"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {(Object.keys(statusMeta) as QueueItemStatus[]).map((status) => {
          const meta = statusMeta[status];
          const Icon = meta.icon;
          return (
            <div
              key={status}
              className={`rounded-lg ${meta.bgClass} py-2 px-3 flex flex-col items-center justify-center border border-border-subtle`}
            >
              <Icon
                className={`w-4 h-4 mb-1 ${meta.colorClass} ${
                  status === 'executing' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-lg font-mono font-bold text-white">{counts[status]}</span>
              <span className="text-[10px] text-white/50">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-white/30">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>队列为空</p>
          <p className="text-xs mt-1">选择任务和机器人后，点击「加入队列」</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const MissionIcon = missionIcons[item.missionType];
              const meta = statusMeta[item.status];
              const StatusIcon = meta.icon;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-background-tertiary border ${
                    item.status === 'executing'
                      ? 'border-neon-blue/60 shadow-neon-blue/30'
                      : item.status === 'completed'
                      ? 'border-neon-green/30'
                      : item.status === 'skipped'
                      ? 'border-neon-orange/30'
                      : 'border-border-subtle'
                  }`}
                >
                  <span className="text-xs font-mono text-white/30 w-6 text-center flex-shrink-0">
                    {index + 1}
                  </span>

                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${missionBgClasses[item.missionType]}`}
                  >
                    <MissionIcon className={`w-5 h-5 ${missionTextClasses[item.missionType]}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Bot className="w-3.5 h-3.5 text-neon-blue flex-shrink-0" />
                      <span className="font-bold text-white text-sm truncate">
                        {item.robotName}
                      </span>
                      <span className="text-white/30">→</span>
                      <span className={`text-sm truncate ${missionTextClasses[item.missionType]}`}>
                        {item.missionName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-white/40 mt-0.5">
                      <span>预览适配度: {item.adaptabilityPreview}%</span>
                      {item.result && (
                        <span className={item.result.success ? 'text-neon-green' : 'text-neon-red'}>
                          {item.result.success ? '成功' : '失败'} · 耐久 -{item.result.durabilityLoss}
                        </span>
                      )}
                      {item.status === 'skipped' && item.skipReason && (
                        <span className="flex items-center gap-1 text-neon-orange">
                          <AlertTriangle className="w-3 h-3" />
                          {item.skipReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.status === 'completed' && item.result && (
                    <div className="flex-shrink-0">
                      {item.result.success ? (
                        <Trophy className="w-5 h-5 text-neon-orange" />
                      ) : (
                        <XCircle className="w-5 h-5 text-neon-red" />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ${meta.bgClass}`}
                  >
                    <StatusIcon
                      className={`w-3.5 h-3.5 ${meta.colorClass} ${
                        item.status === 'executing' ? 'animate-spin' : ''
                      }`}
                    />
                    <span className={`text-[10px] font-bold ${meta.colorClass}`}>{meta.label}</span>
                  </div>

                  {item.status === 'waiting' && !isRunning && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 rounded-lg hover:bg-neon-red/20 text-white/30 hover:text-neon-red transition-colors flex-shrink-0"
                      title="移除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
