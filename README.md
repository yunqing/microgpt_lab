# 🧠 MicroGPT Lab

**An Interactive Learning Platform for Understanding GPT Architecture**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://yunqing.github.io/microgpt_lab/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Learn [MicroGPT](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) interactively through visualizations and hands-on exploration. This educational platform deconstructs Andrej Karpathy's MicroGPT implementation layer by layer, making complex transformer concepts accessible and engaging.

**Authors:** yunqing & claude

---

## 🌟 Features

### 📚 **10 Progressive Levels**
Master GPT architecture through a carefully designed curriculum:
- **Level 1:** Tokenization - Understanding character encoding
- **Level 2:** Autograd - Automatic differentiation basics
- **Level 3:** Embeddings - Token and position embeddings
- **Level 4:** RMS Normalization - Layer normalization technique
- **Level 5:** QKV Projections - Query, Key, Value transformations
- **Level 6:** Attention Mechanism - Self-attention visualization
- **Level 7:** MLP Blocks - Feed-forward networks
- **Level 8:** Loss Functions - Cross-entropy and training
- **Level 9:** Adam Optimizer - Adaptive learning rates
- **Level 10:** Inference - Text generation in action

### 🎨 **Interactive Visualizations**
Each level includes:
- **Real-time animations** showing data flow through the network
- **Interactive controls** to adjust parameters and see immediate effects
- **Visual diagrams** of tensor shapes and transformations
- **Token flow tracking** from input to output

### 📖 **Comprehensive Content**
- **Clear explanations** of each component
- **Code snippets** from the actual MicroGPT implementation
- **Insight challenges** to test your understanding
- **Badge system** to track your progress

### 📱 **Mobile-Friendly Design**
- Fully responsive layout for phones and tablets
- Tab-based interface for easy navigation on small screens
- Touch-optimized controls and smooth scrolling

### 🎯 **Gamified Learning**
- **Progress tracking** with 10 levels to complete
- **Badge collection** for completing insight challenges
- **Parameter counter** showing model complexity growth
- **Visual progress indicators** for motivation

---

## 🚀 Quick Start

### Try It Online
Visit **[https://yunqing.github.io/microgpt_lab/](https://yunqing.github.io/microgpt_lab/)** to start learning immediately - no installation required!

### Run Locally
```bash
# Clone the repository
git clone https://github.com/yunqing/microgpt_lab.git
cd microgpt_lab

# Install dependencies
npm install

# Start the development server
npm start

# Open http://localhost:3000 in your browser
```

---

## 📸 Screenshots

<!-- TODO: Add screenshots here -->
<!-- Desktop view: Full split-screen layout -->
<!-- Mobile view: Tab-based interface -->
<!-- Visualization examples: Attention, embeddings, etc. -->

---

## 🎓 How to Use

1. **Start at Level 1** - The curriculum is designed to build knowledge progressively
2. **Read the explanations** - Understand the concept before exploring the visualization
3. **Interact with visualizations** - Adjust parameters, click elements, observe changes
4. **Review the code** - See how concepts map to actual implementation
5. **Complete insight challenges** - Test your understanding and earn badges
6. **Mark level complete** - Move to the next level when ready

### Navigation
- **Desktop:** Use the sidebar to jump between levels
- **Mobile:** Tap the menu icon (☰) to access the level selector
- **Mobile:** Switch between "Content" and "Visualization" tabs

---

## 🧩 What You'll Learn

### Core Transformer Concepts
- How text is converted to numbers (tokenization)
- How gradients flow backward (autograd)
- How tokens gain meaning (embeddings)
- How attention works (QKV mechanism)
- How models generate text (sampling strategies)

### Implementation Details
- Tensor shapes and transformations
- Multi-head attention architecture
- Layer normalization techniques
- Training loop components
- Optimization algorithms

### Practical Understanding
- Why certain design choices are made
- How parameters contribute to model size
- Trade-offs in architecture decisions
- Connection between math and code

---

## 🔗 Related Resources

- **[MicroGPT Source Code](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)** - Original implementation by Andrej Karpathy
- **[Attention Is All You Need](https://arxiv.org/abs/1706.03762)** - The original Transformer paper
- **[The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)** - Visual guide by Jay Alammar
- **[Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)** - Video course by Andrej Karpathy

---

## 🤝 Contributing

Contributions are welcome! Whether it's:
- 🐛 Bug fixes
- ✨ New visualizations
- 📝 Documentation improvements
- 🌍 Translations
- 💡 Feature suggestions

Please feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Andrej Karpathy** - For creating [MicroGPT](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95), the foundation of this learning platform
- **The open-source community** - For the amazing tools and libraries that made this possible

---

## 💬 Feedback

Found this helpful? Have suggestions?
- ⭐ Star this repository
- 🐦 Share it with others
- 📧 Open an issue with your feedback

---

<div align="center">

**[🚀 Start Learning Now](https://yunqing.github.io/microgpt_lab/)**

Made with ❤️ by yunqing & claude

</div>

---

## 🛠️ For Developers

<details>
<summary>Click to expand developer documentation</summary>

### Tech Stack
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Syntax Highlighter** - Code display
- **Lucide React** - Icons

### Project Structure
```
microgpt_lab/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── LevelNav.jsx
│   │   ├── ContentPanel.jsx
│   │   ├── VisualizationPanel.jsx
│   │   ├── CodePanel.jsx
│   │   └── ...
│   ├── visualizations/  # Level-specific visualizations
│   │   ├── TokenizerViz.jsx
│   │   ├── AttentionViz.jsx
│   │   └── ...
│   ├── data/           # Curriculum content
│   │   └── curriculum.js
│   └── App.js          # Main app component
└── package.json
```

### Available Scripts

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
- Hot reload enabled
- Lint errors shown in console

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run build`
Builds the app for production to the `build` folder.
- Optimized and minified
- Ready for deployment

#### `npm run deploy`
Deploys the app to GitHub Pages.
- Automatically builds before deploying
- Updates the `gh-pages` branch

### Development Guidelines

#### Adding a New Level
1. Create a visualization component in `src/visualizations/`
2. Add level data to `src/data/curriculum.js`
3. Register the visualization in `src/components/VisualizationPanel.jsx`

#### Styling Conventions
- Use Tailwind utility classes
- Follow the slate/cyan/indigo color scheme
- Responsive: mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- Dark theme throughout

#### Component Patterns
- Use functional components with hooks
- Leverage Framer Motion for animations
- Keep components small and focused
- Use `motion.div` for animated elements

### Deployment

The site is automatically deployed to GitHub Pages via:
```bash
npm run deploy
```

This will:
1. Build the production bundle
2. Push to the `gh-pages` branch
3. GitHub Pages serves from that branch

### Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

### Performance Optimization
- Code splitting by route
- Lazy loading of visualizations
- Optimized bundle size (~285KB gzipped)
- CSS purging in production

### Troubleshooting

**Issue:** Build fails with memory error
- Solution: Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

**Issue:** GitHub Pages shows 404
- Solution: Ensure `homepage` in `package.json` matches your repo URL

**Issue:** Mobile scrolling not working
- Solution: Check for `overflow: hidden` on parent containers

</details>
