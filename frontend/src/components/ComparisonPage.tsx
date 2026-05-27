import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAITools, AITool } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Info,
  Scale
} from 'lucide-react';
import SEO from './SEO';
import { Loader2 } from 'lucide-react';

const ComparisonPage: React.FC = () => {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse comparisonId (e.g., "cursor-vs-windsurf")
  const [slugA, slugB] = useMemo(() => {
    if (!comparisonId) return [null, null];
    const parts = comparisonId.split('-vs-');
    return [parts[0], parts[1]];
  }, [comparisonId]);

  useEffect(() => {
    const loadTools = async () => {
      try {
        setIsLoading(true);
        // Fetch tools to find matches
        // In a real app, we'd have an endpoint to fetch by slug directly
        const response = await fetchAITools({ limit: 1000 });
        
        const toolA = response.data.find(t => 
          t.name.toLowerCase().replace(/\s+/g, '-') === slugA
        );
        const toolB = response.data.find(t => 
          t.name.toLowerCase().replace(/\s+/g, '-') === slugB
        );

        if (!toolA || !toolB) {
          setError('One or both tools could not be found for comparison.');
        } else {
          setTools([toolA, toolB]);
        }
      } catch (err) {
        console.error('Failed to load comparison tools:', err);
        setError('An error occurred while loading the comparison.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slugA && slugB) {
      loadTools();
    }
  }, [slugA, slugB]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading comparison details...</p>
        </div>
      </div>
    );
  }

  if (error || tools.length < 2) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{error || 'Something went wrong'}</h2>
          <Button asChild variant="outline">
            <Link to="/tools">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const [toolA, toolB] = tools;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50 dark:bg-gray-900">
      <SEO 
        title={`${toolA.name} vs ${toolB.name} Comparison | Collective AI Tools`}
        description={`Compare ${toolA.name} and ${toolB.name} side-by-side. See features, pricing, and which AI tool is better for your needs.`}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Link 
          to="/tools" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
             <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {toolA.name} <span className="text-blue-600">vs</span> {toolB.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive side-by-side comparison to help you choose the right tool for your workflow.
          </p>
        </div>

        {/* Comparison Table */}
        <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-gray-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[200px] font-bold">Feature</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                       <span className="text-xl font-bold">{toolA.name}</span>
                       <Button size="sm" asChild>
                          <a href={toolA.website || toolA.url} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                       </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                       <span className="text-xl font-bold">{toolB.name}</span>
                       <Button size="sm" asChild variant="outline">
                          <a href={toolB.website || toolB.url} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                       </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold align-top pt-6">Description</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 pt-6">
                    {toolA.description}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 pt-6">
                    {toolB.description}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-semibold">Category</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{toolA.category?.name || 'General'}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{toolB.category?.name || 'General'}</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Pricing</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {toolA.pricing && toolA.pricing.length > 0 ? (
                        toolA.pricing.map(p => (
                          <Badge key={p.name} variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200">
                            {p.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {toolB.pricing && toolB.pricing.length > 0 ? (
                        toolB.pricing.map(p => (
                          <Badge key={p.name} variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200">
                            {p.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Tags & Capabilities</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-center gap-1">
                      {toolA.tags.map(tag => (
                        <Badge key={tag} className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-center gap-1">
                      {toolB.tags.map(tag => (
                        <Badge key={tag} className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Popularity</TableCell>
                  <TableCell className="text-center font-medium">
                    {toolA.tags.includes('popular') || toolA.tags.includes('trending') ? (
                      <span className="text-orange-500 flex items-center justify-center gap-1">
                        High <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : 'Moderate'}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {toolB.tags.includes('popular') || toolB.tags.includes('trending') ? (
                      <span className="text-orange-500 flex items-center justify-center gap-1">
                        High <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : 'Moderate'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="hover:ring-2 ring-blue-500/20 transition-all">
              <CardContent className="pt-6">
                 <h3 className="text-xl font-bold mb-4">Why choose {toolA.name}?</h3>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">{toolA.description}</p>
                 <div className="flex flex-wrap gap-2">
                    {toolA.tags.slice(0, 5).map(tag => (
                      <div key={tag} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                         <CheckCircle2 className="w-3 h-3" /> {tag}
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
           
           <Card className="hover:ring-2 ring-purple-500/20 transition-all">
              <CardContent className="pt-6">
                 <h3 className="text-xl font-bold mb-4">Why choose {toolB.name}?</h3>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">{toolB.description}</p>
                 <div className="flex flex-wrap gap-2">
                    {toolB.tags.slice(0, 5).map(tag => (
                      <div key={tag} className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                         <CheckCircle2 className="w-3 h-3" /> {tag}
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* FAQ/Recommendation */}
        <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Recommendation</h2>
            <div className="max-w-3xl mx-auto p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
               <p className="text-gray-700 dark:text-gray-300">
                  While both <strong>{toolA.name}</strong> and <strong>{toolB.name}</strong> are top-tier AI tools, your choice depends on your specific use case.
                  If you prioritize <strong>{toolA.tags[0]}</strong>, then {toolA.name} is likely the better fit.
                  However, for workflows heavily involving <strong>{toolB.tags[0]}</strong>, we recommend giving {toolB.name} a try.
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
