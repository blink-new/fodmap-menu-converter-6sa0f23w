# FODMAP Menu Converter - Design Document

## Overview
A web application that helps people with IBS and digestive sensitivities by analyzing restaurant menu images and providing personalized FODMAP information for each dish.

## Target Users
- People following low-FODMAP diets
- Individuals with IBS, Crohn's disease, or other digestive conditions
- Caregivers and family members supporting dietary restrictions

## Design Philosophy
**Medical-grade trust meets consumer-friendly design**
- Clean, professional interface that builds confidence
- Health-focused color palette (blues, greens, soft warnings)
- Apple-inspired minimalism with clear information hierarchy
- Accessibility-first approach for users with varying needs

## Core Features

### 1. Image Upload Interface
- Drag-and-drop or click-to-upload functionality
- Support for mobile camera capture
- Image preview and validation
- Clean, welcoming upload zone

### 2. AI-Powered Menu Analysis
- OCR for menu text extraction
- AI identification of food items and ingredients
- FODMAP level assessment (Low/Moderate/High)
- Ingredient concern identification

### 3. Results Display
- Split-screen view: original menu + analysis
- Color-coded FODMAP levels with clear iconography
- Detailed ingredient concerns and alternatives
- Actionable recommendations for modifications

### 4. User Experience Enhancements
- Smooth animations and transitions
- Progressive loading states
- Mobile-responsive design
- Accessibility features (high contrast, screen reader support)

## Technical Architecture

### Frontend
- **React + TypeScript** for type safety and component structure
- **Tailwind CSS** for consistent, utility-first styling
- **ShadCN/UI** for polished, accessible components
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography

### Backend (Future Phase)
- **Supabase** for user accounts and data persistence
- **OpenAI Vision API** for menu image analysis
- **Custom FODMAP database** for ingredient assessments
- **Edge Functions** for secure AI processing

## Visual Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Trust and medical authority
- **Success**: Green (#059669) - Safe/low FODMAP foods
- **Warning**: Amber (#d97706) - Moderate FODMAP caution
- **Danger**: Red (#dc2626) - High FODMAP alerts
- **Neutral**: Gray (#6b7280) - Supporting text and backgrounds

### Typography
- Clean, readable sans-serif font stack
- Clear hierarchy: Headlines (2xl), Subheads (lg), Body (base)
- Adequate line spacing for readability
- High contrast ratios for accessibility

### Components
- Rounded corners (0.5rem) for friendly feel
- Subtle shadows for depth without distraction
- Consistent spacing scale (4px grid system)
- Hover states for interactive elements

## User Journey

1. **Landing** - User sees upload interface with clear value proposition
2. **Upload** - Simple drag-drop or file selection with preview
3. **Processing** - Engaging progress indicator with clear stages
4. **Results** - Side-by-side comparison with actionable insights
5. **Action** - Easy options to save, share, or analyze another menu

## Success Metrics
- Time from upload to actionable results < 30 seconds
- User comprehension of FODMAP levels > 90%
- Mobile usability rating > 4.5/5
- Accessibility compliance (WCAG 2.1 AA)

## Future Enhancements
- User accounts for history and preferences
- Restaurant integration and real-time menus
- Personalized recommendations based on tolerance levels
- Community features for sharing safe restaurant options
- Nutritionist consultation integration