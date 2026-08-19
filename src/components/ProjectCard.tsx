import { useEffect, useRef, useState } from 'react';
import { Github, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Link {
    github?: string;
    demo?: string;
    paper?: string;
}

interface ProjectProps {
    title: string;
    category: string;
    image: string;
    /** Animated clip shown in place of the still once the card is on screen. */
    preview?: string;
    description: string;
    links: Link;
}

const ProjectCard = ({ title, category, image, preview, description, links }: ProjectProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

    // The clips are the point of the grid, so they play on their own rather
    // than waiting for a hover — but only once the card is actually near the
    // viewport. Fetching every clip on load would put megabytes in front of a
    // visitor who never scrolls past the hero.
    useEffect(() => {
        if (!preview) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = cardRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setShowPreview(true);
                    io.disconnect();
                }
            },
            { rootMargin: '250px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [preview]);

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group relative overflow-hidden bg-surface aspect-[4/3] cursor-pointer"
        >
            {/* Still frame. Stays mounted underneath so the card never flashes
                empty while the clip is still decoding. */}
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {showPreview && preview && (
                <img
                    src={preview}
                    alt=""
                    aria-hidden="true"
                    onLoad={() => setPreviewLoaded(true)}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700
                               group-hover:scale-110"
                    style={{ opacity: previewLoaded ? 1 : 0 }}
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center backdrop-blur-sm">
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {category}
                </span>
                <h3 className="text-xl font-heading font-bold mb-4 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {title}
                </h3>
                <p className="text-sm text-gray-300 mb-6 line-clamp-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    {description}
                </p>

                <div className="flex space-x-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                    {links.github && (
                        <a href={links.github} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-primary rounded-full transition-colors text-white" aria-label="GitHub">
                            <Github size={20} />
                        </a>
                    )}
                    {links.demo && (
                        <a href={links.demo} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-primary rounded-full transition-colors text-white" aria-label="Demo">
                            <ExternalLink size={20} />
                        </a>
                    )}
                    {links.paper && (
                        <a href={links.paper} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-primary rounded-full transition-colors text-white" aria-label="Read Paper">
                            <FileText size={20} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
