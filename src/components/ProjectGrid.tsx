import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectModal, { type Project } from './ProjectModal';
import projectDataRaw from '../projects.json';

// Cast JSON data to Project type
const projectData = projectDataRaw as Project[];

const ProjectGrid = () => {
    const [filter, setFilter] = useState('All');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Extract unique categories
    const categories = ['All', ...new Set(projectData.map(p => p.category))];

    const filteredProjects = filter === 'All'
        ? projectData
        : projectData.filter(p => p.category === filter);

    return (
        <section id="projects" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-heading font-bold mb-4">Selected Work</h2>
                        <div className="h-1 w-20 bg-primary" />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`text-sm font-bold uppercase tracking-wider px-4 py-2 border transition-all ${filter === cat
                                    ? 'bg-text text-background border-text'
                                    : 'text-text-muted border-transparent hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                    <AnimatePresence>
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedProject(project)}
                                className="cursor-pointer"
                            >
                                <ProjectCard
                                    title={project.title}
                                    category={project.category}
                                    image={project.image}
                                    description={project.description}
                                    links={project.links}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export default ProjectGrid;
