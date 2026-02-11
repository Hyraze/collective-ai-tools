import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Map, 
  Code, 
  Database,
  BookOpen,
  ExternalLink,
  Layers,
  Terminal,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import SEO from './SEO';
import { Link } from 'react-router-dom';
import { roadmaps } from '../data/roadmaps';
import PageHeader from './PageHeader';

const RoadmapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai-engineer' | 'ai-data-scientist' | 'prompt-engineering'>('ai-engineer');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['prerequisites', 'math-foundations', 'pe-intro']));
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roadmap_progress');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const roadmap = roadmaps[activeTab];

  // Calculate Progress
  const totalConcepts = roadmap.steps.reduce((acc, step) => acc + step.concepts.length, 0);
  const completedCount = roadmap.steps.reduce((acc, step) => 
    acc + step.concepts.filter(c => completedConcepts.has(`${activeTab}-${step.id}-${c}`)).length
  , 0);
  const progressPercentage = Math.round((completedCount / totalConcepts) * 100) || 0;

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const toggleConcept = (stepId: string, concept: string) => {
    const id = `${activeTab}-${stepId}-${concept}`;
    setCompletedConcepts(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        
        localStorage.setItem('roadmap_progress', JSON.stringify(Array.from(next)));
        return next;
    });
  };

  const markStepComplete = (stepId: string, concepts: string[]) => {
     setCompletedConcepts(prev => {
        const next = new Set(prev);
        const allCompleted = concepts.every(c => next.has(`${activeTab}-${stepId}-${c}`));
        
        concepts.forEach(c => {
            const id = `${activeTab}-${stepId}-${c}`;
            if (allCompleted) next.delete(id); // Toggle off if all complete
            else next.add(id); // Toggle on
        });

        localStorage.setItem('roadmap_progress', JSON.stringify(Array.from(next)));
        return next;
     });
  };

  return (
    <>
      <SEO 
        title={`${roadmap.title} Roadmap | Collective AI Tools`}
        description={roadmap.description}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <PageHeader 
             title="Interactive AI Roadmap"
             description="Track your learning progress step-by-step to master AI skills."
             icon={Map}
          />

          {/* Path Selector */}
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 inline-flex flex-wrap justify-center gap-2">
               <button
                 onClick={() => setActiveTab('ai-engineer')}
                 className={`
                   flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                   ${activeTab === 'ai-engineer' 
                     ? 'bg-blue-600 text-white shadow-md' 
                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                 `}
               >
                 <Code className="w-5 h-5" />
                 AI Engineer
               </button>
               <button
                 onClick={() => setActiveTab('ai-data-scientist')}
                 className={`
                   flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                   ${activeTab === 'ai-data-scientist' 
                     ? 'bg-purple-600 text-white shadow-md' 
                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                 `}
               >
                 <Database className="w-5 h-5" />
                 Data Scientist
               </button>
               <button
                 onClick={() => setActiveTab('prompt-engineering')}
                 className={`
                   flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                   ${activeTab === 'prompt-engineering' 
                     ? 'bg-amber-600 text-white shadow-md' 
                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                 `}
               >
                 <Code className="w-5 h-5" />
                 Prompt Eng.
               </button>
            </div>
          </div>


          {/* Sticky Progress Header */}
          <div className="sticky top-20 z-20 mb-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Your Progress: {completedCount}/{totalConcepts} Concepts
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {progressPercentage}%
                </span>
             </div>
             <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${
                      activeTab === 'ai-engineer' ? 'bg-blue-600' : (activeTab === 'prompt-engineering' ? 'bg-amber-500' : 'bg-purple-600')
                  }`}
                  style={{ width: `${progressPercentage}%` }} 
                />
             </div>
          </div>
          
           {/* Timeline View */}
           <div className="max-w-4xl mx-auto">
              <div className="relative pl-8 border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-4 md:ml-12 space-y-12">
                 {roadmap.steps.map((step, index) => {
                   const isExpanded = expandedSteps.has(step.id);
                   const stepCompletedConcepts = step.concepts.filter(c => completedConcepts.has(`${activeTab}-${step.id}-${c}`));
                   const isStepFullyComplete = stepCompletedConcepts.length === step.concepts.length;
                   
                   return (
                     <div key={step.id} className="relative">
                        {/* Timeline Dot */}
                        <div className={`
                          absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 transition-colors duration-500
                          ${isStepFullyComplete ? 'bg-green-500' : (
                              activeTab === 'ai-engineer' ? 'bg-blue-600' : (activeTab === 'prompt-engineering' ? 'bg-amber-600' : 'bg-purple-600')
                          )}
                        `}>
                            {isStepFullyComplete && (
                                <CheckCircle2 className="absolute -top-1 -left-1 w-6 h-6 text-green-500 bg-white dark:bg-gray-900 rounded-full" />
                            )}
                        </div>
                        
                        <Card 
                          className={`
                            border transition-all duration-300 overflow-hidden cursor-pointer group
                            ${isExpanded ? 'shadow-xl ring-2 ring-opacity-50' : 'shadow-sm hover:shadow-md'}
                            ${activeTab === 'ai-engineer' 
                              ? (isExpanded ? 'ring-blue-400 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700')
                              : (activeTab === 'prompt-engineering' 
                                ? (isExpanded ? 'ring-amber-400 border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700')
                                : (isExpanded ? 'ring-purple-400 border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700')
                              )}
                          `}
                          onClick={() => toggleStep(step.id)}
                        >
                           <div className="p-6">
                             <div className="flex items-center justify-between">
                                <div className="flex-1">
                                   <div className="flex items-center gap-3 mb-1">
                                       <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          Milestone {index + 1}
                                       </span>
                                       {isStepFullyComplete && (
                                           <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-[10px] font-bold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                                               COMPLETED
                                           </span>
                                       )}
                                   </div>
                                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                     {step.title}
                                   </h3>
                                </div>
                                <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                   {isExpanded ? <ChevronDown className="w-6 h-6 text-gray-400" /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
                                </div>
                             </div>
 
                             {/* Summary */}
                             <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {step.description}
                             </p>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
                                 
                                 <div className="grid md:grid-cols-2 gap-8">
                                      {/* Key Concepts */}
                                      <div>
                                         <div className="flex items-center justify-between mb-3">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                Key Concepts
                                            </h4>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markStepComplete(step.id, step.concepts);
                                                }}
                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {isStepFullyComplete ? 'Mark Incomplete' : 'Mark All Complete'}
                                            </button>
                                         </div>
                                         <ul className="space-y-3">
                                            {step.concepts.map(concept => {
                                              const isConceptCompleted = completedConcepts.has(`${activeTab}-${step.id}-${concept}`);
                                              return (
                                                <li 
                                                    key={concept} 
                                                    className={`
                                                        flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group/item
                                                        ${isConceptCompleted 
                                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }
                                                    `}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleConcept(step.id, concept);
                                                    }}
                                                >
                                                   <div className={`
                                                        mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                                        ${isConceptCompleted
                                                            ? 'bg-green-500 border-green-500 text-white'
                                                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover/item:border-blue-400'
                                                        }
                                                   `}>
                                                       {isConceptCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                   </div>
                                                   <span className={`text-sm transition-colors ${isConceptCompleted ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {concept}
                                                   </span>
                                                </li>
                                              );
                                            })}
                                         </ul>
                                      </div>

                                    {/* Recommended Resources */}
                                    <div>
                                       <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3">
                                          <Layers className="w-4 h-4 text-purple-500" />
                                          Recommended Resources
                                       </h4>
                                       <div className="space-y-2">
                                          {step.resources.map((resource, i) => (
                                            <a 
                                              key={i} 
                                              href={resource.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                              onClick={(e) => e.stopPropagation()} // Prevent toggling card
                                            >
                                               <div className="flex items-center justify-between">
                                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                     {resource.title}
                                                  </span>
                                                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                               </div>
                                               {resource.internalToolName && (
                                                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                                                     TOOL
                                                  </span>
                                               )}
                                            </a>
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                              </div>
                            )}
                          </div>
                       </Card>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Footer Call to Action */}
          <div className="text-center mt-20 mb-12">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Need help finding the right tools?</h3>
             <Button size="lg" asChild>
                <Link to="/tools">
                   Explore Tool Directory <Terminal className="w-4 h-4 ml-2" />
                </Link>
             </Button>
          </div>

        </div>
      </div>
    </>
  );
};

export default RoadmapPage;
