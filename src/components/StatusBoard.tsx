'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, statusConfig } from '@/types/task';
import TaskCard from './TaskCard';

interface StatusBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  highlight?: string;
}

const statusOrder: TaskStatus[] = ['todo', 'doing', 'on_hold', 'help_me', 'done'];

const columnColors: Record<TaskStatus, string> = {
  todo: 'border-gray-300',
  doing: 'border-blue-300',
  done: 'border-green-300',
  on_hold: 'border-yellow-300',
  help_me: 'border-purple-300',
};

const headerColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-500 text-white',
  doing: 'bg-blue-500 text-white',
  done: 'bg-green-500 text-white',
  on_hold: 'bg-yellow-500 text-white',
  help_me: 'bg-purple-500 text-white',
};

const StatusBoard: React.FC<StatusBoardProps> = ({
  tasks,
  onTaskMove,
  onTaskClick,
  highlight,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    
    onTaskMove(taskId, newStatus);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const statusTasks = getTasksByStatus(status);
            
            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-shrink-0 w-80 rounded-lg border-2 transition-all duration-200
                      ${columnColors[status]}
                      ${snapshot.isDraggingOver ? 'border-dashed border-gray-400 bg-gray-50' : ''}
                    `}
                  >
                    {/* Column Header */}
                    <div className={`${headerColors[status]} p-4 rounded-t-lg`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{config.label}</h3>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm opacity-90">
                          {statusTasks.length} task{statusTasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                      {statusTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">No tasks in this status</p>
                          <p className="text-xs mt-1">Drag tasks here to organize</p>
                        </div>
                      ) : (
                        statusTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => onTaskClick(task)}
                                  highlight={highlight}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

export default StatusBoard;
