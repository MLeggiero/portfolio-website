import Navbar from './components/Navbar';
import HeroInteractive from './components/HeroInteractive';
import ProjectGrid from './components/ProjectGrid';
import Timeline from './components/Timeline';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-background min-h-screen text-text selection:bg-primary selection:text-white">
      <Navbar />
      <HeroInteractive />
      <ProjectGrid />
      <Timeline />
      <Footer />
    </div>
  );
}

export default App;
