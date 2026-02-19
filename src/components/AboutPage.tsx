import { motion } from 'framer-motion';
import { GraduationCap, Wrench, MapPin } from 'lucide-react';

const skills = {
    'Programming': ['Python', 'C++', 'C', 'MATLAB', 'LabVIEW'],
    'CAD & Fabrication': [
        'SolidWorks',
        'Fusion360',
        'Revit',
        'AutoCAD',
        '3D Printing',
        '3D Scanning',
        'Laser Cutting',
    ],
    'Robotics & Embedded': ['ROS2', 'ESP32', 'Arduino IDE'],
};

const education = [
    {
        degree: 'MS Mechanical Engineering',
        school: 'Georgia Institute of Technology',
        detail: 'Started Aug 2025',
    },
    {
        degree: 'BS Mechanical Engineering',
        school: 'Georgia Institute of Technology',
        detail: 'Aug 2022',
    },
    {
        degree: 'BS Physics',
        school: 'University of North Georgia',
        detail: 'Aug 2022',
    },
];

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="pt-32 pb-16">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-primary text-xs tracking-[0.4em] uppercase font-mono mb-4">
                            About
                        </p>
                        <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-4 leading-[0.9]">
                            <span className="text-white">MARK</span>{' '}
                            <span className="text-primary">LEGGIERO</span>
                        </h1>
                        <p className="text-neutral-500 text-sm tracking-[0.3em] uppercase font-mono">
                            Engineer · Educator · Volunteer
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Bio */}
            <section className="pb-20">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="space-y-6 text-neutral-400 leading-relaxed text-base md:text-lg"
                    >
                        <p>
                            Hi, I'm Mark! I'm from Oviedo, Florida, and have lived and journeyed
                            throughout the southeastern US. I have always been drawn to technical
                            projects, which paired with my education in Physics and Mechanical
                            Engineering. However at home, my large adoptive family kept me
                            globally-minded, which led me to focus on community development and
                            poverty alleviation.
                        </p>
                        <p>
                            My journey to combine engineering practice with global development
                            projects — often called <span className="text-white font-medium">Humanitarian Engineering</span> —
                            culminated in joining the Peace Corps Kenya in 2022 as a volunteer STEM
                            Education Teacher. I taught Math and Physics in a Kakamega county high
                            school and worked on school programs and infrastructure. I also
                            experimented with sustainable agriculture and raised Guinea fowl (a
                            beautiful, and loud, African bird).
                        </p>
                        <p>
                            In my free time I enjoy hiking, biking, baking, and mechatronics/robotics
                            projects.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Education */}
            <section className="py-16 bg-surface/30">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <GraduationCap size={24} className="text-primary" />
                            <h2 className="text-2xl font-heading font-bold text-white">
                                Education
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {education.map((edu) => (
                                <div
                                    key={edu.degree}
                                    className="p-6 border border-white/5 bg-surface/50 rounded-sm"
                                >
                                    <p className="text-white font-bold text-lg mb-1">
                                        {edu.degree}
                                    </p>
                                    <p className="text-neutral-400 font-mono text-sm">
                                        {edu.school}
                                    </p>
                                    {edu.detail && (
                                        <p className="text-neutral-500 font-mono text-xs mt-1">
                                            {edu.detail}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Skills */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Wrench size={24} className="text-primary" />
                            <h2 className="text-2xl font-heading font-bold text-white">
                                Skills
                            </h2>
                        </div>
                        {Object.entries(skills).map(([level, items]) => (
                            <div key={level} className="mb-8 last:mb-0">
                                <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-3">
                                    {level}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-2 border border-white/10 text-neutral-300 bg-white/5 rounded-sm text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Location */}
            <section className="py-16 bg-surface/30">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-4"
                    >
                        <div className="p-3 border border-white/10 rounded-full">
                            <MapPin size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">
                                Based in
                            </p>
                            <p className="text-white text-lg font-medium">
                                Atlanta, Georgia
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
