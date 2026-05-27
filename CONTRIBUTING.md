# Contributing to Collective AI Tools

First off, thank you for considering contributing! It's people like you that make Collective AI Tools such a great resource. We welcome any type of contribution, not only code.

## How Can I Contribute?

The most common and impactful way to contribute is by adding new AI tools to our list. Our `README.md` file is the single source of truth for all the tools listed on the [collectiveai.tools](https://collectiveai.tools) website.

### Submitting a Change

1.  **Fork the repository:** Click the 'Fork' button at the top right of this page. This creates a copy of the project in your GitHub account.

2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/collective-ai-tools.git
    cd collective-ai-tools
    ```

3.  **Create a new branch:**
    ```bash
    git checkout -b feature/add-my-cool-tool
    ```
    (Replace `add-my-cool-tool` with a descriptive name for your change).

4.  **Make your changes in `README.md`:** This is the most important step!

    *   **To Add a New Tool:**
        Find the appropriate category for the tool. Add a new line item using the following format. Please keep the list alphabetized within its category.

        **Template:**
        ```markdown
        - [Tool Name](https://tool-url.com/) - A brief, one-sentence description of what the tool does. `#tag1` `#tag2`
        ```

        **Example:**
        ```markdown
        - [New AI Visualizer](https://newvisualizer.ai/) - Creates stunning visuals from data points using generative AI. `#dataviz` `#free`
        ```
        **Important:**
        *   The URL must be a direct link to the tool, not an article or blog post.
        *   The description should be concise and clear.
        *   Include at least one tag (e.g., `#free`, `#paid`, `#freemium`, `#opensource`, `#design`, `#writing`). These tags are used for filtering on the website.

    *   **To Add a New Category:**
        If the tool you're adding doesn't fit into an existing category, you can create a new one.
        1.  Add the new category to the **Table of Contents** at the top of the file (keep it in alphabetical order).
        2.  Add the new category section at its correct alphabetical position in the body of the `README.md`.

        **Template:**
        ```markdown
        ## New Category Name

        - [Tool Name](https://tool-url.com/) - A brief description. `#tag`

        **[⬆️ Back to Top](#table-of-contents)**
        ```

5.  **Commit your changes:**
    ```bash
    git add README.md
    git commit -m "feat: Add [Tool Name] to [Category]"
    ```
    (e.g., `feat: Add New AI Visualizer to Design Generator`)

6.  **Push to your branch:**
    ```bash
    git push origin feature/add-my-cool-tool
    ```

7.  **Create a Pull Request:** Go to the original repository on GitHub. You should see a button to create a new Pull Request from your forked branch. Fill out the PR template with details about your addition.

Thank you for your contribution!
