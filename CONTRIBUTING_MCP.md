# Contributing to MCP Catalog

Thank you for your interest in contributing to the MCP Catalog! This guide will help you understand how to add new MCP servers, improve existing entries, and contribute to the overall project.

## 🚀 Quick Start

### Adding a New MCP Server

1. **Fork the repository** and create a new branch
2. **Add server data** to `/lib/mcpData.ts`
3. **Test your changes** locally
4. **Submit a pull request** with a clear description

### Reporting Issues

- Use the [Add MCP Server template](.github/ISSUE_TEMPLATE/add-mcp-server.md) for new servers
- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) for issues
- Use [Discussions](https://github.com/Hyraze/collective-ai-tools/discussions) for questions

## 📝 Adding MCP Servers

### Data Structure

Each MCP server follows this structure in `/lib/mcpData.ts`:

```typescript
{
  id: 'unique-server-id',                    // URL-friendly identifier
  name: 'Server Name',                       // Display name
  description: 'Brief description',          // Short description
  longDescription: 'Detailed description',   // Optional detailed description
  author: 'Author Name',                     // Author or organization
  githubUrl: 'https://github.com/...',      // GitHub repository URL
  language: 'TypeScript',                    // Primary programming language
  type: 'MCP Server',                        // 'MCP Server' or 'MCP Client'
  category: 'Developer tools',               // Category from predefined list
  tags: ['tag1', 'tag2'],                   // Array of relevant tags
  rating: 5.0,                              // Rating (1.0 - 5.0)
  downloads: 1000,                          // Download count (not displayed)
  stars: 500,                               // GitHub stars
  isOfficial: false,                        // Is officially maintained
  isCertified: false,                       // Has been verified/tested
  location: 'Remote',                       // 'Local' or 'Remote'
  addedDate: '2024-01-01',                 // ISO date string
  lastUpdated: '2024-01-01',               // ISO date string
  features: ['Feature 1', 'Feature 2'],    // Array of key features
  requirements: ['Node.js 18+'],           // Optional system requirements
  documentation: 'https://docs.example.com', // Optional documentation URL
  license: 'MIT'                            // License type
}
```

### Categories

Choose from these predefined categories:

- Developer tools
- Artificial intelligence chatbots
- Research and data
- Knowledge management and memory
- Database
- Education and learning tools
- Finance
- Search tools
- Security
- Version control
- Cloud platform
- Image and video processing
- Monitoring
- Communication tools
- Operating system automation
- Entertainment and media
- Games and gamification
- Note-taking tools
- Schedule management
- Marketing
- Location services
- Home automation and IoT
- Browser automation
- File system
- E-commerce and retail
- Customer support
- Social media
- Voice processing
- Health and wellness
- Customer data platform
- Travel and transportation
- Virtualization
- Cloud storage
- Law and compliance
- Art and culture
- Other
- Language translation

### Quality Guidelines

#### Server Requirements

- ✅ **Active Repository**: Must be actively maintained (recent commits)
- ✅ **Clear Documentation**: Should have README and/or documentation
- ✅ **MCP Compliance**: Must implement Model Context Protocol
- ✅ **Open Source**: Should be open source (preferred)
- ✅ **Working Example**: Should have working examples or demos

#### Data Quality

- ✅ **Accurate Information**: All data must be accurate and up-to-date
- ✅ **Complete Information**: Fill in all available fields
- ✅ **Proper Categorization**: Choose the most appropriate category
- ✅ **Relevant Tags**: Use meaningful, relevant tags
- ✅ **Valid URLs**: Ensure all URLs are working and accessible

#### Content Guidelines

- ✅ **Descriptive Names**: Use clear, descriptive server names
- ✅ **Helpful Descriptions**: Write descriptions that help users understand the purpose
- ✅ **Feature Lists**: Include key features that differentiate the server
- ✅ **Requirements**: List any system or dependency requirements
- ✅ **Proper Attribution**: Give proper credit to authors and maintainers

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm (preferred) or npm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hyraze/collective-ai-tools.git
   cd collective-ai-tools
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173/mcp-catalog
   ```

### Testing Changes

1. **Add your server data** to `/lib/mcpData.ts`
2. **Test the catalog page** - verify your server appears
3. **Test the detail page** - click on your server to verify details
4. **Test search and filters** - ensure your server is discoverable
5. **Check mobile responsiveness** - test on different screen sizes

## 📋 Pull Request Process

### Before Submitting

- [ ] Test your changes locally
- [ ] Ensure all information is accurate
- [ ] Check for typos and formatting issues
- [ ] Verify all URLs are working
- [ ] Follow the existing code style

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] New MCP server addition
- [ ] Bug fix
- [ ] Documentation update
- [ ] UI/UX improvement
- [ ] Other (please describe)

## Server Information (if applicable)
- **Name**: Server Name
- **Category**: Category
- **Language**: Programming Language
- **Type**: MCP Server/Client

## Testing
- [ ] Tested locally
- [ ] Verified server information is accurate
- [ ] Checked all links work
- [ ] Tested search and filtering

## Screenshots (if applicable)
Add screenshots of your changes

## Additional Notes
Any additional information or context
```

## 🎯 Contribution Ideas

### High Priority

- **Add Popular MCP Servers**: Help us include the most popular and useful MCP servers
- **Improve Documentation**: Enhance server descriptions and add more detailed information
- **Add Screenshots**: Include screenshots or demos for better visual representation
- **Fix Broken Links**: Help maintain the quality by fixing any broken URLs

### Medium Priority

- **UI/UX Improvements**: Enhance the user interface and user experience
- **Mobile Optimization**: Improve mobile responsiveness
- **Search Enhancement**: Improve search functionality and filtering
- **Performance Optimization**: Optimize loading times and performance

### Low Priority

- **Internationalization**: Add support for multiple languages
- **Advanced Features**: Add features like favorites, collections, or reviews
- **Analytics**: Add usage analytics and insights
- **API Integration**: Integrate with GitHub API for real-time data

## 🏆 Recognition

Contributors are recognized in several ways:

- **GitHub Contributors**: Listed in the repository contributors
- **Release Notes**: Mentioned in release notes for significant contributions
- **Documentation**: Credited in relevant documentation
- **Community**: Recognized in community discussions

## 📞 Getting Help

### Resources

- **Documentation**: Check the [README](README.md) and [MCP Catalog README](MCP_CATALOG_README.md)
- **Issues**: Search existing [issues](https://github.com/Hyraze/collective-ai-tools/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/Hyraze/collective-ai-tools/discussions)
- **Code of Conduct**: Read our [Code of Conduct](CODE_OF_CONDUCT.md)

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private or sensitive matters

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Thank You

Thank you for contributing to the MCP Catalog! Your contributions help make the Model Context Protocol ecosystem more discoverable and accessible to developers worldwide.

---

**Happy Contributing! 🚀**

