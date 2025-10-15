'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskPriority } from '@/types/task';
import TaskCard from './TaskCard';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newPriority: TaskPriority) => void;
  onTaskClick: (task: Task) => void;
}

const priorityConfig = {
  urgent_important: {
    title: 'Do First',
    description: 'Urgent & Important',
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-500 text-white',
    icon: '🚨',
  },
  urgent_not_important: {
    title: 'Delegate',
    description: 'Urgent & Not Important', 
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'bg-orange-500 text-white',
    icon: '⏰',
  },
  not_urgent_important: {
    title: 'Schedule',
    description: 'Not Urgent & Important',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-500 text-white',
    icon: '📅',
  },
  not_urgent_not_important: {
    title: 'Eliminate',
    description: 'Not Urgent & Not Important',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-500 text-white',
    icon: '🗑️',
  },
};

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  onTaskMove,
  onTaskClick,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newPriority = result.destination.droppableId as TaskPriority;
    
    onTaskMove(taskId, newPriority);
  };

  const getTasksByPriority = (priority: TaskPriority) => {
    return tasks.filter(task => task.priority === priority);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {(Object.keys(priorityConfig) as TaskPriority[]).map((priority) => {
          const config = priorityConfig[priority];
          const priorityTasks = getTasksByPriority(priority);
          
          return (
            <Droppable key={priority} droppableId={priority}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    min-h-[400px] rounded-lg border-2 transition-all duration-200
                    ${config.color}
                    ${snapshot.isDraggingOver ? 'border-dashed border-gray-400 bg-gray-100' : ''}
                  `}
                >
                  {/* Quadrant Header */}
                  <div className={`${config.headerColor} p-4 rounded-t-lg`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{config.title}</h3>
                        <p className="text-sm opacity-90">{config.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm opacity-75">
                        {priorityTasks.length} task{priorityTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className="p-4 space-y-3">
                    {priorityTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              transition-all duration-200
                              ${snapshot.isDragging ? 'opacity-75 rotate-2 scale-105' : ''}
                            `}
                            onClick={() => onTaskClick(task)}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {priorityTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-3xl mb-2">📋</div>
                        <p>No tasks in this quadrant</p>
                        <p className="text-sm mt-1">Drag tasks here to organize</p>
                      </div>
                    )}
                    
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default EisenhowerMatrix;