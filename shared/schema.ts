import { z } from "zod";

export const githubUrlSchema = z.object({
  url: z.string().url().refine(
    (url) => /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/.test(url),
    { message: "Please enter a valid GitHub repository URL" }
  ),
});

export type GithubUrlInput = z.infer<typeof githubUrlSchema>;

export interface RepoMetadata {
  name: string;
  owner: string;
  fileCount: number;
  folderCount: number;
  hasReadme: boolean;
  readmeLength: number;
  hasTests: boolean;
  testFileCount: number;
  languages: string[];
  techStack: string[];
  commitCount: number;
  branchCount: number;
  lastCommitDate: string;
  folderStructure: string[];
}

export interface AnalysisResult {
  score: number;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  roadmap: string[];
  dimensions: {
    codeQuality: number;
    documentation: number;
    testing: number;
    activity: number;
    structure: number;
  };
}

export interface RepoAnalysisResponse {
  metadata: RepoMetadata;
  analysis: AnalysisResult;
}

export const analyzeRepoRequestSchema = z.object({
  url: z.string().url(),
});

export type AnalyzeRepoRequest = z.infer<typeof analyzeRepoRequestSchema>;
