import { Box, ExternalLink } from 'lucide-react';
import { ACTUATOR_PHOTOS, ACTUATOR_URL, FULL_ASSEMBLY_URL } from '../data/mimicCad';

/**
 * Onshape blocks iframes on outside domains, so this links out to the real
 * model instead of trying to embed it.
 */
const CadLinkCard = ({
    href,
    eyebrow,
    title,
    description,
}: {
    href: string;
    eyebrow: string;
    title: string;
    description: string;
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4
                   bg-surface border border-white/10 hover:border-primary/60 transition-all p-6"
    >
        <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/30 text-primary">
                <Box size={20} />
            </div>
            <div>
                <p className="text-xs text-primary uppercase tracking-widest font-mono mb-1">
                    {eyebrow}
                </p>
                <p className="text-white font-medium leading-snug mb-1">{title}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
            </div>
        </div>
        <span
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white shrink-0
                       group-hover:border-primary group-hover:text-primary transition-all text-xs font-bold uppercase tracking-wider"
        >
            Open in Onshape <ExternalLink size={14} />
        </span>
    </a>
);

const MimicShowcase = ({ video }: { video?: string }) => {
    return (
        <div className="mb-12">
            {/* Video, front and center */}
            {video && (
                <div className="mb-12">
                    <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                        In motion
                    </p>
                    <div className="relative w-full aspect-video overflow-hidden bg-black border border-white/10">
                        <iframe
                            src={video}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="Mimic 3-axis robot arm video"
                        />
                    </div>
                </div>
            )}

            {/* Full assembly CAD */}
            <div className="mb-12">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    The full model
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-5">
                    The whole arm, all three actuators included, is modeled and assembled
                    in Onshape. This is the live document.
                </p>
                <CadLinkCard
                    href={FULL_ASSEMBLY_URL}
                    eyebrow="Onshape Document"
                    title="Full 3-axis assembly"
                    description="Links, joints, and all three actuators."
                />
            </div>

            {/* Actuator deep dive */}
            <div>
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    The actuator
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-4">
                    Three of these were built, one per axis. This is the part of Mimic
                    I'm proudest of.
                </p>
                <ul className="space-y-2 mb-6 ml-1">
                    {[
                        'Cross-roller bearing output stage, carrying radial, axial, and moment loads with no backlash at the mount.',
                        'Single-stage planetary gearbox, 11:1, sized to stay backdrivable rather than locked like a harmonic drive.',
                        'EaglePro 8803 BLDC motor, sized to the output torque and speed the gearbox needs.',
                        'Integrated cooling fan, so the motor holds continuous torque without derating.',
                        'AS5600 magnetic encoder for closed-loop position feedback.',
                    ].map((line) => (
                        <li key={line} className="flex gap-3 text-neutral-400 leading-relaxed">
                            <span className="text-primary mt-1.5 shrink-0">▸</span>
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {ACTUATOR_PHOTOS.map((photo) => (
                        <figure key={photo.src} className="bg-surface border border-white/10">
                            <img
                                src={photo.src}
                                alt={photo.caption}
                                className="w-full aspect-[4/3] object-cover"
                                loading="lazy"
                            />
                            <figcaption className="p-3 text-xs text-neutral-500 leading-relaxed">
                                {photo.caption}
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <CadLinkCard
                    href={ACTUATOR_URL}
                    eyebrow="Onshape Document"
                    title="Actuator design"
                    description="Bearing, gearbox, motor, and cooling in detail."
                />
            </div>
        </div>
    );
};

export default MimicShowcase;
