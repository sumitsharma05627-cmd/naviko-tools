import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell 
} from 'recharts';
import { 
  TrendingUp, Calendar, Award, Droplets, Target, 
  CheckCircle2, Info, ArrowUpRight 
} from 'lucide-react';

interface WaterConsumptionChartProps {
  targetGlasses?: number;
  className?: string;
}

interface DayWaterLog {
  dateKey: string;
  dayName: string;
  formattedDate: string;
  glasses: number;
  ml: number;
  targetMl: number;
  metGoal: boolean;
  isToday: boolean;
}

export const WaterConsumptionChart: React.FC<WaterConsumptionChartProps> = ({
  targetGlasses: propTarget,
  className = '',
}) => {
  const [viewUnit, setViewUnit] = useState<'ml' | 'glasses'>('ml');
  const [targetGlasses, setTargetGlasses] = useState<number>(() => {
    if (propTarget) return propTarget;
    try {
      const saved = localStorage.getItem('naviko_water_target');
      return saved ? parseInt(saved, 10) : 10;
    } catch {
      return 10;
    }
  });

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Sync prop target if updated from parent
  useEffect(() => {
    if (propTarget) {
      setTargetGlasses(propTarget);
    }
  }, [propTarget]);

  // Listen for water log updates from DailyWaterTracker or HabitTrackerPage
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('naviko_water_updated', handleUpdate);
    return () => window.removeEventListener('naviko_water_updated', handleUpdate);
  }, []);

  // Compute 7-day data
  const chartData = useMemo<DayWaterLog[]>(() => {
    const data: DayWaterLog[] = [];
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Fallback baseline for past unrecorded days to make the chart meaningful upon first visit
    const defaultPastRatios = [0.8, 1.0, 1.1, 0.9, 1.0, 0.85];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const isToday = dateKey === todayKey;

      const rawSaved = localStorage.getItem(`naviko_water_${dateKey}`);
      let glasses = 0;

      if (rawSaved !== null) {
        glasses = parseInt(rawSaved, 10) || 0;
      } else if (!isToday) {
        // Seed past days based on target so users have immediate visual trend context
        const ratioIndex = (6 - i) % defaultPastRatios.length;
        glasses = Math.round(targetGlasses * defaultPastRatios[ratioIndex]);
        // Save seed so it stays consistent
        try {
          localStorage.setItem(`naviko_water_${dateKey}`, glasses.toString());
        } catch {
          // ignore
        }
      }

      const ml = glasses * 250;
      const targetMl = targetGlasses * 250;
      const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        dateKey,
        dayName,
        formattedDate,
        glasses,
        ml,
        targetMl,
        metGoal: glasses >= targetGlasses,
        isToday,
      });
    }

    return data;
  }, [targetGlasses, refreshKey]);

  // Aggregate statistics
  const targetMl = targetGlasses * 250;
  const totalMl = chartData.reduce((acc, curr) => acc + curr.ml, 0);
  const totalGlasses = chartData.reduce((acc, curr) => acc + curr.glasses, 0);
  const avgMl = Math.round(totalMl / chartData.length);
  const avgGlasses = Math.round((totalGlasses / chartData.length) * 10) / 10;
  const daysGoalMet = chartData.filter((d) => d.metGoal).length;

  const targetLineValue = viewUnit === 'ml' ? targetMl : targetGlasses;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: DayWaterLog = payload[0].payload;
      const diff = item.ml - item.targetMl;
      const pct = Math.round((item.glasses / targetGlasses) * 100);

      return (
        <div className="p-3 bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-xl shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <div className="flex items-center justify-between font-semibold border-b border-slate-800 pb-1">
            <span>{item.dayName} · {item.formattedDate}</span>
            {item.isToday && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Intake:</span>
              <strong className="text-sky-400 font-mono text-sm">{item.ml} ml</strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="text-slate-400">Glasses:</span>
              <span>{item.glasses} of {targetGlasses} gl</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="text-slate-400">Target:</span>
              <span>{pct}% of goal</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 flex items-center gap-1.5 text-[11px]">
            {item.metGoal ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Goal Met (+{diff >= 0 ? diff : 0} ml)
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                {Math.abs(diff)} ml below goal
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all space-y-6 ${className}`}>
      {/* Header and Unit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              7-Day Hydration Trends
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Goal: {targetGlasses} glasses ({targetMl} ml/day)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Daily Water Consumption vs. Target
          </h3>
        </div>

        {/* Unit Toggle Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewUnit('ml')}
            className={`py-1 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewUnit === 'ml'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Milliliters (ml)
          </button>
          <button
            type="button"
            onClick={() => setViewUnit('glasses')}
            className={`py-1 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewUnit === 'glasses'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Glasses (250ml)
          </button>
        </div>
      </div>

      {/* 3 Summary Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
          <div className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
            7-Day Average
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-serif text-slate-900 dark:text-white">
              {viewUnit === 'ml' ? `${avgMl} ml` : `${avgGlasses} gl`}
            </span>
            <span className="text-[11px] text-slate-500">/ day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Goal Consistency
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-serif text-slate-900 dark:text-white">
              {daysGoalMet} / {chartData.length}
            </span>
            <span className="text-[11px] text-slate-500">days target met</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            7-Day Total Hydration
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-serif text-slate-900 dark:text-white">
              {(totalMl / 1000).toFixed(1)} L
            </span>
            <span className="text-[11px] text-slate-500">({totalGlasses} glasses)</span>
          </div>
        </div>
      </div>

      {/* Main Recharts BarChart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 15, left: -10, bottom: 5 }}
          >
            <XAxis
              dataKey="dayName"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tick={({ x, y, payload }) => {
                const isToday = payload.value === 'Today';
                return (
                  <text
                    x={x}
                    y={Number(y) + 12}
                    textAnchor="middle"
                    fill={isToday ? '#0284c7' : '#64748b'}
                    fontWeight={isToday ? 'bold' : 'normal'}
                    fontSize={11}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => Math.max(dataMax * 1.15, targetLineValue * 1.15)]}
              tickFormatter={(val) => (viewUnit === 'ml' ? `${val}` : `${val} gl`)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }} />

            {/* Daily Goal Reference Line */}
            <ReferenceLine
              y={targetLineValue}
              stroke="#0284c7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Goal: ${viewUnit === 'ml' ? `${targetMl} ml` : `${targetGlasses} gl`}`,
                position: 'top',
                fill: '#0284c7',
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            {/* Intake Bars */}
            <Bar
              dataKey={viewUnit === 'ml' ? 'ml' : 'glasses'}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              {chartData.map((entry, index) => {
                let fill = '#38bdf8'; // Sky blue base

                if (entry.metGoal) {
                  fill = '#10b981'; // Emerald for meeting goal
                }

                if (entry.isToday) {
                  fill = entry.metGoal ? '#059669' : '#0284c7'; // Bolder highlight for Today
                }

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Insight Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span>Goal Achieved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
            <span>In Progress / Below Goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-600 inline-block" />
            <span>Target Line ({targetMl} ml)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          Logs update instantly when water is added to today's count.
        </div>
      </div>
    </div>
  );
};
