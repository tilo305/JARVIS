# 🤝 Contributing to JARVIS

Thank you for your interest in contributing to JARVIS! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/jarvis.git
   cd jarvis/ironman-app
   ```

## 🛠️ Development Setup

### Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Start Development Server

```bash
# Development mode
pnpm run dev

# Or production build and serve
pnpm run serve
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run serve` | Build and serve locally |
| `pnpm run lint` | Run ESLint |
| `pnpm run start` | Start production server |

## 📝 Code Style

### JavaScript/React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for new components (optional)
- Prefer arrow functions for components
- Use descriptive variable and function names

### CSS/Styling

- Use TailwindCSS utility classes
- Follow BEM methodology for custom CSS
- Use CSS variables for theming
- Ensure responsive design

### File Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── [feature]/      # Feature-specific components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── lib/                # Utilities and configurations
└── assets/             # Static assets
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: add voice recognition to chatbot
fix: resolve video playback issue on mobile
docs: update README with new features
style: format code with prettier
refactor: simplify component structure
test: add unit tests for chatbot
chore: update dependencies
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run linting** and fix any issues
4. **Test locally** to ensure everything works
5. **Update CHANGELOG.md** if applicable

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Approval** from at least one maintainer

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Browser, OS, device information
- **Screenshots**: If applicable

### Issue Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., Desktop]

## Additional Information
[Any other context, screenshots, etc.]
```

## 💡 Feature Requests

### Feature Request Guidelines

- **Clear description** of the feature
- **Use case** and benefits
- **Implementation ideas** (optional)
- **Mockups/wireframes** (if applicable)

### Feature Request Template

```markdown
## Feature Description
[Clear description of the feature]

## Use Case
[How this feature would be used]

## Benefits
[Benefits of implementing this feature]

## Implementation Ideas
[Optional implementation suggestions]

## Mockups/Wireframes
[If applicable]
```

## 🏷️ Labels

We use the following labels for issues and PRs:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested
- `wontfix`: This will not be implemented

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check README.md and other docs

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **GitHub contributors** page
- **Release notes** for significant contributions

---

Thank you for contributing to JARVIS! 🚀 