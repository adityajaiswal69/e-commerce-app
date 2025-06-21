"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { DesignElement, TextElementData, ImageElementData, Product } from '@/types/database.types';

interface DesignCanvasProps {
  product: Product;
  className?: string;
}

export default function DesignCanvas({ product, className = '' }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch, selectElement, moveElement, commitChanges, setCanvasRef } = useDesign();

  // Register canvas ref with context
  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  const [productImage, setProductImage] = useState<HTMLImageElement | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  // Get current view elements
  const getCurrentViewElements = useCallback(() => {
    return state.elements_by_view[state.productView] || [];
  }, [state.elements_by_view, state.productView]);

  // Clear selection when changing views
  useEffect(() => {
    selectElement(null);
  }, [state.productView, selectElement]);

  // Get current product image URL based on view
  const getCurrentProductImageUrl = () => {
    switch (state.productView) {
      case 'front':
        return product.front_image_url || product.image_url;
      case 'back':
        return product.back_image_url || product.image_url;
      case 'left':
        return product.left_image_url || product.image_url;
      case 'right':
        return product.right_image_url || product.image_url;
      default:
        return product.image_url;
    }
  };

  // Load product image
  useEffect(() => {
    const imageUrl = getCurrentProductImageUrl();
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setProductImage(img);
    img.src = imageUrl;
  }, [product, state.productView]);    // Load element images
  useEffect(() => {
    const currentElements = getCurrentViewElements();
    const imageElements = currentElements.filter(el => el.type === 'image');
    
    imageElements.forEach(element => {
      const imageData = element.data as ImageElementData;
      if (!loadedImages.has(imageData.src)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => new Map(prev.set(imageData.src, img)));
        };
        img.src = imageData.src;
      }
    });
  }, [getCurrentViewElements, loadedImages]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !productImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw product image as background
    ctx.drawImage(productImage, 0, 0, canvas.width, canvas.height);    // Draw elements for current view
    const currentElements = getCurrentViewElements();
    currentElements.forEach(element => {
      ctx.save();
      
      // Apply transformations
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      if (element.type === 'text') {
        const textData = element.data as TextElementData;

        // Set text properties
        ctx.font = `${textData.fontStyle} ${textData.fontWeight} ${textData.fontSize}px ${textData.fontFamily}`;
        ctx.fillStyle = textData.color;
        ctx.textAlign = textData.textAlign as CanvasTextAlign;
        ctx.textBaseline = 'top';

        // Draw text background for debugging (optional)
        if (state.selectedElementId === element.id) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = textData.color;
        }

        // Draw text
        const lines = textData.text.split('\n');
        const lineHeight = textData.fontSize * 1.2;

        lines.forEach((line, index) => {
          let textX = element.x;
          if (textData.textAlign === 'center') {
            textX = element.x + element.width / 2;
          } else if (textData.textAlign === 'right') {
            textX = element.x + element.width;
          }

          ctx.fillText(line, textX, element.y + index * lineHeight);
        });
      } else if (element.type === 'image') {
        const imageData = element.data as ImageElementData;
        const img = loadedImages.get(imageData.src);
        
        if (img) {
          ctx.drawImage(img, element.x, element.y, element.width, element.height);
        }
      }

      ctx.restore();
    });
  }, [productImage, getCurrentViewElements, loadedImages]);

  // Redraw canvas when state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If the target is an input or textarea, don't handle the event
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected element only when Delete key is pressed or Backspace when not in text input
      if (state.selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        dispatch({ type: 'DELETE_ELEMENT', payload: state.selectedElementId });
        return;
      }

      // Undo/Redo shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          dispatch({ type: 'UNDO' });
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        }
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        selectElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedElementId, dispatch, selectElement]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;    console.log('Canvas click at:', x, y);
    const currentElements = getCurrentViewElements();
    console.log('Available elements:', currentElements);

    // Find clicked element (reverse order to check top elements first)
    const clickedElement = [...currentElements].reverse().find(element => {
      const isInside = (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      );
      console.log(`Element ${element.id} (${element.type}):`, {
        bounds: { x: element.x, y: element.y, width: element.width, height: element.height },
        isInside
      });
      return isInside;
    });

    console.log('Clicked element:', clickedElement?.id || 'none');
    selectElement(clickedElement?.id || null);
  }, [getCurrentViewElements, selectElement]);

  // Handle double click to add text
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;    // Check if we're not clicking on an existing element in current view
    const currentElements = getCurrentViewElements();
    const clickedElement = currentElements.find(element => {
      return (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      );
    });

    if (!clickedElement) {
      dispatch({ type: 'ADD_TEXT', payload: { x: x - 100, y: y - 20, text: 'New Text' } });
    }
  }, [getCurrentViewElements, dispatch]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!state.selectedElementId) return;    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;    const currentElements = getCurrentViewElements();
    const selectedElement = currentElements.find((el: DesignElement) => el.id === state.selectedElementId);
    if (!selectedElement) return;

    // Check if clicking on resize handle (check overlay handles)
    const handles = [
      { position: 'nw', x: selectedElement.x - 6, y: selectedElement.y - 6 },
      { position: 'ne', x: selectedElement.x + selectedElement.width - 6, y: selectedElement.y - 6 },
      { position: 'sw', x: selectedElement.x - 6, y: selectedElement.y + selectedElement.height - 6 },
      { position: 'se', x: selectedElement.x + selectedElement.width - 6, y: selectedElement.y + selectedElement.height - 6 },
    ];

    const clickedHandle = handles.find(handle => {
      const distance = Math.sqrt(
        Math.pow(x - (handle.x + 6), 2) + Math.pow(y - (handle.y + 6), 2)
      );
      return distance <= 12; // Handle hit area
    });

    if (clickedHandle) {
      console.log('Clicked resize handle:', clickedHandle.position);
      setResizeHandle(clickedHandle.position);
      setInitialSize({ width: selectedElement.width, height: selectedElement.height });
      setInitialMousePos({ x, y: y });
      dispatch({ type: 'SET_RESIZING', payload: true });
      e.preventDefault();
      e.stopPropagation();
    } else if (
      x >= selectedElement.x &&
      x <= selectedElement.x + selectedElement.width &&
      y >= selectedElement.y &&
      y <= selectedElement.y + selectedElement.height
    ) {
      // Start dragging
      console.log('Starting drag');
      setIsMouseDown(true);
      setDragStart({ x: x - selectedElement.x, y: y - selectedElement.y });
      dispatch({ type: 'SET_DRAGGING', payload: true });
      dispatch({ type: 'SET_DRAG_OFFSET', payload: { x: x - selectedElement.x, y: y - selectedElement.y } });
    }
  }, [state.selectedElementId, getCurrentViewElements, dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !state.selectedElementId) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentElements = getCurrentViewElements();
    const selectedElement = currentElements.find((el: DesignElement) => el.id === state.selectedElementId);
    if (!selectedElement) return;

    if (state.isResizing && resizeHandle) {
      console.log('Resizing with handle:', resizeHandle, 'mouse:', x, y);

      // Calculate new dimensions based on mouse position
      let newWidth = selectedElement.width;
      let newHeight = selectedElement.height;
      let newX = selectedElement.x;
      let newY = selectedElement.y;

      const deltaX = x - initialMousePos.x;
      const deltaY = y - initialMousePos.y;

      switch (resizeHandle) {
        case 'nw':
          newWidth = initialSize.width - deltaX;
          newHeight = initialSize.height - deltaY;
          newX = initialMousePos.x + deltaX - 6; // Adjust for handle offset
          newY = initialMousePos.y + deltaY - 6;
          break;
        case 'ne':
          newWidth = initialSize.width + deltaX;
          newHeight = initialSize.height - deltaY;
          newY = initialMousePos.y + deltaY - 6;
          break;
        case 'sw':
          newWidth = initialSize.width - deltaX;
          newHeight = initialSize.height + deltaY;
          newX = initialMousePos.x + deltaX - 6;
          break;
        case 'se':
          newWidth = initialSize.width + deltaX;
          newHeight = initialSize.height + deltaY;
          break;
      }

      // Apply minimum size constraints
      const minWidth = selectedElement.type === 'text' ? 50 : 20;
      const minHeight = selectedElement.type === 'text' ? 20 : 20;

      newWidth = Math.max(minWidth, newWidth);
      newHeight = Math.max(minHeight, newHeight);

      // For images, maintain aspect ratio
      if (selectedElement.type === 'image') {
        // Use the smaller scale to maintain aspect ratio
        const scaleX = newWidth / initialSize.width;
        const scaleY = newHeight / initialSize.height;
        const scale = Math.min(scaleX, scaleY);

        newWidth = initialSize.width * scale;
        newHeight = initialSize.height * scale;
      }

      // For text elements, update font size proportionally
      if (selectedElement.type === 'text') {
        const scaleY = newHeight / initialSize.height;
        const baseFontSize = 24; // Base font size when element was created
        const newFontSize = Math.max(8, Math.round(baseFontSize * scaleY));

        dispatch({
          type: 'UPDATE_TEXT_DATA',
          payload: {
            id: selectedElement.id,
            textData: { fontSize: newFontSize }
          }
        });
      }

      // Update element
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          id: state.selectedElementId,
          updates: {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY
          }
        }
      });
    } else if (state.isDragging && isMouseDown) {
      // Handle dragging
      const newX = Math.max(0, Math.min(x - dragStart.x, canvas.width - selectedElement.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, canvas.height - selectedElement.height));

      moveElement(state.selectedElementId, newX, newY);
    }
  }, [
    state.selectedElementId,
    getCurrentViewElements,
    state.isDragging,
    state.isResizing,
    isMouseDown,
    dragStart,
    resizeHandle,
    initialSize,
    initialMousePos,
    moveElement,
    dispatch,
  ]);

  const handleMouseUp = useCallback(() => {
    const wasDragging = state.isDragging;
    const wasResizing = state.isResizing;

    setIsMouseDown(false);
    setResizeHandle(null);
    dispatch({ type: 'SET_DRAGGING', payload: false });
    dispatch({ type: 'SET_RESIZING', payload: false });

    // Commit changes to history when drag or resize operation ends
    if (wasDragging || wasResizing) {
      commitChanges();
    }
  }, [dispatch, state.isDragging, state.isResizing, commitChanges]);



  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        width={state.canvasWidth}
        height={state.canvasHeight}
        className="border border-gray-300 cursor-crosshair block"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Selection overlay */}      {state.selectedElementId && (() => {
        const currentElements = getCurrentViewElements();
        const selectedElement = currentElements.find(el => el.id === state.selectedElementId);
        console.log('Rendering selection overlay for:', selectedElement);
        return selectedElement ? (
          <SelectionOverlay
            element={selectedElement}
            onDelete={() => dispatch({ type: 'DELETE_ELEMENT', payload: state.selectedElementId! })}
          />
        ) : null;
      })()}
    </div>
  );
}

