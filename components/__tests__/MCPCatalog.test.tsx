/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MCPCatalog from '../MCPCatalog';
import { mcpServers } from '../../lib/mcpData';

// Mock the SEO component
jest.mock('../SEO', () => {
  return function MockSEO() {
    return <div data-testid="seo">SEO Component</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MCPCatalog', () => {
  it('renders the MCP catalog with header', () => {
    renderWithRouter(<MCPCatalog />);
    
    expect(screen.getByText('Discover Top MCP Servers')).toBeInTheDocument();
    expect(screen.getByText('Improve Your AI Workflows - One-Stop MCP Server & Client Integration')).toBeInTheDocument();
  });

  it('displays the correct number of servers', () => {
    renderWithRouter(<MCPCatalog />);
    
    const serverCount = mcpServers.length.toLocaleString();
    expect(screen.getByText(`${serverCount} Services Listed`)).toBeInTheDocument();
  });

  it('renders all MCP servers', () => {
    renderWithRouter(<MCPCatalog />);
    
    mcpServers.forEach(server => {
      expect(screen.getByText(server.name)).toBeInTheDocument();
      expect(screen.getByText(server.description)).toBeInTheDocument();
    });
  });

  it('filters servers by search term', () => {
    renderWithRouter(<MCPCatalog />);
    
    const searchInput = screen.getByPlaceholderText('Search MCP servers...');
    fireEvent.change(searchInput, { target: { value: 'Genkit' } });
    
    expect(screen.getByText('Genkit')).toBeInTheDocument();
    expect(screen.queryByText('CoreOpenSumi')).not.toBeInTheDocument();
  });

  it('filters servers by category', () => {
    renderWithRouter(<MCPCatalog />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Developer tools' } });
    
    // Should show servers in Developer tools category
    expect(screen.getByText('CoreOpenSumi')).toBeInTheDocument();
    expect(screen.getByText('Genkit')).toBeInTheDocument();
  });

  it('filters servers by language', () => {
    renderWithRouter(<MCPCatalog />);
    
    const languageSelect = screen.getByDisplayValue('All Languages');
    fireEvent.change(languageSelect, { target: { value: 'TypeScript' } });
    
    // Should show TypeScript servers
    expect(screen.getByText('CoreOpenSumi')).toBeInTheDocument();
    expect(screen.getByText('Genkit')).toBeInTheDocument();
  });

  it('shows filter controls when filters button is clicked', () => {
    renderWithRouter(<MCPCatalog />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Programming Language')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('displays server ratings and download counts', () => {
    renderWithRouter(<MCPCatalog />);
    
    // Check for rating display
    expect(screen.getAllByText('5.0')).toHaveLength(mcpServers.length);
    
    // Check for download counts (should be displayed as "15.0K", "15.7K", etc.)
    expect(screen.getByText('15.0K')).toBeInTheDocument();
    expect(screen.getByText('15.7K')).toBeInTheDocument();
  });

  it('shows official and certified badges', () => {
    renderWithRouter(<MCPCatalog />);
    
    // Check for official badges
    expect(screen.getAllByText('Official')).toHaveLength(
      mcpServers.filter(s => s.isOfficial).length
    );
    
    // Check for certified badges
    expect(screen.getAllByText('Certified')).toHaveLength(
      mcpServers.filter(s => s.isCertified).length
    );
  });

  it('displays server tags', () => {
    renderWithRouter(<MCPCatalog />);
    
    // Check for some common tags
    expect(screen.getByText('IDE')).toBeInTheDocument();
    expect(screen.getByText('Framework')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows no results message when no servers match filters', () => {
    renderWithRouter(<MCPCatalog />);
    
    const searchInput = screen.getByPlaceholderText('Search MCP servers...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentServer' } });
    
    expect(screen.getByText('No MCP servers found')).toBeInTheDocument();
    expect(screen.getByText('No MCP servers found matching your criteria. Try adjusting your search or filters.')).toBeInTheDocument();
  });
});

