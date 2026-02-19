import { useRef } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import BlueprintCanvas from './BlueprintCanvas';

const HeroInteractive = () => {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section
            id="home"
            ref={sectionRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
        >
            <BlueprintCanvas />

            {/* Hero content */}
            <div
                className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl"
                >
                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-neutral-500 text-xs tracking-[0.4em] uppercase mb-8 font-mono"
                    >
                        Robotics Engineer
                    </motion.p>

                    {/* Name — big, bold, clean */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold leading-[0.85] mb-8 tracking-tight"
                    >
                        <span className="block text-white">MARK</span>
                        <span className="block text-primary">LEGGIERO</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 1 }}
                        className="text-neutral-400 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed font-light"
                    >
                        Georgia Tech ME &amp; Physics · Peace Corps Kenya ·
                        Building machines that move through the real world.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.8 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <a
                            href="#projects"
                            className="group px-8 py-3 bg-white text-black font-bold uppercase text-sm tracking-wider
                         hover:bg-neutral-200 transition-all duration-300 flex items-center"
                        >
                            View Work
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                        </a>
                        <a
                            href="/resume.pdf"
                            download
                            className="px-8 py-3 border border-neutral-700 text-neutral-300 font-medium
                         uppercase text-sm tracking-wider hover:border-neutral-500 hover:text-white
                         transition-all duration-300 flex items-center"
                        >
                            Resume
                            <Download className="ml-2" size={18} />
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator — positioned absolutely at bottom, no overlap */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-[1px] h-10 bg-gradient-to-b from-transparent via-neutral-600 to-transparent"
                />
            </motion.div>
        </section>
    );
};

export default HeroInteractive;
