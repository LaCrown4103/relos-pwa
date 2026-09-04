'use client';

import { useState, useEffect } from 'react';
import { useCouple } from '@/lib/CoupleContext';
import {
  getDailyStatus,
  getSharedTasks,
  updateDailyStatus,
  updateSharedTask,
} from '@/lib/dataManager';
import { SharedTask } from '@/lib/types';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';

export const Dashboard = () => {
  const { coupleId, currentUser, partner } = useCouple();
  const [partnerAEnergy, setPartnerAEnergy] = useState(7);
  const [partnerBEnergy, setPartnerBEnergy] = useState(6);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const status = getDailyStatus(coupleId, new Date().toISOString().split('T')[0]);
    const allTasks = getSharedTasks(coupleId);

    if (status.length >= 2) {
      setPartnerAEnergy(status[0].energyLevel);
      setPartnerBEnergy(status[1].energyLevel);
    }

    setTasks(allTasks);
  }, [coupleId]);

  const handleEnergyChange = (userId: string, level: number) => {
    updateDailyStatus(coupleId, userId, level);
    if (currentUser?.id === userId) {
      setPartnerAEnergy(level);
    } else {
      setPartnerBEnergy(level);
    }
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    updateSharedTask(taskId, {
      completed: !completed,
      completedBy: currentUser?.id,
      completedAt: !completed ? new Date().toISOString() : undefined,
    });

    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !completed } : t
      )
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    // Mock add - in real app would use dataManager
    const newTask: SharedTask = {
      id: 'task_' + Date.now(),
      coupleId,
      title: newTaskTitle,
      category: 'household',
      assignedTo: 'both',
      completed: false,
      createdAt: new Date().toISOString(),
      mentalLoadTags: [],
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const tasksByCategory = {
    household: tasks.filter((t) => t.category === 'household'),
    admin: tasks.filter((t) => t.category === 'admin'),
    planning: tasks.filter((t) => t.category === 'planning'),
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'text-green-500';
    if (level >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const categoryLabels: Record<string, string> = {
    household: 'Haushalt',
    admin: 'Admin & Finanzen',
    planning: 'Planung',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="pt-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          {new Date().toLocaleDateString('de-CH', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Energy Tracker */}
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tagesenergie</h2>

        {/* Partner A */}
        <div className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">
              {currentUser?.name}
            </span>
            <span
              className={`text-2xl font-bold ${getEnergyColor(partnerAEnergy)}`}
            >
              {partnerAEnergy}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={partnerAEnergy}
            onChange={(e) =>
              handleEnergyChange(currentUser?.id || '', parseInt(e.target.value))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Sehr müde</span>
            <span>Super ausgeruht</span>
          </div>
        </div>

        {/* Partner B */}
        {partner && (
          <div className="card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">
                {partner?.name}
              </span>
              <span
                className={`text-2xl font-bold ${getEnergyColor(partnerBEnergy)}`}
              >
                {partnerBEnergy}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={partnerBEnergy}
              onChange={(e) =>
                handleEnergyChange(partner?.id || '', parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sehr müde</span>
              <span>Super ausgeruht</span>
            </div>
          </div>
        )}
      </div>

      {/* Shared Tasks */}
      <div className="px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Aufgaben</h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="btn-ghost flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm">Neu</span>
          </button>
        </div>

        {showAddTask && (
          <div className="card p-4 space-y-3">
            <input
              type="text"
              placeholder="Aufgabentitel..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="input-base"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleAddTask} className="btn-primary flex-1">
                Hinzufügen
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Tasks by category */}
        {Object.entries(tasksByCategory).map(([category, catTasks]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 px-2">
              {categoryLabels[category]}
            </h3>
            {catTasks.length === 0 ? (
              <p className="text-sm text-gray-400 px-2">Keine Aufgaben</p>
            ) : (
              catTasks.map((task) => (
                <div
                  key={task.id}
                  className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleTaskToggle(task.id, task.completed)}
                    className="flex-shrink-0 text-couple-primary hover:scale-110 transition-transform"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {task.assignedTo === 'both'
                        ? 'Beide'
                        : task.assignedTo === 'partner_a'
                        ? currentUser?.name
                        : partner?.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
