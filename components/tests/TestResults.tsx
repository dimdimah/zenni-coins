'use client';

import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockResults = [
  {
    id: 1,
    studentName: 'Sarah Johnson',
    test: 'Advanced JavaScript',
    score: 92,
    date: '2024-04-15',
    timeSpent: '42 min',
    status: 'passed',
  },
  {
    id: 2,
    studentName: 'Alex Chen',
    test: 'React Fundamentals',
    score: 88,
    date: '2024-04-14',
    timeSpent: '55 min',
    status: 'passed',
  },
  {
    id: 3,
    studentName: 'Emma Davis',
    test: 'UI/UX Design',
    score: 76,
    date: '2024-04-14',
    timeSpent: '38 min',
    status: 'passed',
  },
  {
    id: 4,
    studentName: 'James Wilson',
    test: 'Database Design',
    score: 65,
    date: '2024-04-13',
    timeSpent: '48 min',
    status: 'needs-review',
  },
  {
    id: 5,
    studentName: 'Olivia Brown',
    test: 'Advanced JavaScript',
    score: 58,
    date: '2024-04-13',
    timeSpent: '45 min',
    status: 'needs-review',
  },
];

const scoreDistribution = [
  { range: '90-100', count: 24 },
  { range: '80-89', count: 38 },
  { range: '70-79', count: 32 },
  { range: '60-69', count: 18 },
  { range: '0-59', count: 8 },
];

const trendData = [
  { week: 'Week 1', avgScore: 75 },
  { week: 'Week 2', avgScore: 78 },
  { week: 'Week 3', avgScore: 81 },
  { week: 'Week 4', avgScore: 79 },
  { week: 'Week 5', avgScore: 84 },
  { week: 'Week 6', avgScore: 86 },
];

export default function TestResults() {
  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 20, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="oklch(0.65 0.25 262.5)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Average Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 20, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="oklch(0.72 0.16 142)"
                dot={{ fill: 'oklch(0.72 0.16 142)', r: 5 }}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Results */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Recent Results
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Student
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Test
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Score
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Time
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Date
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground/70">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-foreground">{result.studentName}</td>
                  <td className="py-4 px-4 text-sm text-foreground/80">{result.test}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`font-semibold ${
                        result.score >= 80 ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {result.score}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground/80">
                    {result.timeSpent}
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground/80">{result.date}</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={
                        result.status === 'passed'
                          ? 'bg-success/20 text-success border-success/30'
                          : 'bg-warning/20 text-warning border-warning/30'
                      }
                    >
                      {result.status === 'passed' ? 'Passed' : 'Review'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
