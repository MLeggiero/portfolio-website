import { motion } from 'framer-motion';

const experiences = [
    {
        role: "Mechanical Engineer I",
        company: "CORE|EPC",
        period: "Apr 2025 – Present",
        description: "",
        points: [
            "Designed building and manufacturing systems for $500K+ commercial and industrial projects, ensuring client satisfaction and regulatory compliance.",
            "Worked in multi-disciplinary teams across recycling, renewable power generation, chemical production, and manufacturing sectors."
        ]
    },
    {
        role: "Board Member",
        company: "Kiwimbi International",
        period: "Jan 2025 – Present",
        description: "",
        points: [
            "Guide strategic decisions for $300,000 nonprofit improving child nutrition, primary and high school education, and quality employment in Kenya."
        ]
    },
    {
        role: "Education Volunteer",
        company: "Peace Corps Kenya",
        period: "Oct 2022 – Nov 2024",
        description: "",
        points: [
            "Led $12,000 USAID project for village-scale water distribution system serving 2,000+ individuals.",
            "Taught Math and Physics to 250+ high school students in a resource-constrained environment."
        ]
    },
    {
        role: "Technical Lead",
        company: "Engineers Without Borders GT",
        period: "Aug 2020 – Aug 2022",
        description: "",
        points: [
            "Led 10-engineer team conducting remote needs-analysis for sanitation solutions in rural Malawi.",
            "Designed eight ventilation-improved latrines (SolidWorks) for primary school of 300+ students."
        ]
    },
    {
        role: "Research Intern",
        company: "Smart Sea Level Sensors Project",
        period: "May 2021 – Aug 2021",
        description: "",
        points: [
            "Upgraded firmware (C++) for ESP-32 IoT controller to allow for dense LoRaWAN network rainfall data collection in Savannah, Georgia.",
            "Conducted market analysis optimizing rainfall sensor cost and reliability; developed cellular-capable telemetry redundancy plan."
        ]
    },
    {
        role: "Research Intern",
        company: "Brookhaven National Laboratory",
        period: "May 2019 – Aug 2019",
        description: "",
        points: [
            "Developed sample exchange robotic system and GUI (LabVIEW) for in-vacuum x-ray imaging beamlines with postdoctoral research staff."
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
