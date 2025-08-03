# Vite Library Template

A template repository for modern library development using Vite and TypeScript.

## About this template

This template provides a complete setup for developing libraries using the following tech stack:

- ⚡ **Vite**: Fast build and hot reload
- 📘 **TypeScript**: Type-safe code development
- 🧪 **Vitest**: Fast test execution
- 📋 **ESLint**: Maintain code quality
- 🎨 **Prettier**: Consistent code formatting
- 📦 **Multiple formats**: Supports ESM, CommonJS, and UMD
- 🔧 **VS Code settings**: Optimized development environment

## How to use this template

### 1. Create a repository

Create a repository using this template:

1. Click the "Use this template" button on GitHub
2. Enter a new repository name
3. Create the repository

Or use the CLI:

```bash
# Using GitHub CLI
gh repo create my-awesome-library --template username/vite-library-template

# Clone manually
git clone https://github.com/username/vite-library-template.git my-awesome-library
cd my-awesome-library
```

### 2. Initial setup

```bash
# Install dependencies
npm install

# Update package information
npm init
```

### 3. Customize

Edit the following files to customize for your library:

#### `package.json`
```json
{
  "name": "your-library-name",
  "version": "1.0.0",
  "description": "Description of your library",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/your-library-name.git"
  },
  "keywords": ["keyword1", "keyword2"]
}
```

#### `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [
    dts({
      include: ['lib/**/*'],
      // ...
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'YourLibraryName', // Update global name
      fileName: (format) => `your-library-name.${format}.js` // Update file name
    }
  }
})
```

#### `lib/index.ts`
This file is the main entry point of your library. Export your features from here.

### 4. Start development

```bash
# Start in development mode
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build the library
npm run build
```

## Directory structure

```
your-library/
├── lib/                    # Source code
│   ├── __tests__/          # Unit test code
│   └── index.ts            # Main entry point
├── dist/                   # Build output (auto-generated)
├── .vscode/                # VS Code settings
├── vite.config.ts          # Vite config
├── vitest.config.ts        # Vitest config
├── tsconfig.json           # TypeScript config
├── .eslintrc.js            # ESLint config
├── .prettierrc             # Prettier config
├── package.json            # Package config
└── README.md               # Documentation
```

## Available scripts

```bash
# Build the library
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Generate HTML documentation
npm run docs

# Generate Markdown documentation
npm run docs:markdown

# Check locally
npm run docs:serve
```

## Development workflow

1. **Feature development**: Implement features in the `lib/` directory
2. **Create tests**: Create corresponding test files
3. **Type definitions**: Update `lib/types.ts` as needed
4. **Build check**: Ensure no build errors with `npm run build`
5. **Run tests**: Ensure all tests pass with `npm run test`

## Publishing the library

### 1. Prepare the package

```bash
# Build the library
npm run build

# Run tests
npm run test

# Run lint
npm run lint
```

### 2. Version management

```bash
# Bump patch version
npm version patch

# Bump minor version
npm version minor

# Bump major version
npm version major
```

### 3. Publish

```bash
# Publish to npm
npm publish

# For scoped packages
npm publish --access public
```

## Customization examples

### For React libraries

Add `peerDependencies` to `package.json`:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### For Vue libraries

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), dts()],
  // ...
})
```

### For Node.js libraries

Update `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Update README.md

Once your library is complete, replace this README.md with the actual documentation for your library.
