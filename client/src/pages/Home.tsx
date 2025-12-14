import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Github, 
  Search, 
  Loader2, 
  FileCode, 
  FolderTree, 
  GitBranch, 
  GitCommit, 
  FileText, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  BookOpen,
  Activity,
  Layers
} from "lucide-react";
import type { RepoAnalysisResponse } from "@shared/schema";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [result, setResult] = useState<RepoAnalysisResponse | null>(null);

  const validateUrl = (value: string) => {
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!value) {
      setUrlError("");
      return false;
    }
    if (!githubPattern.test(value)) {
      setUrlError("Please enter a valid GitHub repository URL");
      return false;
    }
    setUrlError("");
    return true;
  };

  const analyzeMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      const res = await apiRequest("POST", "/api/analyze", { url: repoUrl });
      return res.json() as Promise<RepoAnalysisResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      setUrlError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url)) {
      setResult(null);
      analyzeMutation.mutate(url);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "Intermediate":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30";
      case "Advanced":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-2";
    if (score >= 60) return "text-chart-4";
    if (score >= 40) return "text-chart-1";
    return "text-chart-5";
  };

  const radarData = result?.analysis?.dimensions
    ? [
        { dimension: "Code Quality", value: result.analysis.dimensions.codeQuality, fullMark: 100 },
        { dimension: "Documentation", value: result.analysis.dimensions.documentation, fullMark: 100 },
        { dimension: "Testing", value: result.analysis.dimensions.testing, fullMark: 100 },
        { dimension: "Activity", value: result.analysis.dimensions.activity, fullMark: 100 },
        { dimension: "Structure", value: result.analysis.dimensions.structure, fullMark: 100 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 right-0 p-4 z-50">
        <ThemeToggle />
      </header>

      <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-3/5 dark:from-primary/10 dark:via-background dark:to-chart-3/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Github className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Repository Mirror AI
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Analyze any GitHub repository with AI-powered insights. Get personalized scores, skill assessments, and actionable improvement roadmaps.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-chart-4" />
              AI-Powered Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-chart-2" />
              Quality Scoring
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-chart-3" />
              Personalized Roadmap
            </span>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) validateUrl(e.target.value);
                  }}
                  className="h-14 pl-12 font-mono text-base"
                  data-testid="input-repo-url"
                />
              </div>
              <Button
                type="submit"
                disabled={analyzeMutation.isPending || !url}
                className="h-14 px-8 text-base font-medium"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            
            <AnimatePresence>
              {urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 text-sm text-destructive flex items-center gap-2"
                  data-testid="text-url-error"
                >
                  <AlertCircle className="h-4 w-4" />
                  {urlError}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </section>

      <AnimatePresence>
        {analyzeMutation.isPending && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-16"
          >
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-muted animate-pulse" />
                    <motion.div
                      className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Analyzing Repository</h3>
                    <p className="text-muted-foreground">Cloning, scanning files, and generating insights...</p>
                  </div>
                  <Progress value={33} className="w-64" />
                </div>
              </Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="px-4 pb-16"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative p-8 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            className="text-muted"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="60"
                            cx="80"
                            cy="80"
                          />
                          <motion.circle
                            className={getScoreColor(result.analysis.score)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="60"
                            cx="80"
                            cy="80"
                            initial={{ strokeDasharray: "0 377" }}
                            animate={{
                              strokeDasharray: `${(result.analysis.score / 100) * 377} 377`,
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span
                            className={`text-5xl font-bold ${getScoreColor(result.analysis.score)}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            data-testid="text-score"
                          >
                            {result.analysis.score}
                          </motion.span>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                          <h2 className="text-2xl font-bold font-mono" data-testid="text-repo-name">
                            {result.metadata.owner}/{result.metadata.name}
                          </h2>
                          <Badge
                            className={`px-4 py-1.5 text-sm font-semibold ${getSkillLevelColor(result.analysis.skillLevel)}`}
                            data-testid="badge-skill-level"
                          >
                            {result.analysis.skillLevel}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed" data-testid="text-summary">
                          {result.analysis.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Repository Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <FileCode className="h-5 w-5 text-chart-1" />
                          <div>
                            <p className="text-2xl font-bold" data-testid="text-file-count">{result.metadata.fileCount}</p>
                            <p className="text-xs text-muted-foreground">Files</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <FolderTree className="h-5 w-5 text-chart-2" />
                          <div>
                            <p className="text-2xl font-bold" data-testid="text-folder-count">{result.metadata.folderCount}</p>
                            <p className="text-xs text-muted-foreground">Folders</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <GitCommit className="h-5 w-5 text-chart-3" />
                          <div>
                            <p className="text-2xl font-bold" data-testid="text-commit-count">{result.metadata.commitCount}</p>
                            <p className="text-xs text-muted-foreground">Commits</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <GitBranch className="h-5 w-5 text-chart-4" />
                          <div>
                            <p className="text-2xl font-bold" data-testid="text-branch-count">{result.metadata.branchCount}</p>
                            <p className="text-xs text-muted-foreground">Branches</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          {result.metadata.hasReadme ? (
                            <CheckCircle className="h-4 w-4 text-chart-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-chart-5" />
                          )}
                          <span className="text-sm">
                            README {result.metadata.hasReadme ? `(${result.metadata.readmeLength} chars)` : "missing"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.metadata.hasTests ? (
                            <CheckCircle className="h-4 w-4 text-chart-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-chart-5" />
                          )}
                          <span className="text-sm">
                            Tests {result.metadata.hasTests ? `(${result.metadata.testFileCount} files)` : "missing"}
                          </span>
                        </div>
                      </div>

                      {result.metadata.languages.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-2">Languages & Tech Stack</p>
                          <div className="flex flex-wrap gap-2">
                            {result.metadata.languages.map((lang, i) => (
                              <Badge key={i} variant="secondary" className="font-mono text-xs">
                                {lang}
                              </Badge>
                            ))}
                            {result.metadata.techStack.map((tech, i) => (
                              <Badge key={`tech-${i}`} variant="outline" className="font-mono text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Quality Dimensions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid className="stroke-muted" />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            />
                            <Radar
                              name="Score"
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Improvement Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4" data-testid="list-roadmap">
                      {result.analysis.roadmap.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover-elevate"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm leading-relaxed pt-1">{item}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>Powered by OpenAI GPT. Analyze any public GitHub repository.</p>
      </footer>
    </div>
  );
}
