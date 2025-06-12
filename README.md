# Tabby AI DebateScore

A modern, AI-powered debate tournament management system built with React, TypeScript, and Supabase.

## 🌟 Features

- **Tournament Management**
  - Create and manage debate tournaments
  - Support for British Parliamentary (BP) format
  - Real-time tournament status tracking
  - Public access control for tournaments

- **Team Management**
  - Add and manage debate teams
  - Bulk team import via CSV
  - Team performance analytics
  - Speaker tracking

- **Judge Management**
  - Add and manage judges
  - Judge experience level tracking
  - Judge assignment system
  - Performance analytics

- **Round Management**
  - Create and manage debate rounds
  - Motion management
  - Round status tracking
  - Automated draw generation

- **Draw Generation**
  - Automated BP draw generation
  - Draw history tracking
  - Manual draw adjustments
  - Room management

- **Analytics Dashboard**
  - Tournament statistics
  - Team performance metrics
  - Judge performance tracking
  - Real-time updates

## 🚀 Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Shadcn UI Components
  - React Router DOM
  - React Query
  - React Hook Form
  - Zod Validation

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)
  - Real-time subscriptions

- **Development Tools**
  - ESLint
  - TypeScript
  - Tailwind CSS
  - PostCSS
  - SWC

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tabby-ai-debatescore.git
   cd tabby-ai-debatescore
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

## 📦 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn build:dev` - Build for development
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build

## 🔒 Security Features

- Row Level Security (RLS) policies
- Authentication and authorization
- Protected API routes
- Secure data access patterns

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vite](https://vitejs.dev/) for the build tooling
- [Tailwind CSS](https://tailwindcss.com/) for the styling
