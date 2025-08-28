"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Target, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Goal {
  id: number;
  title: string;
  description?: string;
  category?: string;
  timeframe?: string;
  completed: boolean;
  created_at: string;
}

interface GoalsProps {
  student: any;
  currentUser?: any;
  goals?: any[];
  isViewMode?: boolean;
}

const Goals: React.FC<GoalsProps> = ({ student, currentUser, goals = [], isViewMode = false }) => {
  const router = useRouter();
  const [internalGoals, setInternalGoals] = useState<Goal[]>(goals);
  const isOwnProfile = currentUser && currentUser.id === student?.id;

  useEffect(() => {
    // Update internal state if the prop changes
    setInternalGoals(goals);
  }, [goals]);

  const handleManage = () => {
    router.push("/student/profile/edit?section=goals");
  };

  if (internalGoals.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
            <p className="text-gray-600 dark:text-gray-400">Track your aspirations and achievements</p>
          </div>
          {isOwnProfile && !isViewMode && (
            <Button variant="outline" size="sm" onClick={handleManage}>
              <Plus className="h-4 w-4 mr-2" />
              Manage
            </Button>
          )}
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals added yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isOwnProfile
                ? "Add your first goal to start tracking your aspirations and achievements."
                : "This user hasn't added any goals yet."
              }
            </p>
            {isOwnProfile && !isViewMode && (
              <Button className="mt-4 bg-pathpiper-teal hover:bg-pathpiper-teal/90" onClick={handleManage}>
                Add Your First Goal
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your aspirations and achievements</p>
        </div>
        {isOwnProfile && !isViewMode && (
          <Button variant="outline" size="sm" onClick={handleManage}>
            <Plus className="h-4 w-4 mr-2" />
            Manage
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {internalGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
              goal.completed
                ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Target className="h-5 w-5 text-pathpiper-teal" />
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {goal.title}
                  </h3>
                  {goal.completed && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                      Completed
                    </span>
                  )}
                </div>

                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {goal.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {goal.category && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{goal.category}</span>
                    </div>
                  )}
                  {goal.timeframe && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{goal.timeframe}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Added {new Date(goal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Goals;