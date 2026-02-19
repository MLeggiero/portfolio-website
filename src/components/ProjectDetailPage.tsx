import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Github, ExternalLink, FileText, ChevronLeft } from 'lucide-react';
import projectData from '../projects.json';
import ProjectGallery from './ProjectGallery';

interface Section {
    heading?: string;
    content?: string;
    bullets?: string[];
}

interface Project {
    id: number;
    slug: string;
    title: string;
    category: string;
    role: string;
    period: string;
    image: string;
    description: string;
    sections: Section[];
    tags: string[];
    links: {
        github?: string;
        demo?: string;
        paper?: string;
    };
    gallery?: { src: string; caption?: string }[];
}

const projects = projectData as Project[];

const ProjectDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const currentIndex = projects.findIndex((p) => p.slug === slug);
    const project = projects[currentIndex];

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-heading font-bold mb-4">
                        Project Not Found
                    </h1>
                    <Link to="/" className="text-primary hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
    const nextProject =
        currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Banner */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 z-10 flex items-center gap-2 text-sm text-neutral-400 
                               hover:text-white transition-colors font-mono uppercase tracking-wider"
                >
                    <ChevronLeft size={16} />
                    All Projects
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="container mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-primary text-xs tracking-[0.3em] uppercase font-mono mb-3 block">
                                {project.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                                {project.title}
                            </h1>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-6 md:px-12 py-12">
                {/* Metadata bar */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="flex flex-wrap gap-6 mb-12 pb-8 border-b border-white/10"
                >
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">
                            Role
                        </p>
                        <p className="text-white font-medium">{project.role}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">
                            Period
                        </p>
                        <p className="text-white font-medium">{project.period}</p>
                    </div>
                </motion.div>

                {/* Sections */}
                {project.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                        className="mb-10"
                    >
                        {section.heading && (
                            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                                {section.heading}
                            </h2>
                        )}
                        {section.content && (
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                {section.content}
                            </p>
                        )}
                        {section.bullets && (
                            <ul className="space-y-3 ml-1">
                                {section.bullets.map((bullet, bIdx) => (
                                    <li
                                        key={bIdx}
                                        className="flex gap-3 text-neutral-400 leading-relaxed"
                                    >
                                        <span className="text-primary mt-1.5 shrink-0">
                                            ▸
                                        </span>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                ))}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-wrap gap-2 mb-10 pt-8 border-t border-white/10"
                    >
                        {project.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* Gallery */}
                {project.gallery && project.gallery.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <ProjectGallery images={project.gallery} />
                    </motion.div>
                )}

                {/* External links */}
                {(project.links.github ||
                    project.links.demo ||
                    project.links.paper) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55, duration: 0.5 }}
                            className="flex flex-wrap gap-4 mb-16"
                        >
                            {project.links.github && (
                                <a
                                    href={project.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white 
                                           hover:border-primary hover:text-primary transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    <Github size={16} /> Code
                                </a>
                            )}
                            {project.links.paper && (
                                <a
                                    href={project.links.paper}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white 
                                           hover:border-primary hover:text-primary transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    <FileText size={16} /> Paper
                                </a>
                            )}
                            {project.links.demo && (
                                <a
                                    href={project.links.demo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white 
                                           hover:border-primary hover:text-primary transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    <ExternalLink size={16} /> View Live
                                </a>
                            )}
                        </motion.div>
                    )}

                {/* Prev / Next navigation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex justify-between items-center pt-8 border-t border-white/10"
                >
                    {prevProject ? (
                        <Link
                            to={`/projects/${prevProject.slug}`}
                            className="group flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft
                                size={18}
                                className="group-hover:-translate-x-1 transition-transform"
                            />
                            <div>
                                <p className="text-xs uppercase tracking-widest font-mono text-neutral-500">
                                    Previous
                                </p>
                                <p className="font-medium">{prevProject.title}</p>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextProject ? (
                        <Link
                            to={`/projects/${nextProject.slug}`}
                            className="group flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-right"
                        >
                            <div>
                                <p className="text-xs uppercase tracking-widest font-mono text-neutral-500">
                                    Next
                                </p>
                                <p className="font-medium">{nextProject.title}</p>
                            </div>
                            <ArrowRight
                                size={18}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    ) : (
                        <div />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;
