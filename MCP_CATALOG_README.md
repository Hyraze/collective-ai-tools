# MCP Catalog - Model Context Protocol Server Directory

## Overview

The MCP Catalog is a comprehensive directory of Model Context Protocol (MCP) servers and clients, similar to the popular [mcp.aibase.com](https://mcp.aibase.com/explore). It provides a centralized platform for discovering, exploring, and learning about MCP implementations.

## Features

### 🔍 Advanced Search & Filtering
- **Real-time Search**: Search by server name, description, or tags
- **Category Filtering**: Filter by 37+ categories including Developer tools, Database, Security, etc.
- **Language Filtering**: Filter by programming language (TypeScript, Python, Go, Rust, etc.)
- **Type Filtering**: Filter by MCP Server or MCP Client
- **Location Filtering**: Filter by Local or Remote deployment
- **Authentication Status**: Filter by Official Certification or Unofficial Certification

### 📊 Rich Server Information
- **Ratings & Downloads**: Display server popularity metrics
- **GitHub Stars**: Show community engagement
- **Official/Certified Badges**: Highlight verified and official servers
- **Detailed Descriptions**: Comprehensive server information
- **Feature Lists**: Key capabilities and features
- **Requirements**: System and dependency requirements
- **Documentation Links**: Direct links to official documentation

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Card-based Layout**: Clean, modern server cards
- **Hover Effects**: Interactive visual feedback
- **Loading States**: Smooth loading experiences

### 🔗 Navigation & Routing
- **Server Detail Pages**: Dedicated pages for each MCP server
- **Breadcrumb Navigation**: Easy navigation back to catalog
- **Deep Linking**: Direct links to specific servers
- **SEO Optimized**: Search engine friendly URLs and metadata

## MCP Servers Included

The catalog includes 13+ high-quality MCP servers across various categories:

### Developer Tools
- **CoreOpenSumi**: AI-native IDE framework
- **Genkit**: Google's AI application framework
- **MCP Go**: Go-based MCP framework
- **Repomix**: AI-friendly code packaging
- **MCP Golang**: Type-safe Go MCP implementation
- **Unreal MCP**: Unreal Engine integration

### Knowledge Management
- **MCP Notion Server**: Notion API integration
- **MCP Atlassian**: Confluence and Jira integration

### Database & Storage
- **Genai Toolbox**: Enterprise database MCP server
- **Supabase MCP Server**: Supabase integration

### Security & Automation
- **MCP Scan**: Security vulnerability scanning
- **Playwright Browser Automation**: Web automation for LLMs
- **Exa Web Search**: AI-optimized web search

## Technical Implementation

### Architecture
- **React + TypeScript**: Modern frontend framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Consistent iconography

### Data Structure
```typescript
interface MCPServer {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  author: string;
  githubUrl: string;
  language: string;
  type: 'MCP Server' | 'MCP Client';
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  stars: number;
  isOfficial: boolean;
  isCertified: boolean;
  location: 'Local' | 'Remote';
  addedDate: string;
  lastUpdated: string;
  features: string[];
  requirements?: string[];
  documentation?: string;
  license?: string;
}
```

### Components
- **MCPCatalog**: Main catalog listing with search and filters
- **MCPServerDetail**: Individual server detail page
- **Navigation**: Integrated navigation menu
- **SEO**: Search engine optimization

## Usage

### Accessing the Catalog
1. Navigate to `/mcp-catalog` in the application
2. Use the search bar to find specific servers
3. Apply filters to narrow down results
4. Click on server cards to view detailed information

### Filtering Options
- **Search**: Type keywords to search across names, descriptions, and tags
- **Categories**: Select from 37+ predefined categories
- **Languages**: Filter by programming language
- **Type**: Choose between MCP Server or MCP Client
- **Location**: Filter by deployment location
- **Authentication**: Show only official or certified servers

### Sorting Options
- **By Rating**: Sort by user ratings (highest first)
- **By Downloads**: Sort by download count (most popular first)
- **By Time**: Sort by addition date (newest first)

## Adding New MCP Servers

To add new MCP servers to the catalog:

1. **Update Data**: Add server information to `/lib/mcpData.ts`
2. **Follow Schema**: Ensure all required fields are provided
3. **Add Categories**: Include appropriate category and tags
4. **Test**: Verify the server appears correctly in the catalog

### Example Server Entry
```typescript
{
  id: 'example-server',
  name: 'Example MCP Server',
  description: 'Brief description of the server',
  longDescription: 'Detailed description with features and capabilities',
  author: 'Author Name',
  githubUrl: 'https://github.com/author/example-server',
  language: 'TypeScript',
  type: 'MCP Server',
  category: 'Developer tools',
  tags: ['example', 'typescript', 'mcp'],
  rating: 4.5,
  downloads: 1000,
  stars: 500,
  isOfficial: false,
  isCertified: false,
  location: 'Remote',
  addedDate: '2024-01-01',
  lastUpdated: '2024-01-01',
  features: ['Feature 1', 'Feature 2'],
  requirements: ['Node.js 18+'],
  documentation: 'https://example.com/docs',
  license: 'MIT'
}
```

## SEO & Performance

### Search Engine Optimization
- **Structured Data**: JSON-LD markup for search engines
- **Meta Tags**: Comprehensive meta descriptions and keywords
- **Breadcrumbs**: Navigation breadcrumbs for better UX
- **Sitemap**: Automatic sitemap generation

### Performance Features
- **Lazy Loading**: Components load as needed
- **Optimized Images**: Efficient image handling
- **Caching**: Browser caching for static assets
- **Responsive Images**: Adaptive image sizing

## Testing

The MCP Catalog includes comprehensive test coverage:

- **Unit Tests**: Component functionality testing
- **Integration Tests**: User interaction testing
- **Accessibility Tests**: WCAG compliance testing
- **Performance Tests**: Load time optimization

Run tests with:
```bash
npm test
```

## Contributing

We welcome contributions to improve the MCP Catalog:

1. **Fork the Repository**: Create your own fork
2. **Add Servers**: Contribute new MCP servers
3. **Improve UI**: Enhance the user interface
4. **Fix Bugs**: Report and fix issues
5. **Update Documentation**: Improve documentation

## Future Enhancements

Planned features for future releases:

- **User Reviews**: Allow users to rate and review servers
- **Installation Guides**: Step-by-step installation instructions
- **API Integration**: Real-time data from GitHub APIs
- **Community Features**: User favorites and collections
- **Advanced Analytics**: Usage statistics and trends
- **Server Health**: Real-time server status monitoring

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [mcp.aibase.com](https://mcp.aibase.com/explore)
- Built with modern web technologies
- Community-driven server contributions
- Open source MCP ecosystem

---

**MCP Catalog** - Discover, explore, and integrate Model Context Protocol servers for enhanced AI workflows.

