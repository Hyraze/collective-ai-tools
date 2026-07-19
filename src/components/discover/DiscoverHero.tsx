export function DiscoverHero() {
  return (
    <header className="relative mx-auto max-w-3xl text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
        The AI ecosystem, in one place
      </p>
      <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-6xl">
        Discover what's{' '}
        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
          actually worth using
        </span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500 dark:text-gray-400">
        Search across curated tools, MCP servers, prompts, skills, and trending repos — one query,
        every corner of the ecosystem.
      </p>
    </header>
  );
}
