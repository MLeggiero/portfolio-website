import { ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
            {/* Background Element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-surface/20 -skew-x-12 translate-x-1/2 -z-10" />

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-sm">Engineer</h2>
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-tight mb-6">
                        BUILDING <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            TOMORROW'S
                        </span> <br />
                        SYSTEMS
                    </h1>
                    <p className="text-text-muted text-lg mb-8 max-w-lg leading-relaxed">
                        Mechanical Engineering & Physics graduate from Georgia Tech.
                        Returned Peace Corps Volunteer focused on robotics, prototype design,
                        and humanitarian projects.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a href="#projects" className="group px-8 py-3 bg-primary text-white font-bold uppercase tracking-wider hover:bg-red-600 transition-all flex items-center">
                            View Work
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </a>
                        <a href="/resume.pdf" download className="px-8 py-3 border border-surface bg-surface/50 text-white font-bold uppercase tracking-wider hover:bg-surface transition-colors flex items-center">
                            Resume
                            <Download className="ml-2" size={20} />
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden md:block"
                >
                    <div className="aspect-square bg-surface rounded-full opacity-20 absolute -top-10 -right-10 w-full h-full animate-pulse" />
                    <img
                        src="https://res.cloudinary.com/dzbaeix94/image/upload/v1767977974/180920-leggiero-mark-2286_j2ofoo.jpg"
                        alt="Engineering Workspace"
                        className="relative z-10 w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700 rounded-sm shadow-2xl border-b-4 border-primary"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
