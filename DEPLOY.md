# How to Deploy to GitHub Pages

You are almost there! Follow these steps to get your site online.

1.  **Create a GitHub Repository**:
    *   Go to [github.com/new](https://github.com/new).
    *   Name the repository `portfolio-website`.
    *   **Do not** initialize with README, .gitignore, or License (keep it empty).

2.  **Update Configuration**:
    *   Open `package.json` in this folder.
    *   Find the line `"homepage": "https://<your-username>.github.io/portfolio-website"`.
    *   Replace `<your-username>` with your actual GitHub username.

3.  **Push and Deploy**:
    Open your terminal in WSL (or VS Code terminal) and run these commands one by one:

    ```bash
    cd portfolio-website
    
    # Initialize Git (if not done)
    git init
    git add .
    git commit -m "Initial commit"

    # Link to your new GitHub Repo (Replace USERNAME)
    git remote add origin https://github.com/USERNAME/portfolio-website.git
    git branch -M main
    git push -u origin main

    # Deploy!
    npm run deploy
    ```

4.  **Wait a Moment**:
    *   It may take a minute or two for GitHub Pages to refresh.
    *   Visit your site at `https://USERNAME.github.io/portfolio-website`.

## Updating Your Site
Whenever you make changes in the future:
1.  `npm run deploy`
2.  `git add .`
3.  `git commit -m "update"`
4.  `git push`