// Selection overlay component
function SelectionOverlay({
  element,
  onDelete
}: {
  element: DesignElement;
  onDelete: () => void;
}) {
  const { dispatch } = useDesign();

  // Corner resize handles
  const resizeHandles = [
    { position: 'nw', x: -8, y: -8, cursor: 'nw-resize' },
    { position: 'ne', x: element.width, y: -8, cursor: 'ne-resize' },
    { position: 'sw', x: -8, y: element.height, cursor: 'sw-resize' },
    { position: 'se', x: element.width, y: element.height, cursor: 'se-resize' },
  ];

  // Side handles for resizing
  const sideHandles = [
    { position: 'n', x: element.width / 2 - 4, y: -8, cursor: 'n-resize' },
    { position: 's', x: element.width / 2 - 4, y: element.height, cursor: 's-resize' },
    { position: 'w', x: -8, y: element.height / 2 - 4, cursor: 'w-resize' },
    { position: 'e', x: element.width, y: element.height / 2 - 4, cursor: 'e-resize' },
  ];

  // Control handles (move, rotate, etc.)
  const controlHandles = [
    {
      type: 'move',
      x: element.width / 2 - 12,
      y: -40,
      icon: '↑',
      cursor: 'move',
      action: 'move-up'
    },
    {
      type: 'move',
      x: element.width / 2 - 12,
      y: element.height + 16,
      icon: '↓',
      cursor: 'move',
      action: 'move-down'
    },
    {
      type: 'move',
      x: -40,
      y: element.height / 2 - 12,
      icon: '←',
      cursor: 'move',
      action: 'move-left'
    },
    {
      type: 'move',
      x: element.width + 16,
      y: element.height / 2 - 12,
      icon: '→',
      cursor: 'move',
      action: 'move-right'
    },
    {
      type: 'rotate',
      x: element.width / 2 - 12,
      y: element.height + 40,
      icon: '↻',
      cursor: 'grab',
      action: 'rotate'
    },
  ];

  const handleMouseDown = (e: React.MouseEvent, handleType: string, handlePosition: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.target as HTMLElement).closest('.design-canvas-container')?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startElementX = element.x;
    const startElementY = element.y;
    const startWidth = element.width;
    const startHeight = element.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (handleType === 'resize') {
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startElementX;
        let newY = startElementY;

        switch (handlePosition) {
          case 'nw':
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
            newX = startElementX + deltaX;
            newY = startElementY + deltaY;
            break;
          case 'ne':
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
            newY = startElementY + deltaY;
            break;
          case 'sw':
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
            newX = startElementX + deltaX;
            break;
          case 'se':
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
            break;
          case 'n':
            newHeight = startHeight - deltaY;
            newY = startElementY + deltaY;
            break;
          case 's':
            newHeight = startHeight + deltaY;
            break;
          case 'w':
            newWidth = startWidth - deltaX;
            newX = startElementX + deltaX;
            break;
          case 'e':
            newWidth = startWidth + deltaX;
            break;
        }

        // Apply minimum size constraints
        const minSize = 20;
        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(minSize, newHeight);

        // For images, maintain aspect ratio on corner handles
        if (element.type === 'image' && ['nw', 'ne', 'sw', 'se'].includes(handlePosition)) {
          const aspectRatio = startWidth / startHeight;
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
          }
        }

        // For text, update font size proportionally
        if (element.type === 'text' && newHeight !== element.height) {
          const scale = newHeight / startHeight;
          const textData = element.data as any;
          const newFontSize = Math.max(8, Math.round(textData.fontSize * scale));

          dispatch({
            type: 'UPDATE_TEXT_DATA',
            payload: {
              id: element.id,
              textData: { fontSize: newFontSize }
            }
          });
        }

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            updates: { width: newWidth, height: newHeight, x: newX, y: newY }
          }
        });
      } else if (handleType === 'move') {
        const moveStep = 10;
        let newX = element.x;
        let newY = element.y;

        switch (handlePosition) {
          case 'move-up':
            newY = Math.max(0, element.y - moveStep);
            break;
          case 'move-down':
            newY = element.y + moveStep;
            break;
          case 'move-left':
            newX = Math.max(0, element.x - moveStep);
            break;
          case 'move-right':
            newX = element.x + moveStep;
            break;
        }

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            updates: { x: newX, y: newY }
          }
        });
      } else if (handleType === 'rotate') {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        const angle = Math.atan2(moveEvent.clientY - rect.top - centerY, moveEvent.clientX - rect.left - centerX);
        const rotation = (angle * 180 / Math.PI + 90) % 360;

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            id: element.id,
            updates: { rotation: Math.round(rotation) }
          }
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      dispatch({ type: 'COMMIT_CHANGES' });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleControlClick = (action: string) => {
    const moveStep = 10;
    let updates: any = {};

    switch (action) {
      case 'move-up':
        updates.y = Math.max(0, element.y - moveStep);
        break;
      case 'move-down':
        updates.y = element.y + moveStep;
        break;
      case 'move-left':
        updates.x = Math.max(0, element.x - moveStep);
        break;
      case 'move-right':
        updates.x = element.x + moveStep;
        break;
      case 'rotate':
        updates.rotation = (element.rotation + 15) % 360;
        break;
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, updates }
    });
    dispatch({ type: 'COMMIT_CHANGES' });
  };

  return (
    <div
      className="absolute pointer-events-none design-canvas-container"
      style={{
        left: element.x - 2,
        top: element.y - 2,
        width: element.width + 4,
        height: element.height + 4,
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        transform: `rotate(${element.rotation}deg)`,
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}
    >
      {/* Corner resize handles */}
      {resizeHandles.map(handle => (
        <div
          key={handle.position}
          className="absolute pointer-events-auto hover:scale-125 transition-transform"
          style={{
            left: handle.x,
            top: handle.y,
            width: '16px',
            height: '16px',
            backgroundColor: '#3b82f6',
            border: '2px solid white',
            borderRadius: '3px',
            cursor: handle.cursor,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'resize', handle.position)}
        />
      ))}

      {/* Side resize handles */}
      {sideHandles.map(handle => (
        <div
          key={handle.position}
          className="absolute pointer-events-auto hover:scale-125 transition-transform"
          style={{
            left: handle.x,
            top: handle.y,
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: handle.cursor,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'resize', handle.position)}
        />
      ))}

      {/* Control handles */}
      {controlHandles.map((handle, index) => (
        <div
          key={index}
          className="absolute pointer-events-auto hover:scale-110 transition-transform"
          style={{
            left: handle.x,
            top: handle.y,
            width: '24px',
            height: '24px',
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '50%',
            cursor: handle.cursor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#3b82f6',
          }}
          onMouseDown={(e) => {
            if (handle.type === 'rotate') {
              handleMouseDown(e, 'rotate', handle.action);
            }
          }}
          onClick={() => {
            if (handle.type === 'move') {
              handleControlClick(handle.action);
            } else if (handle.type === 'rotate') {
              handleControlClick(handle.action);
            }
          }}
        >
          {handle.icon}
        </div>
      ))}

      {/* Delete button */}
      <div
        className="absolute pointer-events-auto hover:scale-110 transition-transform"
        style={{
          right: '-12px',
          top: '-12px',
          width: '24px',
          height: '24px',
          backgroundColor: '#ef4444',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Toolbar above element */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: '50%',
          top: '-60px',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Copy */}
        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Copy"
          onClick={(e) => {
            e.stopPropagation();
            // Copy functionality can be added here
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>

        {/* Lock */}
        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Lock"
          onClick={(e) => {
            e.stopPropagation();
            // Lock functionality can be added here
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </button>

        {/* Duplicate */}
        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            // Duplicate functionality
            const newElement = {
              ...element,
              id: Math.random().toString(36).substring(2, 11),
              x: element.x + 20,
              y: element.y + 20,
            };
            dispatch({
              type: 'ADD_ELEMENT',
              payload: newElement
            });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="7" y="7" width="14" height="14" rx="2" ry="2"/>
            <path d="M3 17V7a2 2 0 012-2h10"/>
          </svg>
        </button>

        {/* Delete */}
        <button
          className="p-2 hover:bg-red-100 rounded text-red-600"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
          </svg>
        </button>

        {/* More options */}
        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="More options"
          onClick={(e) => {
            e.stopPropagation();
            // More options menu can be added here
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
