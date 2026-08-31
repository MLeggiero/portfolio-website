import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface GalleryImage {
    src: string;
    caption?: string;
    /** Still shown in the grid, and behind a video until it decodes. */
    poster?: string;
}

interface ProjectGalleryProps {
    images: GalleryImage[];
}

/** Gallery entries are stills unless the source is a video file. */
const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src);

const ProjectGallery = ({ images }: ProjectGalleryProps) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const openLightbox = (idx: number) => setLightboxIndex(idx);
    const closeLightbox = () => setLightboxIndex(null);

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    };

    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev === null || prev === 0 ? images.length - 1 : prev - 1));
        if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev === null || prev === images.length - 1 ? 0 : (prev ?? 0) + 1));
    };

    return (
        <>
            {/* Thumbnail Grid */}
            <div className="mb-10 pt-8 border-t border-white/10">
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-4">
                    Gallery
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openLightbox(idx)}
                            className="relative aspect-[4/3] overflow-hidden group rounded-sm"
                        >
                            <img
                                src={isVideo(img.src) ? img.poster : img.src}
                                alt={img.caption || `Gallery item ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                            {isVideo(img.src) && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm
                                                     border border-white/30 text-white group-hover:bg-primary group-hover:border-primary
                                                     transition-colors">
                                        <Play size={18} className="translate-x-[1px]" fill="currentColor" />
                                    </span>
                                </span>
                            )}
                            {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-xs truncate">
                                        {img.caption}
                                    </p>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
                        onClick={closeLightbox}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                        role="dialog"
                        aria-label="Image lightbox"
                    >
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white transition-colors z-10"
                            aria-label="Close lightbox"
                        >
                            <X size={28} />
                        </button>

                        {/* Counter */}
                        <p className="absolute top-6 left-6 text-neutral-500 font-mono text-sm">
                            {lightboxIndex + 1} / {images.length}
                        </p>

                        {/* Prev */}
                        {images.length > 1 && (
                            <button
                                onClick={goPrev}
                                className="absolute left-4 md:left-8 p-3 text-neutral-400 hover:text-white transition-colors"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        )}

                        {/* Image */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isVideo(images[lightboxIndex].src) ? (
                                <video
                                    key={images[lightboxIndex].src}
                                    src={images[lightboxIndex].src}
                                    poster={images[lightboxIndex].poster}
                                    className="max-w-full max-h-[75vh] object-contain rounded-sm"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    controls
                                />
                            ) : (
                                <img
                                    src={images[lightboxIndex].src}
                                    alt={images[lightboxIndex].caption || ''}
                                    className="max-w-full max-h-[75vh] object-contain rounded-sm"
                                />
                            )}
                            {images[lightboxIndex].caption && (
                                <p className="text-neutral-400 text-sm mt-4 text-center max-w-lg">
                                    {images[lightboxIndex].caption}
                                </p>
                            )}
                        </motion.div>

                        {/* Next */}
                        {images.length > 1 && (
                            <button
                                onClick={goNext}
                                className="absolute right-4 md:right-8 p-3 text-neutral-400 hover:text-white transition-colors"
                                aria-label="Next image"
                            >
                                <ChevronRight size={32} />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProjectGallery;
