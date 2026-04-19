'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, BarChart3, Clock, Users, ChevronRight } from 'lucide-react';
import TestsList from '@/components/tests/TestsList';
import CreateTestDialog from '@/components/tests/CreateTestDialog';
import TestResults from '@/components/tests/TestResults';

export default function TestsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'results'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 pb-20 md:pb-0">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="gradient-text text-3xl md:text-4xl font-bold mb-2">
                Evaly
              </h1>
              <p className="text-foreground/60 text-sm md:text-base">
                Create, run, and grade tests in real-time. Build comprehensive assessments effortlessly.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 w-full md:w-auto"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Test
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs md:text-sm">Total Tests</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">12</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs md:text-sm">Completed</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">8</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <Play className="w-5 h-5 md:w-6 md:h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs md:text-sm">Avg. Score</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">82%</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs md:text-sm">Students</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">342</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* View Switcher */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'overview'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveView('results')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'results'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Results</span>
          </button>
        </div>

        {/* Content */}
        {activeView === 'overview' ? (
          <TestsList />
        ) : (
          <TestResults />
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateTestDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}
