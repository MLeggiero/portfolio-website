# Portfolio Website

A modern, responsive portfolio website showcasing projects and experience in robotics, firmware, and software engineering.

**Live Website:** [https://MLeggiero.github.io/portfolio-website](https://MLeggiero.github.io/portfolio-website)

## Tech Stack

- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **GitHub Pages** - Deployment platform

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx       # Navigation bar
│   ├── Hero.tsx         # Hero section
│   ├── ProjectGrid.tsx  # Projects grid display
│   ├── ProjectCard.tsx  # Individual project cards
│   ├── Timeline.tsx     # Experience timeline
│   └── Footer.tsx       # Footer with social links
├── projects.json        # Project data
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Features

- Responsive design that works on all devices
- Smooth animations and transitions using Framer Motion
- Project showcase with categories and external links
- Experience timeline
- Social media integration
- Fast loading times with Vite optimization

## Third-party assets

The hero arm's meshes are the Universal Robots UR5e visual meshes from
[MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie)
(`universal_robots_ur5e`), originally from the ROS-Industrial Consortium and
distributed under BSD-3-Clause — see `public/models/UR5E_LICENSE.txt`. They are
decimated and packed into a single meshopt-compressed GLB
(`public/models/ur5e.glb`, 187 KB). The kinematic chain, joint limits and axes
in `src/data/ur5eKinematics.ts` are transcribed from the same package's MJCF.
