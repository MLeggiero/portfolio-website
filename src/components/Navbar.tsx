import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Anchor links need different behavior depending on page
    const scrollLinks = [
        { name: 'Projects', href: '#projects' },
        { name: 'Experience', href: '#experience' },
        { name: 'Contact', href: '#contact' },
    ];

    const handleAnchorClick = (href: string) => {
        setIsOpen(false);
        if (isHome) {
            // On homepage, smooth scroll
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
            // On other pages, navigate to home then scroll
            window.location.href = '/' + href;
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-surface py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="text-2xl font-heading font-bold tracking-tighter hover:text-primary transition-colors">
                    MARK<span className="text-primary">.LEGGIERO</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {scrollLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleAnchorClick(link.href)}
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            {link.name}
                        </button>
                    ))}
                    <Link
                        to="/about"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        About
                    </Link>
                    <a href="/resume.pdf" download className="px-4 py-2 border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors uppercase tracking-wider">
                        Resume
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-text hover:text-primary">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-surface border-b border-surface/50"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            {scrollLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleAnchorClick(link.href)}
                                    className="text-lg font-medium hover:text-primary text-left"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <Link
                                to="/about"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium hover:text-primary"
                            >
                                About
                            </Link>
                            <a href="/resume.pdf" download onClick={() => setIsOpen(false)} className="text-primary font-bold uppercase tracking-wider">
                                Download Resume
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
