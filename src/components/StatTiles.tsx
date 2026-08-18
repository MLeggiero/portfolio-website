interface Stat {
    value: string;
    label: string;
}

/**
 * A row of headline numbers. Extracted from the old Robotics page so both
 * VQActFlow and burg-bot render their results the same way.
 */
const StatTiles = ({ stats, className = '' }: { stats: Stat[]; className?: string }) => (
    <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 ${className}`}
    >
        {stats.map((stat) => (
            <div key={stat.label} className="bg-surface p-5">
                <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2">
                    {stat.value}
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed">{stat.label}</p>
            </div>
        ))}
    </div>
);

export default StatTiles;
