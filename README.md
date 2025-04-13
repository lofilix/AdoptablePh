# AdoptablePH

A Next.js application designed to facilitate pet adoption in the Philippines, connecting shelters with potential adopters.

## Features

- User authentication and authorization
- Shelter management system
- Pet listing and search functionality
- Donation system
- Impact tracking
- Mobile-responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase (Authentication & Database)
- React Hook Form
- Zod Validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AdoptablePh.git
cd AdoptablePh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # Reusable React components
│   ├── ui/            # Shadcn UI components
│   ├── home/          # Home page components
│   ├── admin/         # Admin dashboard components
│   └── shelter/       # Shelter-related components
├── lib/               # Utility functions and configurations
├── types/            # TypeScript type definitions
└── styles/           # Global styles and Tailwind CSS config
```

## Development Guidelines

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Implement proper error boundaries
4. Add appropriate loading states
5. Ensure mobile responsiveness
6. Write meaningful commit messages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 