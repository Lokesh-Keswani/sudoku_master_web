# Sudoku Master Training Module

A modern, responsive Training Dashboard built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, and Zustand.

## 🚀 Features

- **6 Training Modules**: Techniques Trainer, Pattern Recognition, Speed Scanning, Mental Mapping, AI Coach, and Challenge Mode
- **Glassmorphism UI**: Beautiful glass-like cards with hover animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Progress Tracking**: Persistent training progress with Zustand
- **Smooth Animations**: Framer Motion powered entrance and hover effects
- **TypeScript**: Full type safety throughout the application

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── training.tsx          # Main training page
│   ├── components/
│   │   └── TrainingCard.tsx      # Reusable card component
│   ├── stores/
│   │   └── trainingStore.ts      # Zustand state management
│   └── styles/
│       └── globals.css           # Global styles and Tailwind
├── package.json                  # Dependencies and scripts
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎨 Design Features

### Glassmorphism Cards
- Semi-transparent backgrounds with backdrop blur
- Subtle borders and shadows
- Hover effects with scale and color transitions

### Animations
- Staggered card entrance animations
- Icon rotation on hover
- Smooth page transitions
- Loading states and micro-interactions

### Responsive Grid
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

## 🔧 Customization

### Adding New Training Modules
1. Add module data to the `trainingModules` array in `training.tsx`
2. Update the Zustand store in `trainingStore.ts`
3. Create corresponding training pages at `/training/[moduleId]`

### Styling
- Modify `tailwind.config.js` for custom colors and animations
- Update `globals.css` for component styles
- Use the provided utility classes for consistent styling

### State Management
- All training progress is persisted in localStorage
- Use the Zustand store for global state management
- Add new actions and state as needed

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Training Modules

### 1. Techniques Trainer
- **Focus**: Advanced solving techniques
- **Skills**: X-Wing, Swordfish, XY-Chains
- **Target**: Pattern Recognition & Logic

### 2. Pattern Recognition
- **Focus**: Visual pattern spotting
- **Skills**: Number relationships, common patterns
- **Target**: Visual Processing & Memory

### 3. Speed Scanning
- **Focus**: Quick number placement
- **Skills**: Rapid decision making
- **Target**: Speed & Accuracy

### 4. Mental Mapping
- **Focus**: Spatial awareness
- **Skills**: Grid visualization
- **Target**: Spatial Intelligence

### 5. AI Coach Suggestions
- **Focus**: Personalized guidance
- **Skills**: Strategic thinking
- **Target**: Strategic Thinking

### 6. Challenge Mode
- **Focus**: Progressive difficulty
- **Skills**: Endurance and problem solving
- **Target**: Endurance & Problem Solving

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 