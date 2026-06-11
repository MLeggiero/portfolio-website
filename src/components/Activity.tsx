import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import HuggingFaceIcon from './icons/HuggingFaceIcon';
import activityData from '../data/activity.json';

interface ContributionDay {
    date: string;
    count: number;
    level: number;
}

interface ActivityData {
    generatedAt: string;
    github: {
        username: string;
        totalLastYear: number;
        publicRepos: number;
        followers: number;
        contributions: ContributionDay[];
    };
    huggingface: {
        username: string;
        fullname: string;
        bio: string;
        models: number;
        datasets: number;
        spaces: number;
    };
}

const activity = activityData as ActivityData;
const { github, huggingface } = activity;

// Intensity ramp for the heatmap: empty → full, tinted in the site's blue.
const LEVEL_CLASSES = [
    'bg-white/[0.04]',
    'bg-primary/30',
    'bg-primary/50',
    'bg-primary/75',
    'bg-primary',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Cell = ContributionDay | null;

// Group the flat day list into Sunday-aligned weeks (one column each).
function buildWeeks(days: ContributionDay[]): Cell[][] {
    if (days.length === 0) return [];
    const leadingPad = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    const cells: Cell[] = [...Array<Cell>(leadingPad).fill(null), ...days];
    const weeks: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

// Month labels positioned above the week column where each new month begins.
function monthLabels(weeks: Cell[][]): { index: number; label: string }[] {
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, index) => {
        const firstDay = week.find((d): d is ContributionDay => d !== null);
        if (!firstDay) return;
        const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
        if (month !== lastMonth) {
            labels.push({ index, label: MONTHS[month] });
            lastMonth = month;
        }
    });
    return labels;
}

const weeks = buildWeeks(github.contributions);
const labels = monthLabels(weeks);

function Counter({ to }: { to: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setValue(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, to]);

    return <span ref={ref}>{value}</span>;
}

interface Stat {
    value: number;
    label: string;
    platform: 'GitHub' | 'Hugging Face';
}

const stats: Stat[] = [
    { value: github.totalLastYear, label: 'Contributions', platform: 'GitHub' },
    { value: github.publicRepos, label: 'Repositories', platform: 'GitHub' },
    { value: huggingface.models, label: 'Models', platform: 'Hugging Face' },
    { value: huggingface.datasets, label: 'Datasets', platform: 'Hugging Face' },
];

const Activity = () => {
    return (
        <section id="activity" className="py-24 md:py-32 bg-background relative">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-primary text-xs tracking-[0.4em] uppercase font-mono mb-4">
                        Open Source &amp; Research
                    </p>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Activity</h2>
                    <div className="h-1 w-20 bg-primary mx-auto mb-8" />
                    <p className="text-neutral-400 text-base max-w-xl mx-auto leading-relaxed font-light">
                        Building in public — from embedded firmware and robotics to reinforcement
                        learning models and datasets.
                    </p>
                </motion.div>

                {/* Contribution heatmap card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.8 }}
                    className="p-6 md:p-8 border border-white/5 bg-surface/50 rounded-sm mb-6"
                >
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Github size={18} />
                            <span className="text-sm font-mono">{github.totalLastYear} contributions in the last year</span>
                        </div>
                        <a
                            href={`https://github.com/${github.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-1 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-primary transition-colors"
                        >
                            @{github.username}
                            <ArrowUpRight
                                size={14}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </a>
                    </div>

                    {/* Scrollable grid (heatmap is wider than mobile viewports) */}
                    <div className="overflow-x-auto pb-2">
                        <div className="inline-block min-w-full">
                            {/* Month labels */}
                            <div className="flex gap-[3px] mb-1 ml-0 text-[10px] text-neutral-600 font-mono h-3">
                                {weeks.map((_, weekIndex) => {
                                    const label = labels.find((l) => l.index === weekIndex);
                                    return (
                                        <div key={weekIndex} className="w-[11px] shrink-0">
                                            {label ? <span>{label.label}</span> : null}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Week columns */}
                            <div className="flex gap-[3px]">
                                {weeks.map((week, weekIndex) => (
                                    <motion.div
                                        key={weekIndex}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(weekIndex * 0.012, 0.7), duration: 0.3 }}
                                        className="flex flex-col gap-[3px]"
                                    >
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const day = week[dayIndex];
                                            if (!day) {
                                                return <div key={dayIndex} className="w-[11px] h-[11px]" />;
                                            }
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                                                    className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0]}`}
                                                />
                                            );
                                        })}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-neutral-600 font-mono">
                        <span>Less</span>
                        {LEVEL_CLASSES.map((cls, i) => (
                            <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
                        ))}
                        <span>More</span>
                    </div>
                </motion.div>

                {/* Stat counters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, duration: 0.8 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {stats.map((stat) => (
                        <div
                            key={`${stat.platform}-${stat.label}`}
                            className="p-6 border border-white/5 bg-surface/50 rounded-sm text-center hover:border-primary/30 transition-colors duration-500"
                        >
                            <p className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 tabular-nums">
                                <Counter to={stat.value} />
                            </p>
                            <p className="text-sm text-white font-medium">{stat.label}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-1">
                                {stat.platform}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Platform links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-4 mt-8"
                >
                    <a
                        href={`https://github.com/${github.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-full text-sm text-neutral-400 hover:text-primary hover:border-primary/40 transition-colors"
                    >
                        <Github size={16} />
                        GitHub
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <a
                        href={`https://huggingface.co/${huggingface.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-full text-sm text-neutral-400 hover:text-primary hover:border-primary/40 transition-colors"
                    >
                        <HuggingFaceIcon size={16} />
                        Hugging Face
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Activity;
