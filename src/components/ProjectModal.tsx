import { X, Github, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Project {
    id: number;
    title: string;
    category: string;
    image: string;
    description: string;
    longDescription?: string;
    tags?: string[];
    video?: string;
    links: {
        github?: string;
        demo?: string;
        paper?: string;
    };
}

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-white/10 shadow-2xl relative flex flex-col md:flex-row"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-primary rounded-full text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent md:hidden" />
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2">{project.category}</span>
                    <h2 className="text-3xl font-heading font-bold mb-6 text-white">{project.title}</h2>

                    <div className="prose prose-invert prose-sm mb-8 text-gray-300 leading-relaxed whitespace-pre-line overflow-y-auto custom-scrollbar flex-grow">
                        {project.longDescription || project.description}
                    </div>

                    {project.tags && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-primary">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4 mt-auto pt-6 border-t border-white/10">
                        {project.links.github && (
                            <a
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-white hover:text-primary transition-colors font-bold uppercase text-sm"
                            >
                                <Github size={18} className="mr-2" /> Code
                            </a>
                        )}
                        {project.links.demo && (
                            <a
                                href={project.links.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-white hover:text-primary transition-colors font-bold uppercase text-sm"
                            >
                                <ExternalLink size={18} className="mr-2" /> Demo
                            </a>
                        )}
                        {project.links.paper && (
                            <a
                                href={project.links.paper}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-white hover:text-primary transition-colors font-bold uppercase text-sm"
                            >
                                <FileText size={18} className="mr-2" /> Paper
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectModal;
