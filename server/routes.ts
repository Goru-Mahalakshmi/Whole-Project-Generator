
import type { Express } from "express";
import { createServer, type Server } from "http";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import os from "os";
import OpenAI from "openai";
import { analyzeRepoRequestSchema } from "@shared/schema";
import type {
  RepoMetadata,
  AnalysisResult,
  RepoAnalysisResponse,
} from "@shared/schema";

// Initialize OpenAI only when an API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function analyzeRepository(repoPath: string): Promise<RepoMetadata> {
  const git = simpleGit(repoPath);

  let fileCount = 0;
  let folderCount = 0;
  let hasReadme = false;
  let readmeLength = 0;
  let hasTests = false;
  let testFileCount = 0;

  const languages = new Set<string>();
  const techStack = new Set<string>();
  const folderStructure: string[] = [];

  const languageExtensions: Record<string, string> = {
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".cs": "C#",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".vue": "Vue",
    ".svelte": "Svelte",
  };

  const techStackFiles: Record<string, string> = {
    "package.json": "Node.js",
    "requirements.txt": "Python",
    "Cargo.toml": "Rust",
    "go.mod": "Go",
    "pom.xml": "Maven",
    "build.gradle": "Gradle",
    "Gemfile": "Ruby",
    "composer.json": "PHP",
    "next.config.js": "Next.js",
    "next.config.ts": "Next.js",
    "nuxt.config.js": "Nuxt.js",
    "vue.config.js": "Vue.js",
    "angular.json": "Angular",
    "vite.config.ts": "Vite",
    "vite.config.js": "Vite",
    "webpack.config.js": "Webpack",
    "tailwind.config.js": "Tailwind CSS",
    "tailwind.config.ts": "Tailwind CSS",
    "docker-compose.yml": "Docker",
    "Dockerfile": "Docker",
    ".github/workflows": "GitHub Actions",
    "jest.config.js": "Jest",
    "pytest.ini": "Pytest",
    "tsconfig.json": "TypeScript",
  };

  function scanDirectory(
    dir: string,
    depth: number = 0,
    prefix: string = ""
  ): void {
    if (depth > 5) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      if (item.startsWith(".") && item !== ".github") continue;

      if (
        item === "node_modules" ||
        item === "__pycache__" ||
        item === "venv" ||
        item === ".git"
      ) {
        continue;
      }

      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        folderCount++;

        if (depth < 3) {
          folderStructure.push(`${prefix}${item}/`);
        }

        if (
          item.toLowerCase().includes("test") ||
          item === "__tests__" ||
          item === "spec" ||
          item === "specs"
        ) {
          hasTests = true;
        }

        if (item === ".github") {
          const workflowsPath = path.join(fullPath, "workflows");

          if (fs.existsSync(workflowsPath)) {
            techStack.add("GitHub Actions");
          }
        }

        scanDirectory(fullPath, depth + 1, `${prefix}  `);
      } else {
        fileCount++;

        const ext = path.extname(item).toLowerCase();

        if (languageExtensions[ext]) {
          languages.add(languageExtensions[ext]);
        }

        if (techStackFiles[item]) {
          techStack.add(techStackFiles[item]);
        }

        const lowerItem = item.toLowerCase();

        if (
          lowerItem === "readme.md" ||
          lowerItem === "readme.txt" ||
          lowerItem === "readme"
        ) {
          hasReadme = true;

          try {
            readmeLength = fs.readFileSync(fullPath, "utf-8").length;
          } catch {
            readmeLength = 0;
          }
        }

        if (
          lowerItem.includes("test") ||
          lowerItem.includes("spec") ||
          lowerItem.endsWith(".test.js") ||
          lowerItem.endsWith(".test.ts") ||
          lowerItem.endsWith(".spec.js") ||
          lowerItem.endsWith(".spec.ts") ||
          lowerItem.endsWith("_test.py") ||
          lowerItem.endsWith("_test.go")
        ) {
          hasTests = true;
          testFileCount++;
        }
      }
    }
  }

  scanDirectory(repoPath);

  let commitCount = 0;
  let branchCount = 0;
  let lastCommitDate = "";

  try {
    const log = await git.log();
    commitCount = log.total;
    lastCommitDate = log.latest?.date || "";
  } catch {
    commitCount = 0;
  }

  try {
    const branches = await git.branch();
    branchCount = branches.all.length;
  } catch {
    branchCount = 1;
  }

  const repoName = path.basename(repoPath);

  return {
    name: repoName,
    owner: "",
    fileCount,
    folderCount,
    hasReadme,
    readmeLength,
    hasTests,
    testFileCount,
    languages: Array.from(languages),
    techStack: Array.from(techStack),
    commitCount,
    branchCount,
    lastCommitDate,
    folderStructure: folderStructure.slice(0, 20),
  };
}

