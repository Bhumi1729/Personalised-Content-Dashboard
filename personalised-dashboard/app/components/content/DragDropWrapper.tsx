'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface DragDropWrapperProps {
  items: { id: string | number }[];
  onDragEnd: (result: DropResult) => void;
  droppableId: string;
  children: (item: { id: string | number }, index: number, provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

const DragDropWrapper: React.FC<DragDropWrapperProps> = ({
  items,
  onDragEnd,
  droppableId,
  children,
  className = '',
  direction = 'vertical'
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId} direction={direction}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={className}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {children(item, index, provided, snapshot)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDropWrapper;