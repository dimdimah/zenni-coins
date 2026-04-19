'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Edit, Play, Clock, Users } from 'lucide-react';

const mockTests = [
  {
    id: 1,
    title: 'Advanced JavaScript Concepts',
    description: 'Test your knowledge of closures, async/await, and prototypes',
    questions: 25,
    duration: 45,
    students: 128,
    avgScore: 78,
    status: 'active',
    thumbnail: '📚',
  },
  {
    id: 2,
    title: 'React Fundamentals',
    description: 'Cover component basics, hooks, and state management',
    questions: 30,
    duration: 60,
    students: 95,
    avgScore: 85,
    status: 'active',
    thumbnail: '⚛️',
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    description: 'Explore color theory, typography, and user research',
    questions: 20,
    duration: 40,
    students: 67,
    avgScore: 88,
    status: 'draft',
    thumbnail: '🎨',
  },
  {
    id: 4,
    title: 'Database Design',
    description: 'Master SQL, normalization, and data modeling',
    questions: 28,
    duration: 50,
    students: 156,
    avgScore: 82,
    status: 'active',
    thumbnail: '🗄️',
  },
];

export default function TestsList() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">All Tests</h2>
        <div className="grid gap-4">
          {mockTests.map((test) => (
            <div
              key={test.id}
              className="group glass rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 text-3xl">
                  {test.thumbnail}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {test.title}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1">{test.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`w-fit flex-shrink-0 ${
                        test.status === 'active'
                          ? 'bg-success/20 text-success border-success/30'
                          : 'bg-warning/20 text-warning border-warning/30'
                      }`}
                    >
                      {test.status === 'active' ? 'Active' : 'Draft'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
                    <div>
                      <p className="text-xs text-foreground/50 mb-1">Questions</p>
                      <p className="font-semibold text-foreground">{test.questions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50 mb-1">Duration</p>
                      <p className="font-semibold text-foreground">{test.duration} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50 mb-1">Students</p>
                      <p className="font-semibold text-foreground">{test.students}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-foreground/50 mb-1">Avg Score</p>
                      <p className="font-semibold text-success">{test.avgScore}%</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap md:flex-col md:flex-nowrap flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 md:flex-none gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-xs">Run</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
