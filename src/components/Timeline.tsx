import { motion } from 'framer-motion';

const experiences = [
    {
        role: "STEM Education Teacher",
        company: "Peace Corps Kenya",
        period: "Oct 2022 - Nov 2024",
        description: "",
        points: [
            "Taught Math and Physics to students from rural areas, combining engineering practice with global development.",
            "Established a Science and Engineering Club to encourage critical thinking.",
            "Led community projects including grant writing, developing a demonstration garden, and implementing a pumped potable water system.",
            "Acquired intermediate Swahili language skills and advanced classroom management techniques."
        ]
    },
    {
        role: "Technical Lead",
        company: "Engineers Without Borders",
        period: "Aug 2020 - May 2021",
        description: "",
        points: [
            "Managed the implementation of sanitation latrines and handwashing stations for Mpitilira primary school in Malawi.",
            "Conducted rigorous needs assessments and design iterations using decision matrices.",
            "Coordinated with partners like Bless Bay Foundation and Freshwater Project International.",
            "Successfully managed the sanitation upgrade fully remotely during the COVID-19 pandemic."
        ]
    },
    {
        role: "Student Researcher",
        company: "VAMPIRE Lab (Georgia Tech)",
        period: "Jan 2019 - Aug 2021",
        description: "Conducted research on building heat loss using drone-based thermal imaging.",
        points: [
            "Utilized drones equipped with thermal cameras and surface-from-motion photogrammetry to capture building thermal profiles.",
            "Designed and implemented custom numerical surface integration software to process thermal OBJ files.",
            "Authored papers on thermal analysis and sensor networks."
        ]
    },
    {
        role: "Senior Capstone Design",
        company: "Georgia Tech",
        period: "Jan 2021 - May 2022",
        description: "",
        points: [
            "Designed 'Keep The Beep', a ruggedized soft housing for GE Carescape physiological monitors.",
            "Utilized a FaroArm Quantum 3D Scanner to import monitor geometry into SolidWorks.",
            "Rapidly prototyped the design using 3D printing with soft TPU filament."
        ]
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

                                {exp.points ? (
                                    <ul className="list-disc list-outside ml-4 text-gray-400 text-sm leading-relaxed space-y-2 marker:text-primary/70">
                                        {exp.points.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;
