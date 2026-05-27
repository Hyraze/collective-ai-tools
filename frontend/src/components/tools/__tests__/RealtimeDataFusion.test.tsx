
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RealtimeDataFusion from '../RealtimeDataFusion';
import { aiToolsClient } from '@/lib/aiToolsClient';

// Mock aiToolsClient
vi.mock('@/lib/aiToolsClient', () => ({
  aiToolsClient: {
    makeRequest: vi.fn(),
    getDefaultConfig: vi.fn().mockReturnValue({
      useCustomApi: false,
      model: 'gemini-pro',
      temperature: 0.7
    }),
  }
}));

// Mock simple internal components if needed, but integration test is better
// RealtimeDataFusion isn't exported as default usually? checked file: 'const RealtimeDataFusion ... export default RealtimeDataFusion' - Wait, it was 'export default AgentBuilder' in the other file.
// Checking RealtimeDataFusion.tsx content again... it doesn't seem to have 'export default RealtimeDataFusion' at the end in the snippet.
// Wait, I saw 'const RealtimeDataFusion: React.FC = () => {' and then it ended.
// I should check if it is exported. If not, I can't test it easily without modifying it.
// Actually, looking at the file view again:
// Line 214: const RealtimeDataFusion: React.FC = () => { ...
// The view ended at line 800. The file has 836 lines.
// It is likely exported at the end. I will assume it is default exported or named exported. 
// I'll try named import first based on how these usually go, or check the file end.
// Actually, I can just use 'import RealtimeDataFusion from ...' and if it fails, I'll fix it.
// Safe bet: import RealtimeDataFusion from '../RealtimeDataFusion'; (default)

describe('RealtimeDataFusion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<RealtimeDataFusion />);
    expect(screen.getByText('Real-time Data Fusion Engine')).toBeDefined();
    expect(screen.getByText('Data Sources')).toBeDefined();
  });

  it('toggles streaming', () => {
    render(<RealtimeDataFusion />);
    const startButtons = screen.getAllByText('Start Streaming');
    fireEvent.click(startButtons[0]);
    expect(screen.getAllByText('Stop Streaming')[0]).toBeDefined();
    
    // Check if live indicator updates
    expect(screen.getByText('Live')).toBeDefined();
  });

  it('generates insights', async () => {
    const mockInsights = [
      {
        id: 'new-insight',
        type: 'trend',
        title: 'New AI Trend',
        description: 'Test Description',
        confidence: 0.9,
        impact: 'high',
        timestamp: new Date().toISOString(),
        actionable: true,
        data: {}
      }
    ];

    vi.mocked(aiToolsClient.makeRequest).mockResolvedValue({
      success: true,
      data: { insights: mockInsights }
    });

    render(<RealtimeDataFusion />);
    
    const generateButtons = screen.getAllByText('Generate Insights');
    fireEvent.click(generateButtons[0]);

    await waitFor(() => {
      expect(aiToolsClient.makeRequest).toHaveBeenCalled();
    });
  });

  it('opens add data source modal', () => {
    render(<RealtimeDataFusion />);
    const addButtons = screen.getAllByText('Add Source');
    fireEvent.click(addButtons[0]);
    expect(screen.getByText('Add Data Source')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g., Weather API')).toBeDefined();
  });
});
