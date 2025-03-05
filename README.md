# PromptStash

PromptStash is a modern web application for managing, organizing, and sharing AI prompts. Built with React, TypeScript, and Supabase, it helps users create, version, and organize their AI prompts in a collaborative environment.

## Features

- **Prompt Management**: Create, edit, and organize your AI prompts
- **Version History**: Track changes to your prompts with automatic versioning
- **Prompt Books**: Group related prompts into collections
- **Categories**: Organize prompts by categories
- **Sharing**: Share prompts and prompt books publicly with shareable links
- **Dark Mode**: Toggle between light and dark themes
- **Authentication**: Secure user accounts with Supabase authentication
- **Export/Import**: Backup and transfer your prompts easily
- **Variable Support**: Define and manage variables in your prompts
- **Progressive Web App**: Install as a standalone application

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, class-variance-authority
- **State Management**: Zustand
- **Backend & Auth**: Supabase (PostgreSQL, Auth)
- **Validation**: Zod
- **Icons**: Lucide React
- **Routing**: React Router
- **PWA Support**: Workbox, Vite PWA Plugin

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/promptstash.git
cd promptstash
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file at the root of the project with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
pnpm dev
```

## Development

- **Development server**: `pnpm dev`
- **Production build**: `pnpm build`
- **Lint check**: `pnpm lint`
- **Preview production build**: `pnpm preview`

## Database Schema

The application uses the following main tables in Supabase:

- **prompts**: Stores prompt content, metadata, and sharing status
- **prompt_versions**: Tracks the history of changes to prompts
- **categories**: Organizes prompts by user-defined categories
- **prompt_books**: Collections of related prompts
- **prompt_book_items**: Junction table for prompts in prompt books

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [React](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) for state management