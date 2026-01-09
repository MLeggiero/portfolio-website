# Connecting Your Wix Domain (`markleggiero.com`)

Since you are using a custom domain, we need to point it from Wix to your GitHub Pages site.

## 1. Local Changes (Already Done)
I have already:
*   Created a `CNAME` file in your `public` folder with `markleggiero.com`.
*   Updated `vite.config.ts` directly to serve from the root `/` instead of a subdirectory.

## 2. GitHub Settings
1.  Go to your Repository on GitHub.
2.  Navigate to **Settings** > **Pages**.
3.  Under **Custom domain**, verify that `markleggiero.com` is listed inside the box (it should appear automatically after your next deploy).
4.  **Wait** until DNS checks pass (this step requires Step 3 to be done first).
5.  Check **"Enforce HTTPS"** once it becomes available.

## 3. Configure Wix DNS
You need to change where your domain points. This does **not** transfer the domain registration; it just tells the internet "markleggiero.com lives on GitHub now".

1.  Log in to Wix and go to **Domains**.
2.  Find `markleggiero.com` and click the `...` or **Manage**.
3.  Look for **DNS Records** (Advanced).
4.  **Update "A" (Host) Records**:
    *   Delete any existing "A" records pointing to Wix IP addresses.
    *   Add these 4 new "A" records (for Host `@`):
        *   `185.199.108.153`
        *   `185.199.109.153`
        *   `185.199.110.153`
        *   `185.199.111.153`
5.  **Update "CNAME" (Alias) Record**:
    *   Find the record for proper host `www`.
    *   Point it to: `<YOUR-GITHUB-USERNAME>.github.io` (e.g., `mleggiero.github.io`).

## 4. Deploy
Run the deploy command again to push these changes:
```bash
npm run deploy
```

Wait up to 24-48 hours for DNS changes to propagate (though it often happens in minutes).