function generateFallbackAnalysis(metadata: RepoMetadata): AnalysisResult {
  let score = 50;

  if (metadata.hasReadme) score += 10;
  if (metadata.readmeLength > 500) score += 5;
  if (metadata.hasTests) score += 15;
  if (metadata.testFileCount > 5) score += 5;
  if (metadata.commitCount > 50) score += 5;
  if (metadata.commitCount > 200) score += 5;
  if (metadata.languages.length > 1) score += 5;
  if (metadata.techStack.length > 2) score += 5;

  score = Math.min(100, Math.max(0, score));

  let skillLevel: "Beginner" | "Intermediate" | "Advanced" = "Beginner";

  if (score >= 70) skillLevel = "Advanced";
  else if (score >= 50) skillLevel = "Intermediate";

  const roadmap: string[] = [];

  if (!metadata.hasReadme) {
    roadmap.push(
      "Add a comprehensive README.md with project description, installation instructions, and usage examples"
    );
  }

  if (!metadata.hasTests) {
    roadmap.push(
      "Add unit tests using a testing framework like Jest, Pytest, or Go testing"
    );
  }

  if (metadata.commitCount < 50) {
    roadmap.push(
      "Make more frequent, smaller commits to track changes better"
    );
  }

  if (metadata.techStack.length === 0) {
    roadmap.push(
      "Add proper configuration files (package.json, requirements.txt, etc.) for better project structure"
    );
  }

  if (metadata.branchCount < 2) {
    roadmap.push(
      "Use feature branches for better code organization and collaboration"
    );
  }

  if (roadmap.length === 0) {
    roadmap.push(
      "Continue maintaining high code quality and documentation standards"
    );
  }

  return {
    score,
    skillLevel,
    summary: `This repository contains ${metadata.fileCount} files across ${metadata.folderCount} folders. ${
      metadata.hasReadme
        ? "Documentation is present."
        : "No README found."
    } ${
      metadata.hasTests
        ? `Testing infrastructure exists with ${metadata.testFileCount} test files.`
        : "No tests detected."
    } The project uses ${metadata.languages.join(", ") || "unknown languages"}.`,
    roadmap,
    dimensions: {
      codeQuality: Math.min(
        100,
        40 + metadata.languages.length * 10 + metadata.techStack.length * 5
      ),
      documentation: metadata.hasReadme
        ? Math.min(100, 50 + Math.floor(metadata.readmeLength / 100))
        : 20,
      testing: metadata.hasTests
        ? Math.min(100, 40 + metadata.testFileCount * 10)
        : 10,
      activity: Math.min(100, 30 + Math.floor(metadata.commitCount / 5)),
      structure: Math.min(
        100,
        40 +
          Math.floor(metadata.folderCount / 2) +
          (metadata.folderStructure.length > 5 ? 20 : 0)
      ),
    },
  };
}

