import { useState } from 'react';
import { VQ_BASE, type Clip } from '../data/vqactflowClips';

const ClipGallery = ({ group }: { group: { name: string; blurb: string; clips: Clip[] } }) => {
    const [active, setActive] = useState(0);
    const clip = group.clips[active];

    return (
        <div className="bg-surface border border-white/10 overflow-hidden">
            <div className="relative aspect-video bg-black">
                <video
                    key={clip.video}
                    src={`${VQ_BASE}/assets/videos/${clip.video}.mp4`}
                    poster={`${VQ_BASE}/assets/videos/posters/${clip.poster}.jpg`}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                    controls
                />
            </div>
            <div className="p-5">
                <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h3 className="font-heading font-bold text-white">{group.name}</h3>
                    <p className="text-xs font-mono text-neutral-500 text-right shrink-0">
                        “{clip.caption}”
                    </p>
                </div>
                <p className="text-sm text-neutral-400 mb-4">{group.blurb}</p>
                <div className="flex flex-wrap gap-2">
                    {group.clips.map((c, idx) => (
                        <button
                            key={c.label}
                            onClick={() => setActive(idx)}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${idx === active
                                ? 'bg-primary border-primary text-white'
                                : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClipGallery;
