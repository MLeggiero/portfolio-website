import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import projectDataRaw from '../projects.json';
import ProjectCard from './ProjectCard';

interface Project {
    id: number;
    slug: string;
    title: string;
    category: string;
    image: string;
    description: string;
    tags?: string[];
    links: { github?: string; demo?: string; paper?: string };
}

const projectData = projectDataRaw as Project[];

const VQ_BASE = 'https://vqactflow.github.io/vqactflow';

interface Clip {
    label: string;
    caption: string;
    video: string;
    poster: string;
}

const clipGroups: { name: string; blurb: string; clips: Clip[] }[] = [
    {
        name: 'Unitree G1 Humanoid',
        blurb: 'Language-conditioned pick-and-place on real humanoid hardware — four objects, one policy.',
        clips: [
            { label: 'Red ball', caption: 'Place the red ball into the box', video: 'g1_ball', poster: 'g1_ball' },
            { label: 'Cup', caption: 'Place the cup into the box', video: 'g1_cup', poster: 'g1_cup' },
            { label: 'Bottle', caption: 'Place the bottle into the box', video: 'g1_bottle', poster: 'g1_bottle' },
            { label: 'Medicine', caption: 'Place the medicine bottle into the box', video: 'g1_medicine', poster: 'g1_medicine' },
        ],
    },
    {
        name: 'Bimanual Platform',
        blurb: 'ALOHA-style two-arm manipulation — sweeping, sorting, and insertion from a single multi-task policy.',
        clips: [
            { label: 'Battery sweep', caption: 'Sweep the battery into the dust pan', video: 'bimanual_sweep', poster: 'bimanual_sweep' },
            { label: 'Rubber duck', caption: 'Place the rubber duck into the white bin', video: 'bimanual_duck', poster: 'bimanual_duck' },
            { label: 'Cylinder', caption: 'Insert the cylinder into the hole', video: 'bimanual_cylinder', poster: 'bimanual_cylinder' },
            { label: 'Red ball', caption: 'Place the red ball into the black bin', video: 'bimanual_ball', poster: 'bimanual_ball' },
        ],
    },
];

const stats = [
    { value: '81.0%', label: 'LIBERO-Goal peak success, vs. 61.5% for the closest discrete baseline' },
    { value: '80.5%', label: 'LIBERO-90 success with guidance and the codebook critic' },
    { value: '57.5%', label: 'G1 humanoid success, up from 23.8% with no guidance' },
    { value: '77.5%', label: 'Bimanual average success with CFG and the critic together' },
];

const ClipGallery = ({ group }: { group: { name: string; blurb: string; clips: Clip[] } }) => {
    const [active, setActive] = useState(0);
    const clip = group.clips[active];

    return (
        <div className="bg-surface border border-white/10 overflow-hidden">
            <div className="relative aspect-video bg-black">
                <video
                    key={clip.video}
                    src={`${VQ_BASE}/assets/videos/${clip.video}.mp4`}
                    poster={`${VQ_BASE}/assets/videos/posters/${clip.poster}.jpg`}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                    controls
                />
            </div>
            <div className="p-5">
                <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h3 className="font-heading font-bold text-white">{group.name}</h3>
                    <p className="text-xs font-mono text-neutral-500 text-right shrink-0">
                        “{clip.caption}”
                    </p>
                </div>
                <p className="text-sm text-neutral-400 mb-4">{group.blurb}</p>
                <div className="flex flex-wrap gap-2">
                    {group.clips.map((c, idx) => (
                        <button
                            key={c.label}
                            onClick={() => setActive(idx)}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${idx === active
                                ? 'bg-primary border-primary text-white'
                                : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RoboticsPage = () => {
    const navigate = useNavigate();

    const roboticsProjects = projectData.filter(
        (p) => p.tags?.includes('Robotics') && p.slug !== 'vqactflow'
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="pt-32 pb-16">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-primary text-xs tracking-[0.4em] uppercase font-mono mb-4">
                            Robotics
                        </p>
                        <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-6 leading-tight text-white">
                            Robot Learning &amp; Mechatronics
                        </h1>
                        <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            From brushless motor control and inverse kinematics to
                            generative policies for multi-task manipulation — hardware
                            built from scratch and learning methods validated on real robots.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Featured: VQActFlow */}
            <section className="pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-2">
                                    Featured Research
                                </p>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                                    VQActFlow
                                </h2>
                                <p className="text-neutral-500 font-mono text-sm mt-2">
                                    Vector-Quantized Action Mode Steering for Multi-Task Robot Manipulation
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <a
                                    href={`${VQ_BASE}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary
                                               hover:bg-primary hover:text-white transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    <ExternalLink size={16} /> Project Page
                                </a>
                                <Link
                                    to="/projects/vqactflow"
                                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white
                                               hover:border-primary hover:text-primary transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    Details <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        <p className="text-neutral-400 leading-relaxed max-w-3xl mb-10">
                            In multi-task manipulation, a policy has to commit to the action
                            mode that matches the current instruction — pick the wrong mode
                            and the robot does the wrong task. VQActFlow tokenizes action
                            chunks into a discrete codebook and generates the codes with
                            Variational Flow Matching, so the policy carries a distribution
                            over action modes through every step of generation. At inference
                            time, classifier-free guidance and a learned codebook critic
                            steer that distribution — without retraining the policy.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 mb-10">
                            {stats.map((stat) => (
                                <div key={stat.label} className="bg-surface p-5">
                                    <p className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Video galleries */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {clipGroups.map((group) => (
                                <ClipGallery key={group.name} group={group} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Other robotics projects */}
            <section className="pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4 text-white">
                            More Robotics Work
                        </h2>
                        <div className="h-1 w-20 bg-primary mb-12" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {roboticsProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => navigate(`/projects/${project.slug}`)}
                                    className="cursor-pointer"
                                >
                                    <ProjectCard
                                        title={project.title}
                                        category={project.category}
                                        image={project.image}
                                        description={project.description}
                                        links={project.links}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default RoboticsPage;
