# 🤝 Contributing to CatChess

Thank you for your interest in contributing to CatChess! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**How to Submit a Good Bug Report:**

1. **Use a clear title** that describes the problem
2. **Describe the exact steps** to reproduce the issue
3. **Provide specific examples**
4. **Describe the behavior** you observed and what you expected
5. **Include screenshots** if applicable
6. **Specify your environment**: OS, browser, Node.js version

**Bug Report Template:**

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10, macOS 13]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js: [e.g., 18.17.0]
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

1. **Clear use case**: Why is this enhancement needed?
2. **Detailed description**: How should it work?
3. **Mockups/examples**: Visual aids if applicable
4. **Implementation ideas**: If you have technical suggestions

### Pull Requests

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test your changes**
5. **Commit with clear messages**
6. **Push to your fork**
7. **Open a Pull Request**

## Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

```bash
# Quick start
git clone <your-fork>
cd catchess
npm install
cd frontend && npm install
cd ../backend && npm install
npm run dev
```

## Coding Guidelines

### TypeScript/JavaScript

- Use TypeScript for new frontend code
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused (< 50 lines ideally)
- Avoid `any` types - use proper typing

**Good Example:**
```typescript
/**
 * Analyzes a chess move and returns a quality label
 * @param move - The move to analyze
 * @param evaluation - Current position evaluation
 * @returns Move quality label
 */
function labelMove(move: Move, evaluation: number): MoveLabel {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused on single responsibility
- Extract reusable logic into custom hooks
- Use proper TypeScript props typing

**Good Example:**
```tsx
interface MoveListProps {
  moves: MoveAnalysis[];
  onMoveClick: (index: number) => void;
}

export function MoveList({ moves, onMoveClick }: MoveListProps) {
  // Component implementation
}
```

### Styling

- Use Tailwind CSS utility classes
- Always provide dark mode variants
- Ensure responsive design (mobile-first)
- Follow existing design patterns

**Good Example:**
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors">
  Click Me
</button>
```

### State Management

- Use Zustand for global state
- Keep local state in components when possible
- Avoid prop drilling - use store for deeply nested data
- Document complex state interactions

### Git Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(board): add highlight for last move
fix(engine): correct evaluation calculation
docs(readme): update installation instructions
style(components): format code with prettier
refactor(store): simplify move history logic
```

## Testing

Before submitting a PR:

1. **Manual Testing**
   - Test all affected features
   - Check both light and dark modes
   - Verify responsive design
   - Test in multiple browsers

2. **Code Quality**
   - Run linter: `npm run lint`
   - Fix all warnings
   - Ensure TypeScript compiles without errors

3. **Build Test**
   ```bash
   cd frontend
   npm run build
   ```

## Pull Request Process

1. **Update documentation** if needed
2. **Add to CHANGELOG.md** (if applicable)
3. **Ensure all checks pass**
4. **Request review** from maintainers
5. **Address review feedback**

### PR Title Format

Use conventional commit format:

```
feat: Add move highlighting feature
fix: Correct evaluation bar display
docs: Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on multiple browsers
- [ ] I have checked responsive design
```

## Feature Requests

Want to implement a major feature? Please:

1. **Open an issue first** to discuss the feature
2. **Wait for approval** before starting work
3. **Keep PRs focused** - one feature per PR
4. **Document thoroughly**

### Priority Features

Looking for ideas? Check our roadmap:

- [ ] Opening book database integration
- [ ] Game puzzles and training mode
- [ ] ELO rating system
- [ ] Tournament support
- [ ] Advanced analysis (multiple engine lines)
- [ ] Game database and search
- [ ] Mobile app version
- [ ] Time controls (bullet, blitz, rapid)
- [ ] Premove support
- [ ] Board themes and piece sets
- [ ] Sound effects and animations
- [ ] User profiles and game history
- [ ] Chat system for online games
- [ ] Spectator mode
- [ ] Game export formats (GIF, video)

## Community

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Pull Requests**: Contribute code

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Appreciated by the community! 🎉

## Questions?

- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for development help
- Check [API.md](./API.md) for API documentation
- Open a discussion for questions
- Contact maintainers directly if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making CatChess better! ♟️
