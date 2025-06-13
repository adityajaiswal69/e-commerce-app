"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { DesignElement, TextElementData, ImageElementData } from '@/types/database.types';

export type CanvasState = {
  elements_by_view: {
    front: DesignElement[];
    back: DesignElement[];
    left: DesignElement[];
    right: DesignElement[];
  };
  selectedElementId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  productView: 'front' | 'back' | 'left' | 'right';
  history: {
    front: DesignElement[][];
    back: DesignElement[][];
    left: DesignElement[][];
    right: DesignElement[][];
  };
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  dragOffset: { x: number; y: number };
};

export type CanvasAction =
  | { type: 'ADD_TEXT'; payload: { x: number; y: number; text: string } }
  | { type: 'ADD_IMAGE'; payload: { x: number; y: number; src: string; width: number; height: number } }
  | { type: 'ADD_ELEMENT'; payload: DesignElement }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<DesignElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_ELEMENT'; payload: { id: string; width: number; height: number } }
  | { type: 'ROTATE_ELEMENT'; payload: { id: string; rotation: number } }
  | { type: 'UPDATE_TEXT_DATA'; payload: { id: string; textData: Partial<TextElementData> } }
  | { type: 'SWITCH_VIEW'; payload: 'front' | 'back' | 'left' | 'right' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'LOAD_DESIGN'; payload: DesignElement[] }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_RESIZING'; payload: boolean }
  | { type: 'SET_DRAG_OFFSET'; payload: { x: number; y: number } }
  | { type: 'COMMIT_CHANGES' };

const initialState: CanvasState = {  elements_by_view: {
    front: [],
    back: [],
    left: [],
    right: []
  },
  selectedElementId: null,
  canvasWidth: 600,
  canvasHeight: 600,
  productView: 'front',
  history: {
    front: [[]],
    back: [[]],
    left: [[]],
    right: [[]]
  },
  historyIndex: 0,
  isDragging: false,
  isResizing: false,
  dragOffset: { x: 0, y: 0 },
};

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function addToHistory(state: CanvasState, newElements: DesignElement[]): CanvasState {
  const view = state.productView;
  const newHistory = {
    ...state.history,
    [view]: [...state.history[view].slice(0, state.historyIndex + 1), [...newElements]]
  };
  
  return {
    ...state,
    history: newHistory,
    historyIndex: Math.min(newHistory[view].length - 1, 49),
  };
}

