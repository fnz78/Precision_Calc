# Precision Calc

A professional-grade, responsive scientific calculator web application built with React, TypeScript, and Tailwind CSS. Designed with a "hardware specialist tool" aesthetic, it features advanced mathematical functions, history tracking, memory operations, and a polished user experience.

![Precision Calc Preview](https://picsum.photos/seed/calculator/800/400)

## Features

### Core Functionality
- **Standard & Scientific Modes**: Toggle between basic arithmetic and advanced functions (trigonometry, logarithms, powers, roots, constants).
- **Smart Display**: Auto-scrolling display for long numbers with comma formatting and a secondary line for the current equation.
- **History Tape**: Tracks your last 50 calculations with timestamps. Click any history item to recall the result.
- **Memory Functions**: Full support for standard memory operations (`MC`, `MR`, `M+`, `M-`).

### User Experience
- **Theme Engine**: Toggle between Light and Dark modes with persistent user preference.
- **Sound Feedback**: Optional, satisfying "click" sound for tactile feedback (toggleable).
- **Keyboard Support**: Full keyboard navigation for rapid input.
- **Responsive Design**: Adapts seamlessly to mobile, tablet, and desktop screens.
- **Animations**: Smooth transitions and interactions powered by `motion/react`.
- **Clipboard Integration**: One-click copy to clipboard functionality.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/precision-calc.git
   cd precision-calc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.

## Usage

### Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0-9` | Enter numbers |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Basic operators |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit |
| `Escape` | Clear all (AC) |

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
