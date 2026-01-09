import { motion } from 'framer-motion';

const experiences = [
    {
        role: "STEM Education Teacher",
        company: "Peace Corps Kenya",
        period: "Oct 2022 - Nov 2024",
        description: "Taught Math/Physics and led community development projects: built a school laboratory, established a demonstration garden, and implemented a pumped water system."
    },
    {
        role: "Technical Lead",
        company: "Engineers Without Borders",
        period: "Aug 2020 - May 2021",
        description: "Led the design and implementation of sanitation latrines for a school in Malawi. Managed technical drawings and cross-continental project coordination."
    },
    {
        role: "Student Researcher",
        company: "VAMPIRE Lab (Georgia Tech)",
        period: "Jan 2019 - Aug 2021",
        description: "Conducted research on building heat loss. Authored papers on thermal analysis and sensor networks."
    },
    {
        role: "Senior Capstone Design",
        company: "Georgia Tech",
        period: "Jan 2021 - May 2022",
        description: "Designed 'Keep The Beep' - a ruggedized soft housing for GE Carescape physiological monitors for transport scenarios."
    }
];

const Timeline = () => {
    return (
        <section id="experience" className="py-24 bg-surface/30">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-4xl font-heading font-bold mb-16 text-center">Experience</h2>

                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[50%] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent before:content-['']">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                        >
                            {/* Icon / Dot */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-primary transition-colors">
                                <div className="w-3 h-3 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-surface border border-white/5 hover:border-white/10 transition-colors rounded-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-white">{exp.role}</h3>
                                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{exp.period}</span>
                                </div>
                                <div className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wide">{exp.company}</div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {exp.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;
