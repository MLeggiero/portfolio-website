/**
 * The two clips the generic project page cannot show: its `video` field is an
 * iframe for hosted players, and these are self-hosted MP4s. The hand clip is a
 * 3:1 side-by-side strip, which a 4:3 gallery thumbnail would crop to one panel.
 *
 * Both are simulation. Only the hammer runs the tactile controller; the drill
 * and saw in the ship clip are scripted, and the caption has to say so.
 */

const CLIPS = [
    {
        eyebrow: 'In motion',
        src: '/videos/fast-touch/ship.mp4',
        poster: '/images/fast-touch/ship-poster.jpg',
        aspect: 'aspect-video',
        label: 'Simulated humanoid using a hacksaw, a hammer and a drill in a ship passageway',
        caption:
            'MuJoCo simulation rendered in Blender. Only the hammer runs the tactile controller; the drill and saw are scripted.',
    },
    {
        eyebrow: 'Same blows, three controllers',
        src: '/videos/fast-touch/hands.mp4',
        poster: '/images/fast-touch/hands-poster.jpg',
        aspect: 'aspect-[40/13]',
        label: 'The hand on the hammer with no controller, a 30 Hz controller and a 250 Hz controller, side by side',
        caption:
            'Slippery handle (μ = 0.2), half-strength grip, 33× slow motion. With no controller or a 30 Hz one the hammer falls by the fourth blow; at 250 Hz it holds. One episode, chosen to show the contrast.',
    },
];

const FastTouchShowcase = () => (
    <div className="mb-12 space-y-12">
        {CLIPS.map((clip) => (
            <div key={clip.src}>
                <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                    {clip.eyebrow}
                </p>
                <figure className="bg-surface border border-white/10">
                    <video
                        src={clip.src}
                        poster={clip.poster}
                        aria-label={clip.label}
                        className={`w-full ${clip.aspect} bg-black`}
                        controls
                        muted
                        playsInline
                        preload="none"
                    />
                    <figcaption className="p-3 text-xs text-neutral-500 leading-relaxed">
                        {clip.caption}
                    </figcaption>
                </figure>
            </div>
        ))}
    </div>
);

export default FastTouchShowcase;
