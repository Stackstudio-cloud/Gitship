import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  static getAuthUrl() {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      throw new Error("GITHUB_CLIENT_ID environment variable is required");
    }
    
    const scopes = ["repo", "user:email"].join(",");
    const state = Math.random().toString(36).substring(7);
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scopes}&state=${state}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error("GitHub OAuth credentials not configured");
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`);
    }

    return data.access_token;
  }

  async getCurrentUser() {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data;
  }

  async getUserRepositories() {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });
    return data;
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  }

  async getBranches(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.listBranches({
      owner,
      repo,
    });
    return data;
  }

  async getRepositoryContent(owner: string, repo: string, path: string = "", ref?: string) {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    return data;
  }

  async createWebhook(owner: string, repo: string, webhookUrl: string) {
    try {
      const { data } = await this.octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: process.env.GITHUB_WEBHOOK_SECRET,
        },
        events: ["push", "pull_request"],
      });
      return data;
    } catch (error: any) {
      if (error.status === 422) {
        // Webhook already exists
        const { data: webhooks } = await this.octokit.rest.repos.listWebhooks({
          owner,
          repo,
        });
        
        const existingWebhook = webhooks.find(w => 
          w.config?.url === webhookUrl
        );
        
        if (existingWebhook) {
          return existingWebhook;
        }
      }
      throw error;
    }
  }

  static parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
    // Support both https://github.com/owner/repo and git@github.com:owner/repo.git formats
    const httpsMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/);
    const sshMatch = url.match(/git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/);
    
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    }
    
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }
    
    return null;
  }

  async detectFramework(owner: string, repo: string): Promise<string> {
    try {
      // Check package.json first
      const packageJson = await this.getRepositoryContent(owner, repo, "package.json");
      
      if (Array.isArray(packageJson)) {
        return 'static'; // Directory instead of file
      }

      if (packageJson.type === 'file' && packageJson.content) {
        const content = Buffer.from(packageJson.content, 'base64').toString();
        const pkg = JSON.parse(content);
        
        // Check dependencies for framework detection
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.next) return 'nextjs';
        if (deps.nuxt) return 'nuxt';
        if (deps['@remix-run/node'] || deps['@remix-run/serve']) return 'remix';
        if (deps.astro) return 'astro';
        if (deps.gatsby) return 'gatsby';
        if (deps.vite && deps.vue) return 'vue';
        if (deps.vite && deps.svelte) return 'svelte';
        if (deps['@angular/core']) return 'angular';
        if (deps.react) return 'react';
        if (deps.vue) return 'vue';
      }
      
      // Check for framework-specific files
      const files = await this.getRepositoryContent(owner, repo);
      if (Array.isArray(files)) {
        const fileNames = files.map(f => f.name);
        
        if (fileNames.includes('next.config.js') || fileNames.includes('next.config.ts')) return 'nextjs';
        if (fileNames.includes('nuxt.config.js') || fileNames.includes('nuxt.config.ts')) return 'nuxt';
        if (fileNames.includes('remix.config.js')) return 'remix';
        if (fileNames.includes('astro.config.js') || fileNames.includes('astro.config.mjs')) return 'astro';
        if (fileNames.includes('gatsby-config.js')) return 'gatsby';
        if (fileNames.includes('vite.config.js') || fileNames.includes('vite.config.ts')) return 'vite';
        if (fileNames.includes('angular.json')) return 'angular';
        if (fileNames.includes('svelte.config.js')) return 'svelte';
      }
      
      return 'static';
    } catch (error) {
      console.warn('Framework detection failed:', error);
      return 'static';
    }
  }

  async getLatestCommit(owner: string, repo: string, branch: string = 'main') {
    try {
      const { data } = await this.octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });
      return data.commit;
    } catch (error) {
      // Try 'master' branch if 'main' fails
      if (branch === 'main') {
        return this.getLatestCommit(owner, repo, 'master');
      }
      throw error;
    }
  }

  async downloadRepository(owner: string, repo: string, ref: string = 'main'): Promise<Buffer> {
    const { data } = await this.octokit.rest.repos.downloadZipballArchive({
      owner,
      repo,
      ref,
    });
    return Buffer.from(data as ArrayBuffer);
  }

  async downloadRepository(owner: string, repo: string, ref: string = "main") {
    const { data } = await this.octokit.rest.repos.downloadZipballArchive({
      owner,
      repo,
      ref,
    });
    return data;
  }

  static parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
    const githubRegex = /github\.com[\/:]([^\/]+)\/([^\/\.]+)/;
    const match = url.match(githubRegex);
    
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
    
    return null;
  }

  async detectFramework(owner: string, repo: string): Promise<string | null> {
    try {
      const packageJson = await this.getRepositoryContent(owner, repo, "package.json");
      
      if (Array.isArray(packageJson) || packageJson.type !== "file") {
        return null;
      }

      const content = Buffer.from(packageJson.content, "base64").toString("utf-8");
      const pkg = JSON.parse(content);
      
      const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (dependencies.next) return "nextjs";
      if (dependencies.nuxt) return "nuxt";
      if (dependencies.astro) return "astro";
      if (dependencies.svelte || dependencies["@sveltejs/kit"]) return "svelte";
      if (dependencies.vue) return "vue";
      if (dependencies.react) return "react";
      if (dependencies.gatsby) return "gatsby";
      if (dependencies["@angular/core"]) return "angular";
      
      return "static";
    } catch (error) {
      // If we can't detect framework, default to static
      return "static";
    }
  }
}