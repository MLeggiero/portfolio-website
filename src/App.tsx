import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import Timeline from './components/Timeline';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-background min-h-screen text-text selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      <ProjectGrid />
      <Timeline />
      <Footer />
    </div>
  );
}

export default App;
