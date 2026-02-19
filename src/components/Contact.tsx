import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, MapPin, ArrowUpRight } from 'lucide-react';

const socials = [
    {
        name: 'GitHub',
        href: 'https://github.com/mleggiero',
        icon: Github,
        label: 'mleggiero',
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/mark-leggiero/',
        icon: Linkedin,
        label: 'mark-leggiero',
    },
];

const Contact = () => {
    return (
        <section id="contact" className="py-32 bg-background relative overflow-hidden">
            {/* Subtle decorative grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(44,77,228,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(44,77,228,0.5) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="text-primary text-xs tracking-[0.4em] uppercase font-mono mb-4">
                        Get In Touch
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
                        Let's Build Something
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto mb-8" />
                    <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
                        I'm always excited to discuss new opportunities in robotics,
                        mechatronics, and embedded systems. Whether you have a project in mind
                        or just want to connect — reach out.
                    </p>
                </motion.div>

                {/* Main CTA — Email */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-16"
                >
                    <a
                        href="mailto:mark.leggiero1@gmail.com"
                        className="group block p-8 md:p-12 border border-white/5 bg-surface/50 hover:border-primary/30
                                   transition-all duration-500 rounded-sm text-center"
                    >
                        <Mail className="mx-auto mb-6 text-primary" size={32} />
                        <p className="text-neutral-500 text-sm uppercase tracking-widest font-mono mb-3">
                            Email
                        </p>
                        <p className="text-xl md:text-2xl font-heading font-bold text-white group-hover:text-primary transition-colors">
                            mark.leggiero1@gmail.com
                        </p>
                        <p className="text-neutral-500 text-sm mt-4 flex items-center justify-center gap-1 group-hover:text-neutral-300 transition-colors">
                            Click to send a message
                            <ArrowUpRight
                                size={14}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                        </p>
                    </a>
                </motion.div>

                {/* Social links + Location */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {socials.map((s) => (
                        <a
                            key={s.name}
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-4 p-6 border border-white/5 bg-surface/50
                                       hover:border-primary/30 transition-all duration-500 rounded-sm"
                        >
                            <div className="p-3 border border-white/10 rounded-full group-hover:border-primary/40 transition-colors">
                                <s.icon size={20} className="text-neutral-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">
                                    {s.name}
                                </p>
                                <p className="text-white text-sm font-medium group-hover:text-primary transition-colors">
                                    {s.label}
                                </p>
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="ml-auto text-neutral-600 group-hover:text-primary
                                           group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                            />
                        </a>
                    ))}

                    {/* Location */}
                    <div className="flex items-center gap-4 p-6 border border-white/5 bg-surface/50 rounded-sm">
                        <div className="p-3 border border-white/10 rounded-full">
                            <MapPin size={20} className="text-neutral-400" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">
                                Location
                            </p>
                            <p className="text-white text-sm font-medium">
                                Atlanta, GA
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
