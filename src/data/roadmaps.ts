export interface RoadmapResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'tool';
  internalToolName?: string; // If it links to a tool in our directory
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  resources: RoadmapResource[];
}

export interface RoadmapPath {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
}

export const roadmaps: Record<string, RoadmapPath> = {
  'ai-engineer': {
    id: 'ai-engineer',
    title: 'AI Engineer',
    description: 'Master the art of building AI-powered applications, from LLM integration to agentic workflows.',
    steps: [
      {
        id: 'fundamentals',
        title: '1. Fundamentals',
        description: 'Building blocks of modern software engineering required for AI.',
        concepts: [
          'Python Mastery (Typing, AsyncIO)',
          'Git & Version Control',
          'REST & GraphQL APIs',
          'Basic SQL & Databases',
          'FastAPI / Flask'
        ],
        resources: [
          { title: 'CS50 Introduction to CS', url: 'https://cs50.harvard.edu/x/', type: 'course' },
          { title: 'Python 3.12 Docs', url: 'https://docs.python.org/3/', type: 'article' },
          { title: 'FastAPI', url: 'https://fastapi.tiangolo.com/', type: 'tool', internalToolName: 'FastAPI' }
        ]
      },
      {
        id: 'data-science-basics',
        title: '2. Data Science Basics',
        description: 'Core libraries for handling data, essential for any AI Engineering.',
        concepts: [
          'Pandas (DataFrames)',
          'NumPy (Array Operations)',
          'Data Visualization (Matplotlib)',
          'Jupyter Notebooks'
        ],
        resources: [
          { title: 'Kaggle Learn: Pandas', url: 'https://www.kaggle.com/learn/pandas', type: 'course' },
          { title: 'Python for Data Analysis', url: 'https://wesmckinney.com/book/', type: 'article' },
          { title: 'Jupyter', url: 'https://jupyter.org/', type: 'tool', internalToolName: 'Jupyter' }
        ]
      },
      {
        id: 'ml-foundations',
        title: '3. Machine Learning Foundations',
        description: 'Understanding how models learn, even if you just use APIs.',
        concepts: [
          'Supervised vs Unsupervised',
          'Regression & Classification',
          'Overfitting/Underfitting',
          'Evaluation Metrics (Accuracy, F1)'
        ],
        resources: [
          { title: 'Machine Learning Specialization', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'course' },
          { title: 'Scikit-Learn', url: 'https://scikit-learn.org/', type: 'tool', internalToolName: 'Scikit-learn' }
        ]
      },
      {
        id: 'deep-learning-basics',
        title: '4. Deep Learning Basics',
        description: 'The architecture behind modern LLMs.',
        concepts: [
          'Neural Networks 101',
          'Activation Functions',
          'Backpropagation',
          'Transformers Architecture (Attention)'
        ],
        resources: [
          { title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', type: 'course' },
          { title: 'Practical Deep Learning', url: 'https://course.fast.ai/', type: 'course' },
          { title: 'The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'article' }
        ]
      },
      {
        id: 'prompt-engineering',
        title: '5. Prompt Engineering',
        description: 'The art of communicating effectively with Large Language Models.',
        concepts: [
          'Zero-shot vs Few-shot',
          'Chain of Thought (CoT)',
          'ReAct Pattern',
          'System Prompts'
        ],
        resources: [
          { title: 'ChatGPT Prompt Engineering', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', type: 'course' },
          { title: 'OpenAI Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'article' },
          { title: 'Anthropic Workbench', url: 'https://console.anthropic.com/workbench', type: 'tool', internalToolName: 'Claude' }
        ]
      },
      {
        id: 'llm-apis',
        title: '6. LLM APIs & Models',
        description: 'Integrating foundation models into applications.',
        concepts: [
          'OpenAI API (GPT-4o)',
          'Anthropic API (Claude 3.5)',
          'Open Source Models (Llama 3, Mistral)',
          'Embeddings Models'
        ],
        resources: [
          { title: 'Intro to Large Language Models', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', type: 'video' },
          { title: 'Hugging Face Hub', url: 'https://huggingface.co/models', type: 'tool', internalToolName: 'Hugging Face' },
          { title: 'OpenRouter', url: 'https://openrouter.ai/', type: 'tool' }
        ]
      },
      {
        id: 'rag',
        title: '7. RAG (Retrieval Augmented Generation)',
        description: 'Grounding LLMs with your own private data.',
        concepts: [
          'Vector Databases (Vector Stores)',
          'Chunking & Indexing',
          'Hybrid Search (Keyword + Semantic)',
          'Reranking'
        ],
        resources: [
          { title: 'RAG for LLMs Survey', url: 'https://arxiv.org/abs/2312.10997', type: 'article' },
          { title: 'Pinecone Learning Center', url: 'https://www.pinecone.io/learn/', type: 'article', internalToolName: 'Pinecone' },
          { title: 'Sentence Transformers', url: 'https://sbert.net/', type: 'tool' }
        ]
      },
      {
        id: 'agents',
        title: '8. Agents & Orchestration',
        description: 'Building autonomous systems that can use tools and plan.',
        concepts: [
          'Tool Calling / Function Calling',
          'Multi-Agent Systems',
          'Memory & State Management',
          'Human-in-the-loop'
        ],
        resources: [
          { title: 'LLM Powered Autonomous Agents', url: 'https://lilianweng.github.io/posts/2023-06-23-agent/', type: 'article' },
          { title: 'Building Systems with LLMs', url: 'https://www.deeplearning.ai/short-courses/building-systems-with-the-chatgpt-api/', type: 'course' },
          { title: 'LangGraph', url: 'https://langchain-ai.github.io/langgraph/', type: 'tool', internalToolName: 'LangGraph' }
        ]
      },
      {
        id: 'finetuning',
        title: '9. Fine-tuning & SLMs',
        description: 'Customizing models for specific tasks or domains.',
        concepts: [
          'PEFT / LoRA (Low-Rank Adaptation)',
          'Quantization (BnB, GGUF)',
          'Dataset Preparation',
          'Local Inference (Ollama, vLLM)'
        ],
        resources: [
          { title: 'Ollama', url: 'https://ollama.com/', type: 'tool', internalToolName: 'Ollama' },
          { title: 'Axolotl', url: 'https://github.com/OpenAccess-AI-Collective/axolotl', type: 'tool' }
        ]
      },
      {
        id: 'ai-safety',
        title: '10. AI Safety & Ethics',
        description: 'Building secure, reliable, and fair AI systems.',
        concepts: [
           'Prompt Injection (Jailbreaking)',
           'Bias & Fairness',
           'Hallucination Mitigation',
           'Red Teaming'
        ],
        resources: [
           { title: 'OWASP Top 10 for LLMs', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', type: 'article' },
           { title: 'Microsoft AI Security', url: 'https://www.microsoft.com/en-us/security/business/ai-security', type: 'article' }
        ]
      },
      {
        id: 'evals-ops',
        title: '11. Evals & LLMOps',
        description: 'Testing, monitoring, and deploying reliable AI apps.',
        concepts: [
          'LLM Evaluation (Ragas, DeepEval)',
          'Observability (LangSmith)',
          'Prompt Management',
          'Cost Tracing'
        ],
        resources: [
          { title: 'LangSmith', url: 'https://smith.langchain.com/', type: 'tool' },
          { title: 'Arize Phoenix', url: 'https://arize.com/phoenix/', type: 'tool' }
        ]
      }
    ]
  },
  'ai-data-scientist': {
    id: 'ai-data-scientist',
    title: 'AI Data Scientist',
    description: 'Deep dive into model training, fine-tuning, and statistical analysis for AI systems.',
    steps: [
      {
        id: 'ds-math',
        title: '1. Mathematics',
        description: 'The rigorous math required to understand ML algorithms deeply.',
        concepts: [
          'Linear Algebra (Matrices, Vectors)',
          'Calculus (Gradients, Chain Rule, Derivatives)',
          'Matrix Distances & Factorization'
        ],
        resources: [
          { title: 'Khan Academy Linear Algebra', url: 'https://www.khanacademy.org/math/linear-algebra', type: 'course' },
          { title: '3Blue1Brown Neural Networks', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', type: 'video' }
        ]
      },
      {
        id: 'ds-statistics',
        title: '2. Statistics & Probability',
        description: 'The heart of data science – making inferences from data.',
        concepts: [
          'Descriptive vs Inferential Stats',
          'Probability Distributions',
          'Hypothesis Testing (p-values)',
          'Bayesian Statistics'
        ],
        resources: [
           { title: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course' }
        ]
      },
      {
        id: 'ds-intro-coding',
        title: '3. Introduction to Coding',
        description: 'Mastering the tools of the trade.',
        concepts: [
          'Python Proficiency',
          'Data Structures & Algorithms',
          'Jupyter Notebooks',
          'Git & GitHub'
        ],
        resources: [
          { title: 'Python Docs', url: 'https://docs.python.org/3/', type: 'article' },
          { title: 'Jupyter', url: 'https://jupyter.org/', type: 'tool', internalToolName: 'Jupyter' }
        ]
      },
      {
        id: 'ds-databases',
        title: '4. Databases',
        description: 'Retrieving and managing large datasets.',
        concepts: [
          'SQL (Joins, Aggregations, Window Functions)',
          'NoSQL Databases (MongoDB)',
          'Vector Databases'
        ],
        resources: [
           { title: 'SQLZoo', url: 'https://sqlzoo.net/', type: 'course' },
           { title: 'Pinecone', url: 'https://www.pinecone.io/', type: 'tool', internalToolName: 'Pinecone' }
        ]
      },
      {
        id: 'ds-eda',
        title: '5. Exploratory Data Analysis (EDA)',
        description: 'Understanding your data before modeling.',
        concepts: [
          'Data Cleaning & Preprocessing',
          'Pandas & NumPy',
          'Data Visualization (Matplotlib, Seaborn)',
          'Feature Engineering'
        ],
        resources: [
          { title: 'Pandas', url: 'https://pandas.pydata.org/', type: 'tool', internalToolName: 'Pandas' }
        ]
      },
      {
        id: 'ds-ml',
        title: '6. Machine Learning',
        description: 'Predictive modeling and pattern recognition.',
        concepts: [
          'Supervised Learning (Regression, Classification)',
          'Unsupervised Learning (Clustering, PCA)',
          'Ensemble Methods (Random Forest, XGBoost)',
          'Scikit-learn'
        ],
        resources: [
          { title: 'Scikit-Learn', url: 'https://scikit-learn.org/', type: 'tool', internalToolName: 'Scikit-learn' }
        ]
      },
      {
        id: 'ds-deep-learning',
        title: '7. Deep Learning',
        description: 'Neural networks for complex non-linear problems.',
        concepts: [
          'ANNs (Artificial Neural Networks)',
          'CNNs (Computer Vision)',
          'RNNs/LSTMs (Time Series)',
          'PyTorch / TensorFlow'
        ],
        resources: [
          { title: 'PyTorch', url: 'https://pytorch.org/', type: 'tool', internalToolName: 'PyTorch' },
          { title: 'Fast.ai', url: 'https://www.fast.ai/', type: 'course' }
        ]
      },
      {
        id: 'ds-llms',
        title: '8. LLMs & GenAI',
        description: 'The frontier of modern Data Science.',
        concepts: [
          'Transformers Architecture',
          'Prompt Engineering',
          'Fine-tuning (PEFT/LoRA)',
          'RAG Pipelines'
        ],
        resources: [
          { title: 'Hugging Face', url: 'https://huggingface.co/', type: 'tool', internalToolName: 'Hugging Face' },
          { title: 'LangChain', url: 'https://python.langchain.com/', type: 'tool', internalToolName: 'LangChain' }
        ]
      },
      {
        id: 'ds-mlops',
        title: '9. MLOps',
        description: 'Deploying and maintaining models in production.',
        concepts: [
          'Model Deployment (Docker, Kubernetes)',
          'Model Monitoring',
          'Experiment Tracking (MLflow)',
          'CI/CD for ML'
        ],
        resources: [
          { title: 'Weights & Biases', url: 'https://wandb.ai/', type: 'tool' },
          { title: 'MLflow', url: 'https://mlflow.org/', type: 'tool' }
        ]
      }
    ]
  },
  'prompt-engineering': {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Learn the art and science of communicating effectively with AI models.',
    steps: [
      {
        id: 'pe-intro',
        title: '1. Introduction',
        description: 'Common terminology and how LLMs work.',
        concepts: [
          'LLMs (Large Language Models)',
          'Tokens vs Words',
          'Context Window',
          'Hallucinations'
        ],
        resources: [
          { title: 'LLMs Explained', url: 'https://roadmap.sh/guides/llms-and-how-they-work', type: 'article' },
          { title: 'OpenAI Prompting Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'article' }
        ]
      },
      {
        id: 'pe-config',
        title: '2. LLM Configuration',
        description: 'Controlling creativity and deterministic behavior.',
        concepts: [
          'Temperature (Creativity)',
          'Top P (Nucleus Sampling)',
          'Max Tokens'
        ],
        resources: [
          { title: 'OpenAI Playground', url: 'https://platform.openai.com/playground', type: 'tool', internalToolName: 'OpenAI' }
        ]
      },
      {
        id: 'pe-basic-techniques',
        title: '3. Basic Techniques',
        description: 'The fundamental patterns for good prompts.',
        concepts: [
          'Zero-Shot Prompting',
          'Few-Shot Prompting (In-context Learning)',
          'Role Prompting (Persona)',
          'Style & Format Control'
        ],
        resources: [
          { title: 'Prompting Guide', url: 'https://www.promptingguide.ai/', type: 'article' }
        ]
      },
      {
        id: 'pe-advanced-techniques',
        title: '4. Advanced Reasoning',
        description: 'Getting models to think through complex problems.',
        concepts: [
          'Chain of Thought (CoT)',
          'Self-Consistency',
          'Tree of Thoughts (ToT)',
          'ReAct (Reasoning + Acting)'
        ],
        resources: [
          { title: 'Chain of Thought Paper', url: 'https://arxiv.org/abs/2201.11903', type: 'article' },
           { title: 'LangChain', url: 'https://python.langchain.com/', type: 'tool', internalToolName: 'LangChain' }
        ]
      },
      {
        id: 'pe-best-practices',
        title: '5. Best Practices',
        description: 'Ensuring reliability and reducing errors.',
        concepts: [
          'Delimiters & Structuring',
          'Prompt Injection Defense',
          'Iterative Refinement',
          'Evaluation (LLM-as-a-Judge)'
        ],
        resources: [
          { title: 'Anthropic Prompt Engineering', url: 'https://docs.anthropic.com/claude/docs/prompt-engineering', type: 'article', internalToolName: 'Claude' }
        ]
      },
      {
        id: 'pe-tools',
        title: '6. Tools & Frameworks',
        description: 'Software to automate and manage prompts.',
        concepts: [
          'Prompt Management Systems',
          'Playgrounds',
          'DSPy (Declarative Prompting)'
        ],
        resources: [
          { title: 'LangSmith', url: 'https://smith.langchain.com/', type: 'tool' }
        ]
      }
    ]
  }
};