async function generateAIAnalysis(
  metadata: RepoMetadata
): Promise<AnalysisResult> {
  if (!openai) {
    console.log("No OpenAI API key, using fallback analysis");
    return generateFallbackAnalysis(metadata);
  }

  try {
    const prompt = `Analyze this GitHub repository and provide a detailed assessment.

Repository Metadata:
- Name: ${metadata.name}
- Files: ${metadata.fileCount}
- Folders: ${metadata.folderCount}
- Has README: ${metadata.hasReadme} (${metadata.readmeLength} characters)
- Has Tests: ${metadata.hasTests} (${metadata.testFileCount} test files)
- Languages: ${metadata.languages.join(", ") || "Unknown"}
- Tech Stack: ${metadata.techStack.join(", ") || "Unknown"}
- Commits: ${metadata.commitCount}
- Branches: ${metadata.branchCount}
- Folder Structure: ${metadata.folderStructure.join(", ")}

Provide your analysis in the following JSON format:
{
  "score": <number 0-100>,
  "skillLevel": "<Beginner|Intermediate|Advanced>",
  "summary": "<2-3 sentence summary of repo quality>",
  "roadmap": ["<improvement suggestion 1>", "<improvement suggestion 2>", "..."],
  "dimensions": {
    "codeQuality": <number 0-100>,
    "documentation": <number 0-100>,
    "testing": <number 0-100>,
    "activity": <number 0-100>,
    "structure": <number 0-100>
  }
}

Scoring guidelines:
- codeQuality: Based on file organization, tech stack maturity, and language diversity
- documentation: Based on README presence and length
- testing: Based on test file presence and count
- activity: Based on commit count and branch usage
- structure: Based on folder organization and project structure

Provide 3-5 actionable improvement suggestions in the roadmap.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer and software architect. Analyze repositories and provide constructive feedback. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    return {
      score: Math.max(0, Math.min(100, result.score || 50)),
      skillLevel: result.skillLevel || "Intermediate",
      summary: result.summary || "Analysis completed.",
      roadmap: result.roadmap || [],
      dimensions: {
        codeQuality: result.dimensions?.codeQuality || 50,
        documentation: result.dimensions?.documentation || 50,
        testing: result.dimensions?.testing || 50,
        activity: result.dimensions?.activity || 50,
        structure: result.dimensions?.structure || 50,
      },
    };
  } catch (aiError: unknown) {
    console.error("OpenAI API error, using fallback:", aiError);
    return generateFallbackAnalysis(metadata);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
      const parsed = analyzeRepoRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request: " + parsed.error.message,
        });
      }

      const { url } = parsed.data;

      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);

      if (!match) {
        return res.status(400).json({
          error: "Invalid GitHub URL format",
        });
      }

      const [, owner, repoName] = match;
      const cleanRepoName = repoName.replace(/\.git$/, "");

      // Create a unique temporary directory compatible with Windows
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "repo-analysis-")
      );

      try {
        const git = simpleGit();

        await git.clone(url, tmpDir, ["--depth", "100"]);

        const metadata = await analyzeRepository(tmpDir);

        metadata.owner = owner;
        metadata.name = cleanRepoName;

        const analysis = await generateAIAnalysis(metadata);

        const response: RepoAnalysisResponse = {
          metadata,
          analysis,
        };

        return res.json(response);
      } catch (cloneError: unknown) {
        const message =
          cloneError instanceof Error
            ? cloneError.message
            : "Unknown error";

        if (
          message.includes("not found") ||
          message.includes("does not exist")
        ) {
          return res.status(404).json({
            error:
              "Repository not found. Make sure it exists and is public.",
          });
        }

        throw cloneError;
      } finally {
        // Always remove the temporary directory after analysis
        try {
          fs.rmSync(tmpDir, {
            recursive: true,
            force: true,
          });
        } catch (cleanupError) {
          console.error(
            "Temporary directory cleanup failed:",
            cleanupError
          );
        }
      }
    } catch (error: unknown) {
      console.error("Analysis error:", error);

      const message =
        error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        error: "Analysis failed: " + message,
      });
    }
  });

  return httpServer;
}
