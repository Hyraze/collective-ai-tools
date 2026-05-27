# AI Workspace

This document describes the AI workspace feature that has been added to the Collective AI Tools platform.

**License:** MIT

## Overview

The platform now supports two types of tools:

1. **External Tools** - Curated AI tools from around the web (existing functionality)
2. **AI Workspace** - AI tools built directly into the platform

## Architecture

### Routing Structure

- `/` - Redirects to `/external-tools`
- `/external-tools` - Shows the existing curated tools from README.md
- `/built-in-tools` - Shows AI workspace tools

### Component Structure

```
components/
├── Navigation.tsx          # Main navigation with tabs
├── ExternalTools.tsx       # Wrapper for existing external tools
├── BuiltInTools.tsx        # AI workspace tools listing and routing
└── tools/
    └── TextSummarizer.tsx  # First AI workspace tool
```

### Key Features

- **Preserved Existing UI** - All existing external tools functionality remains unchanged
- **Clean Separation** - AI workspace tools are completely separate from external tools
- **Extensible Architecture** - Easy to add new AI workspace tools
- **Consistent Design** - Uses the same UI components and styling

## AI Workspace Tools

### Text Summarizer

A powerful text summarization tool that:

- Intelligently extracts key information from long texts
- Supports multiple output formats (bullet points, numbered list, paragraph)
- Configurable summary length
- Preserves important numbers, dates, and proper names
- Runs entirely in the browser (no external API calls)
- Includes copy and download functionality

#### Features:
- Word and character count
- Real-time processing with loading states
- Customizable options (length, style, preservation rules)
- Tips and guidance for better results
- Responsive design for all devices

## Adding New AI Workspace Tools

To add a new AI workspace tool:

1. Create a new component in `components/tools/`
2. Add the tool to the `builtInTools` array in `BuiltInTools.tsx`
3. Follow the existing pattern for consistency

Example:

```typescript
{
  id: 'new-tool',
  name: 'New Tool',
  description: 'Description of what the tool does',
  icon: <IconComponent className="h-6 w-6" />,
  component: NewToolComponent,
  tags: ['AI', 'Category'],
  isNew: true // Optional
}
```

## Technical Details

- Built with React 18 and TypeScript
- Uses React Router for navigation
- Maintains existing vanilla JS functionality for external tools
- Responsive design with Tailwind CSS
- Dark/light theme support
- PWA compatible

## Contributing

When contributing new AI workspace tools:

1. Follow the existing code patterns
2. Ensure mobile responsiveness
3. Include proper TypeScript types
4. Add appropriate error handling
5. Test with both light and dark themes
6. Consider accessibility requirements
