"use client";

import { useState } from "react";
import { Plus, BarChart3, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Test {
  id: string;
  title: string;
  questions: number;
  passRate: number;
  submissions: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

interface TestResult {
  id: string;
  testName: string;
  score: number;
  totalPoints: number;
  submittedAt: string;
  status: "passed" | "failed";
}

const mockTests: Test[] = [
  {
    id: "1",
    title: "Basic JavaScript Fundamentals",
    questions: 15,
    passRate: 82,
    submissions: 142,
    difficulty: "easy",
    createdAt: "2024-04-10",
  },
  {
    id: "2",
    title: "React Hooks Advanced Patterns",
    questions: 12,
    passRate: 65,
    submissions: 87,
    difficulty: "hard",
    createdAt: "2024-04-08",
  },
  {
    id: "3",
    title: "CSS Grid & Flexbox Mastery",
    questions: 20,
    passRate: 78,
    submissions: 156,
    difficulty: "medium",
    createdAt: "2024-04-05",
  },
];

const mockResults: TestResult[] = [
  {
    id: "1",
    testName: "Basic JavaScript Fundamentals",
    score: 82,
    totalPoints: 100,
    submittedAt: "2024-04-15 10:30",
    status: "passed",
  },
  {
    id: "2",
    testName: "React Hooks Advanced Patterns",
    score: 58,
    totalPoints: 100,
    submittedAt: "2024-04-14 14:20",
    status: "failed",
  },
  {
    id: "3",
    testName: "CSS Grid & Flexbox Mastery",
    score: 95,
    totalPoints: 100,
    submittedAt: "2024-04-13 09:15",
    status: "passed",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100/50 text-green-700 border-green-200";
    case "medium":
      return "bg-yellow-100/50 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-100/50 text-red-700 border-red-200";
    default:
      return "bg-gray-100/50 text-gray-700 border-gray-200";
  }
};

export function TestingSection() {
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Testing Platform</h2>
            <p className="text-xs text-gray-500">Create, run, and grade tests in real-time</p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
              <DialogDescription>
                Set up a new test with multiple choice or essay questions
              </DialogDescription>
            </DialogHeader>
            <CreateTestForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/60 w-fit">
        {(["tests", "results"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "tests" ? "Available Tests" : "My Results"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === "tests" ? (
          <TestsList tests={mockTests} />
        ) : (
          <ResultsList results={mockResults} />
        )}
      </div>
    </div>
  );
}

function TestsList({ tests }: { tests: Test[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {tests.map((test) => (
        <div
          key={test.id}
          className="group p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 hover:border-blue-300/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition">
                {test.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{test.questions} questions</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(test.difficulty)}`}>
              {test.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-200/50">
              <p className="text-xs text-gray-500">Pass Rate</p>
              <p className="text-sm font-bold text-blue-600">{test.passRate}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-purple-500/10 border border-purple-200/50">
              <p className="text-xs text-gray-500">Submissions</p>
              <p className="text-sm font-bold text-purple-600">{test.submissions}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-indigo-500/10 border border-indigo-200/50">
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-xs font-bold text-indigo-600">{test.createdAt}</p>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
          >
            Start Test
          </Button>
        </div>
      ))}
    </div>
  );
}

function ResultsList({ results }: { results: TestResult[] }) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <div
          key={result.id}
          className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {result.status === "passed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-300 flex items-center justify-center">
                    <span className="text-xs text-red-600 font-bold">×</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {result.testName}
                  </p>
                  <p className="text-xs text-gray-500">{result.submittedAt}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {result.score}/{result.totalPoints}
              </p>
              <p className={`text-xs font-semibold ${
                result.status === "passed" ? "text-green-600" : "text-red-600"
              }`}>
                {result.status === "passed" ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateTestForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questionCount: 5,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Test Title</label>
        <input
          type="text"
          placeholder="e.g., JavaScript Basics"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          placeholder="Describe what this test covers..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Number of Questions</label>
        <input
          type="number"
          min="1"
          max="50"
          value={formData.questionCount}
          onChange={(e) =>
            setFormData({ ...formData, questionCount: parseInt(e.target.value) })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onClose();
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
        >
          Create Test
        </Button>
      </div>
    </div>
  );
}