function updateViewElements(
  state: CanvasState,
  newElements: DesignElement[]
): CanvasState {
  const view = state.productView;
  return addToHistory(
    {
      ...state,
      elements_by_view: {
        ...state.elements_by_view,
        [view]: newElements
      }
    },
    newElements
  );
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  const view = state.productView;
  const currentElements = state.elements_by_view[view];

  switch (action.type) {
    case 'ADD_TEXT': {
      const fontSize = 24;
      const text = action.payload.text;
      const estimatedWidth = Math.max(200, text.length * fontSize * 0.6);
      const estimatedHeight = fontSize * 1.5;

      const newElement: DesignElement = {
        id: generateId(),
        type: 'text',
        x: action.payload.x,
        y: action.payload.y,
        width: estimatedWidth,
        height: estimatedHeight,
        rotation: 0,
        data: {
          text: action.payload.text,
          fontSize: fontSize,
          fontFamily: 'Arial',
          color: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left',
        } as TextElementData,
      };

      return updateViewElements(state, [...currentElements, newElement]);
    }

    case 'ADD_IMAGE': {
      const newElement: DesignElement = {
        id: generateId(),
        type: 'image',
        x: action.payload.x,
        y: action.payload.y,
        width: action.payload.width,
        height: action.payload.height,
        rotation: 0,
        data: {
          src: action.payload.src,
          originalWidth: action.payload.width,
          originalHeight: action.payload.height,
        } as ImageElementData,
      };

      return updateViewElements(state, [...currentElements, newElement]);
    }

    case 'ADD_ELEMENT': {
      return updateViewElements(state, [...currentElements, action.payload]);
    }

    case 'SELECT_ELEMENT': {
      return {
        ...state,
        selectedElementId: action.payload,
      };
    }

    case 'UPDATE_ELEMENT': {
      const newElements = currentElements.map((el: DesignElement) =>
        el.id === action.payload.id
          ? { ...el, ...action.payload.updates }
          : el
      );

      return updateViewElements(state, newElements);
    }

    case 'DELETE_ELEMENT': {
      const newElements = currentElements.filter((el: DesignElement) => el.id !== action.payload);
      return updateViewElements(state, newElements);
    }

    case 'MOVE_ELEMENT': {
      const newElements = currentElements.map((el: DesignElement) =>
        el.id === action.payload.id
          ? { ...el, x: action.payload.x, y: action.payload.y }
          : el
      );

      return updateViewElements(state, newElements);
    }

    case 'RESIZE_ELEMENT': {
      const newElements = currentElements.map((el: DesignElement) =>
        el.id === action.payload.id
          ? { ...el, width: action.payload.width, height: action.payload.height }
          : el
      );

      return updateViewElements(state, newElements);
    }

    case 'ROTATE_ELEMENT': {
      const newElements = currentElements.map((el: DesignElement) =>
        el.id === action.payload.id
          ? { ...el, rotation: action.payload.rotation }
          : el
      );
      
      return updateViewElements(state, newElements);
    }

    case 'UPDATE_TEXT_DATA': {
      const newElements = currentElements.map((el: DesignElement) =>
        el.id === action.payload.id && el.type === 'text'
          ? { ...el, data: { ...el.data, ...action.payload.textData } }
          : el
      );
      
      return updateViewElements(state, newElements);
    }

    case 'SWITCH_VIEW': {
      return {
        ...state,
        productView: action.payload,
        selectedElementId: null // Clear selection when switching views
      };
    }

    case 'UNDO': {
      const view = state.productView;
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          elements_by_view: {
            ...state.elements_by_view,
            [view]: [...state.history[view][newIndex]]
          },
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    }

    case 'REDO': {
      const view = state.productView;
      if (state.historyIndex < state.history[view].length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          elements_by_view: {
            ...state.elements_by_view,
            [view]: [...state.history[view][newIndex]]
          },
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    }

    case 'CLEAR_CANVAS': {
      const newElements: DesignElement[] = [];
      return updateViewElements({
        ...state,
        selectedElementId: null,
      }, newElements);
    }

    case 'LOAD_DESIGN':
      return updateViewElements({
        ...state,
        selectedElementId: null,
      }, action.payload);

    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload,
      };

    case 'SET_RESIZING':
      return {
        ...state,
        isResizing: action.payload,
      };

    case 'SET_DRAG_OFFSET':
      return {
        ...state,
        dragOffset: action.payload,
      };

    default:
      return state;
  }
}

type DesignContextType = {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  addText: (x: number, y: number, text?: string) => void;
  addImage: (x: number, y: number, src: string, width: number, height: number) => void;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  updateTextData: (id: string, textData: Partial<TextElementData>) => void;
  switchView: (view: 'front' | 'back' | 'left' | 'right') => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  loadDesign: (elements: DesignElement[]) => void;
  commitChanges: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const addText = useCallback((x: number, y: number, text = 'New Text') => {
    dispatch({ type: 'ADD_TEXT', payload: { x, y, text } });
  }, []);

  const addImage = useCallback((x: number, y: number, src: string, width: number, height: number) => {
    dispatch({ type: 'ADD_IMAGE', payload: { x, y, src, width, height } });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: id });
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
  }, []);

  const resizeElement = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_ELEMENT', payload: { id, width, height } });
  }, []);

  const rotateElement = useCallback((id: string, rotation: number) => {
    dispatch({ type: 'ROTATE_ELEMENT', payload: { id, rotation } });
  }, []);

  const updateTextData = useCallback((id: string, textData: Partial<TextElementData>) => {
    dispatch({ type: 'UPDATE_TEXT_DATA', payload: { id, textData } });
  }, []);

  const switchView = useCallback((view: 'front' | 'back' | 'left' | 'right') => {
    dispatch({ type: 'SWITCH_VIEW', payload: view });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clearCanvas = useCallback(() => {
    dispatch({ type: 'CLEAR_CANVAS' });
  }, []);

  const loadDesign = useCallback((elements: DesignElement[]) => {
    dispatch({ type: 'LOAD_DESIGN', payload: elements });
  }, []);

  const commitChanges = useCallback(() => {
    dispatch({ type: 'COMMIT_CHANGES' });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history[state.productView].length - 1;

  const value: DesignContextType = {
    state,
    dispatch,
    addText,
    addImage,
    selectElement,
    updateElement,
    deleteElement,
    moveElement,
    resizeElement,
    rotateElement,
    updateTextData,
    switchView,
    undo,
    redo,
    clearCanvas,
    loadDesign,
    commitChanges,
    canUndo,
    canRedo,
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
