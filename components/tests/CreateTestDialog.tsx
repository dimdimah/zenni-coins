'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface CreateTestDialogProps {
  onClose: () => void;
}

export default function CreateTestDialog({ onClose }: CreateTestDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 45,
    questions: 20,
  });

  const handleSubmit = () => {
    if (formData.title && formData.description) {
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-black/30 backdrop-blur">
          <h2 className="text-xl font-bold">Create New Test</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/30 text-primary font-semibold text-sm">
                  1
                </div>
                <div className="flex-1 h-1 bg-white/10 rounded-full"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-foreground/50 font-semibold text-sm">
                  2
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-foreground/60 text-sm">
                  Provide the core details for your test
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                    Test Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced JavaScript Concepts"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-white/10 border-white/20 placeholder:text-foreground/40"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    placeholder="What is this test about?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium mb-2 block">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="questions" className="text-sm font-medium mb-2 block">
                      Number of Questions
                    </Label>
                    <Input
                      id="questions"
                      type="number"
                      value={formData.questions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          questions: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.description}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/30 text-primary font-semibold text-sm">
                  ✓
                </div>
                <div className="flex-1 h-1 bg-primary/30 rounded-full"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/30 text-primary font-semibold text-sm">
                  2
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-semibold">Add Questions</h3>
                <p className="text-foreground/60 text-sm">
                  Build your test with {formData.questions} questions
                </p>
              </div>

              {/* Question Placeholder */}
              <div className="space-y-3">
                {Array.from({ length: Math.min(3, formData.questions) }).map((_, i) => (
                  <div key={i} className="glass rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/30 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-white/5 rounded w-full"></div>
                          <div className="h-3 bg-white/5 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {formData.questions > 3 && (
                  <div className="text-center py-4">
                    <p className="text-foreground/60 text-sm">
                      +{formData.questions - 3} more questions
                    </p>
                  </div>
                )}
              </div>

              {/* Button to add questions */}
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <Plus className="w-6 h-6 text-primary/60 mx-auto mb-2" />
                <p className="text-sm text-foreground/60">
                  Import questions or add them manually in the editor
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Create Test
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
