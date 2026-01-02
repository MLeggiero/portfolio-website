import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-background py-16 border-t border-white/5">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-2xl font-heading font-bold mb-8">Ready to build something amazing?</h2>

                <div className="flex justify-center space-x-8 mb-12">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="p-4 rounded-full border border-white/10 hover:bg-primary hover:border-primary transition-all group">
                        <Github size={24} className="text-text-muted group-hover:text-white" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-4 rounded-full border border-white/10 hover:bg-primary hover:border-primary transition-all group">
                        <Linkedin size={24} className="text-text-muted group-hover:text-white" />
                    </a>
                    <a href="mailto:hello@example.com" className="p-4 rounded-full border border-white/10 hover:bg-primary hover:border-primary transition-all group">
                        <Mail size={24} className="text-text-muted group-hover:text-white" />
                    </a>
                </div>

                <p className="text-text-muted text-sm">
                    &copy; {new Date().getFullYear()} Alex Engineer. Built with React & Tailwind.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
