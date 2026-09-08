import { Box, ExternalLink } from 'lucide-react';
import { ACTUATOR_PHOTOS, ACTUATOR_URL, FULL_ASSEMBLY_URL } from '../data/mimicCad';

/**
 * A card that links out to a live Onshape document. Onshape refuses to be
 * framed on outside domains (SAMEORIGIN + a CSP locked to onshape.com), so
 * this is the closest thing to an "embedded" viewer that actually works: a
 * preview of what you're about to open, one click from the real model.
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
                    Every part of Mimic — links, joints, and all three actuators — is modeled
                    and assembled in Onshape. The document below is the live model, not a
                    snapshot: open it to orbit, section, and inspect the same assembly the
                    arm was built from.
                </p>
                <CadLinkCard
                    href={FULL_ASSEMBLY_URL}
                    eyebrow="Onshape Document"
                    title="Mimic — full 3-axis assembly"
                    description="Complete arm assembly: links, joints, and all three actuators."
                />
            </div>

            {/* Actuator deep dive */}
            <div>
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    The actuator
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-4">
                    Three of these were built, one per axis, and they're the part of Mimic
                    I'm proudest of. Each is a self-contained BLDC servo actuator rather than
                    an off-the-shelf gearmotor: a cross-roller bearing carries the output
                    directly, so the joint takes radial, axial, and moment loads without a
                    separate output support, and there's no backlash at the mounting
                    interface the way there would be with a simple ball bearing pair.
                </p>
                <p className="text-neutral-400 leading-relaxed mb-6">
                    Behind that bearing sits a single-stage planetary gearbox at 11:1,
                    chosen to multiply the torque of the EaglePro 8803 BLDC motor into the
                    range each joint needs while staying far more backdrivable than a
                    harmonic or cycloidal stage would be. Sizing the motor meant working
                    backward from that output torque and speed envelope, and living with
                    the tradeoff of picking a compact motor still meant designing for its
                    thermal limit: an integrated fan pulls air through the housing so the
                    motor can sit at continuous torque without derating. An AS5600 magnetic
                    encoder closes the loop on joint position.
                </p>

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
                    title="Mimic — actuator design"
                    description="Cross-roller bearing, planetary gearbox, motor, and cooling in detail."
                />
            </div>
        </div>
    );
};

export default MimicShowcase;
