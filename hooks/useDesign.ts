"use client";

import { useState, useRef } from 'react';
import { Design, DesignElement } from '@/types/database.types';

type ViewType = 'front' | 'back' | 'left' | 'right';

export function useDesign() {
  const [currentView, setCurrentView] = useState<ViewType>('front');
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [design, setDesign] = useState<Partial<Design> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateElement = (updatedElement: DesignElement) => {
    if (!design?.elements_by_view) return;

    const updatedElements = design.elements_by_view[currentView].map(element =>
      element.id === updatedElement.id ? updatedElement : element
    );

    setDesign(prev => {
      if (!prev?.elements_by_view) return prev;
      return {
        ...prev,
        elements_by_view: {
          ...prev.elements_by_view,
          [currentView]: updatedElements
        }
      };
    });
  };

  const deleteElement = (elementId: string) => {
    if (!design?.elements_by_view) return;

    const updatedElements = design.elements_by_view[currentView].filter(
      element => element.id !== elementId
    );

    setDesign(prev => {
      if (!prev?.elements_by_view) return prev;
      return {
        ...prev,
        elements_by_view: {
          ...prev.elements_by_view,
          [currentView]: updatedElements
        }
      };
    });

    setSelectedElement(null);
  };

  const addElement = (newElement: DesignElement) => {
    if (!design?.elements_by_view) return;

    setDesign(prev => {
      if (!prev?.elements_by_view) return prev;
      return {
        ...prev,
        elements_by_view: {
          ...prev.elements_by_view,
          [currentView]: [...prev.elements_by_view[currentView], newElement]
        }
      };
    });

    setSelectedElement(newElement);
  };

  return {
    currentView,
    setCurrentView,
    selectedElement,
    setSelectedElement,
    design,
    setDesign,
    canvasRef,
    updateElement,
    deleteElement,
    addElement,
  };
}
