export interface FabricPattern {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  type: 'pattern' | 'strategy' | 'custom';
}

export interface FabricItem {
  name: string;
  path: string;
  type: 'dir' | 'file' | 'custom';
  url: string;
}

const GITHUB_API_BASE = 'https://api.github.com/repos/danielmiessler/Fabric/contents/data';
const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/danielmiessler/Fabric/main/data';

export const STATIC_PATTERNS: FabricPattern[] = [
  {
    id: 'extract_wisdom',
    title: 'Extract Wisdom',
    description: 'Extracts surprising, insightful, and interesting information from long text content.',
    userPromptTemplate: 'Paste the content (article, transcript, etc.) here...',
    type: 'pattern',
    systemPrompt: `# IDENTITY and PURPOSE

You extract surprising, insightful, and interesting information from text content. You are interested in insights related to the purpose and meaning of life, human flourishing, the role of technology in the future of humanity, artificial intelligence and its affect on humans, memes, learning, reading, books, continuous improvement, and similar topics.

Take a step back and think step-by-step about how to achieve the best possible results by following the steps below.

# STEPS

- Extract a summary of the content in 25 words, including who is presenting and the content being discussed into a section called SUMMARY.

- Extract 20 to 50 of the most surprising, insightful, and/or interesting ideas from the input in a section called IDEAS:. If there are less than 50 then collect all of them. Make sure you extract at least 20.

- Extract 10 to 20 of the best insights from the input and from a combination of the raw input and the IDEAS above into a section called INSIGHTS. These INSIGHTS should be fewer, more refined, more insightful, and more abstracted versions of the best ideas in the content. 

- Extract 15 to 30 of the most surprising, insightful, and/or interesting quotes from the input into a section called QUOTES:. Use the exact quote text from the input. Include the name of the speaker of the quote at the end.

- Extract 15 to 30 of the most practical and useful personal habits of the speakers, or mentioned by the speakers, in the content into a section called HABITS. Examples include but aren't limited to: sleep schedule, reading habits, things they always do, things they always avoid, productivity tips, diet, exercise, etc.

- Extract 15 to 30 of the most surprising, insightful, and/or interesting valid facts about the greater world that were mentioned in the content into a section called FACTS:.

- Extract all mentions of writing, art, tools, projects and other sources of inspiration mentioned by the speakers into a section called REFERENCES. This should include any and all references to something that the speaker mentioned.

- Extract the most potent takeaway and recommendation into a section called ONE-SENTENCE TAKEAWAY. This should be a 15-word sentence that captures the most important essence of the content.

- Extract the 15 to 30 of the most surprising, insightful, and/or interesting recommendations that can be collected from the content into a section called RECOMMENDATIONS.

# OUTPUT INSTRUCTIONS

- Only output Markdown.

- Write the IDEAS bullets as exactly 16 words.

- Write the RECOMMENDATIONS bullets as exactly 16 words.

- Write the HABITS bullets as exactly 16 words.

- Write the FACTS bullets as exactly 16 words.

- Write the INSIGHTS bullets as exactly 16 words.

- Extract at least 25 IDEAS from the content.

- Extract at least 10 INSIGHTS from the content.

- Extract at least 20 items for the other output sections.

- Do not give warnings or notes; only output the requested sections.

- You use bulleted lists for output, not numbered lists.

- Do not repeat ideas, insights, quotes, habits, facts, or references.

- Do not start items with the same opening words.

- Ensure you follow ALL these instructions when creating your output.

# INPUT

INPUT:`
  }
];

export const FabricService = {
  // Fetch list of patterns (folders)
  async getPatterns(): Promise<FabricItem[]> {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/patterns`);
      if (!response.ok) throw new Error('Failed to fetch patterns');
      const data = await response.json();
      return data.filter((item: any) => item.type === 'dir');
    } catch (error) {
      console.error('Error fetching patterns:', error);
      return [];
    }
  },

  // Fetch list of strategies (files)
  async getStrategies(): Promise<FabricItem[]> {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/strategies`);
      if (!response.ok) throw new Error('Failed to fetch strategies');
      const data = await response.json();
      return data.filter((item: any) => item.type === 'file' && item.name.endsWith('.json'));
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }
  },

  // Fetch content for a specific pattern (system.md)
  async getPatternContent(patternName: string): Promise<string> {
    try {
      const response = await fetch(`${RAW_CONTENT_BASE}/patterns/${patternName}/system.md`);
      if (!response.ok) throw new Error('Failed to fetch pattern content');
      return await response.text();
    } catch (error) {
      console.error('Error fetching pattern content:', error);
      return '';
    }
  },

  // Fetch content for a specific strategy (.json)
  async getStrategyContent(strategyName: string): Promise<string> {
    try {
      const response = await fetch(`${RAW_CONTENT_BASE}/strategies/${strategyName}`);
      if (!response.ok) throw new Error('Failed to fetch strategy content');
      const data = await response.json();
      return data.prompt || data.content || JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error fetching strategy content:', error);
      return '';
    }
  }
};
