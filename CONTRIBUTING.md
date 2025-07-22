# Contributing to GitShip 🔥

Thank you for your interest in contributing to GitShip! This document provides guidelines and instructions for contributing to our revolutionary open-source deployment platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- GitHub account
- Basic knowledge of React, TypeScript, and Node.js

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/gitship.git
   cd gitship
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your database URL and GitHub OAuth credentials
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 🎨 Design System

GitShip uses a consistent neon flame color palette:

### Color Guidelines
- **Primary Actions**: Use neon-cyan for links and primary buttons
- **Success States**: Use neon-green for success indicators
- **Warnings**: Use neon-orange for warnings and secondary actions
- **Errors**: Use neon-red for error states
- **Accents**: Use neon-purple for special highlights

### Component Standards
- Use shadcn/ui components as the foundation
- Maintain consistent spacing with Tailwind utilities
- Ensure all components are responsive
- Follow accessibility guidelines (ARIA labels, keyboard navigation)

## 🏗 Architecture

### Frontend Structure
```
client/src/
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── navbar.tsx    # Main navigation
│   ├── sidebar.tsx   # Project sidebar
│   └── *.tsx         # Feature components
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
└── assets/           # Static assets
```

### Backend Structure
```
server/
├── index.ts          # Server entry point
├── routes.ts         # API route definitions
├── db.ts             # Database connection
├── storage.ts        # Data access layer
├── replitAuth.ts     # Authentication middleware
└── github.ts         # GitHub API integration
```

### Database Schema
- Uses Drizzle ORM with PostgreSQL
- Schema defined in `shared/schema.ts`
- Migrations via `npm run db:push`

## 📝 Contribution Types

### 🐛 Bug Reports
When reporting bugs, please include:
- GitShip version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable

### ✨ Feature Requests
For new features, provide:
- Clear use case description
- Proposed implementation approach
- UI/UX mockups if relevant
- Impact on existing functionality

### 🔧 Code Contributions

#### Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow Coding Standards**
   - Use TypeScript throughout
   - Follow existing code formatting
   - Add proper error handling
   - Include JSDoc comments for functions

3. **Testing**
   - Test your changes thoroughly
   - Ensure existing functionality works
   - Test across different screen sizes

4. **Documentation**
   - Update README.md if needed
   - Add inline code comments
   - Document API changes

5. **Commit Guidelines**
   ```bash
   git commit -m "feat: add real-time build logs"
   git commit -m "fix: resolve authentication timeout"
   git commit -m "docs: update installation guide"
   ```

6. **Submit Pull Request**
   - Reference related issues
   - Provide clear description
   - Include screenshots for UI changes

#### Code Style Guidelines

**TypeScript**
```typescript
// Use proper typing
interface ProjectData {
  name: string;
  repositoryUrl: string;
  framework?: string;
}

// Use async/await over promises
async function createProject(data: ProjectData): Promise<Project> {
  try {
    const project = await storage.createProject(data);
    return project;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new Error("Project creation failed");
  }
}
```

**React Components**
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function Component({ title, onSubmit }: ComponentProps) {
  // Use proper hooks
  const [loading, setLoading] = useState(false);
  
  // Handle errors gracefully
  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-dark-800 border-dark-600">
      {/* Component content */}
    </Card>
  );
}
```

**CSS/Styling**
```css
/* Use flame color variables */
.primary-button {
  @apply bg-gradient-to-r from-neon-cyan to-neon-purple;
}

/* Maintain dark theme consistency */
.card {
  @apply bg-dark-800 border-dark-600 text-white;
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Authentication flow works correctly
- [ ] GitHub repository browsing functions
- [ ] Project creation and deployment simulation
- [ ] Real-time build logs stream properly
- [ ] UI is responsive across screen sizes
- [ ] Error handling displays appropriate messages

### Performance Considerations
- Optimize database queries
- Minimize API calls
- Use React Query caching effectively
- Implement proper loading states

## 🔒 Security Guidelines

### Authentication
- Never store passwords in plain text
- Use proper session management
- Implement CSRF protection
- Validate all user inputs

### GitHub Integration
- Store GitHub tokens securely (encrypted)
- Validate repository access permissions
- Implement proper webhook verification
- Handle API rate limiting

### Database
- Use parameterized queries (Drizzle ORM handles this)
- Implement proper access controls
- Sanitize user inputs
- Log security-relevant events

## 📚 Development Resources

### Key Dependencies
- **React**: Frontend framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS
- **shadcn/ui**: Component library
- **Drizzle ORM**: Database toolkit
- **TanStack Query**: Server state management
- **@octokit/rest**: GitHub API client

### Useful Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run db:push         # Push schema changes
npm run db:studio       # Open database studio

# Code Quality
npm run lint            # Lint code
npm run type-check      # TypeScript checking
npm run format          # Format code
```

## 🚀 Deployment

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key

# GitHub Integration
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_WEBHOOK_SECRET=webhook-secret

# Optional
NODE_ENV=production
PORT=5000
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] GitHub OAuth app configured
- [ ] SSL certificates enabled
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled

## 📞 Getting Help

### Communication Channels
- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Discord**: Community chat (link in README)
- **Email**: [email protected] for security issues

### Documentation
- **README.md**: Project overview and setup
- **API Documentation**: In-code documentation
- **Database Schema**: `shared/schema.ts`
- **Component Library**: shadcn/ui documentation

---

Thank you for contributing to GitShip! Together, we're building the future of web deployment. 🔥