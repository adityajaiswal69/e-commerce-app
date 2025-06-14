# Custom Design Tool - Implementation Guide

## 🎨 **Overview**

A fully custom design tool built from scratch using pure HTML5 Canvas and React for customizing uniform products. No external canvas libraries (like Fabric.js) are used - everything is implemented with native web technologies.

## ✅ **Implemented Features**

### **Core Canvas Functionality**
- ✅ Pure HTML5 Canvas implementation
- ✅ Product image as background
- ✅ Front/Back view switching
- ✅ Real-time canvas rendering
- ✅ Element selection and manipulation

### **Text Elements**
- ✅ Add custom text elements
- ✅ Drag to reposition
- ✅ Resize using corner handles
- ✅ Font family selection (10+ fonts)
- ✅ Font size control
- ✅ Color picker with preset colors
- ✅ Font weight (normal/bold)
- ✅ Font style (normal/italic)
- ✅ Text alignment (left/center/right)
- ✅ Multi-line text support

### **Image Elements**
- ✅ Upload and place images
- ✅ Drag to reposition
- ✅ Resize maintaining aspect ratio
- ✅ Automatic size optimization
- ✅ File type validation
- ✅ File size limits (5MB)

### **State Management**
- ✅ Undo/Redo functionality (50 states)
- ✅ Element selection
- ✅ Delete selected elements
- ✅ Clear entire canvas
- ✅ Real-time state updates

### **User Interface**
- ✅ Clean toolbar with all controls
- ✅ Text properties panel
- ✅ Quick text options
- ✅ View switcher (front/back)
- ✅ Element counter
- ✅ Responsive design

### **Save & Storage**
- ✅ Save designs to Supabase
- ✅ Generate preview images
- ✅ Design metadata storage
- ✅ User-specific designs
- ✅ Design listing page

## 🗂️ **File Structure**

```
app/
├── (design)/
│   ├── layout.tsx                    # Design-specific layout (no navbar/footer)
│   ├── design/[productId]/
│   │   └── page.tsx                  # Main design page
│   └── edit/[id]/
│       └── page.tsx                  # Edit existing design page
├── (public)/
│   └── my-designs/
│       └── page.tsx                  # User's saved designs
│
components/design/
├── DesignCanvas.tsx                  # Core canvas component
├── DesignToolbar.tsx                 # Toolbar with tools and actions
└── TextControls.tsx                  # Text editing controls
│
contexts/
└── DesignContext.tsx                 # State management with useReducer
│
lib/utils/
└── upload.ts                         # Image upload utilities
│
sql/schema/
└── 012_designs.sql                   # Database schema
│
types/
└── database.types.ts                 # TypeScript types
```

## 🚀 **How to Use**

### **1. Access the Design Tool**
- Go to any product page
- Click "Customize This Uniform" button
- Opens design tool without navbar/footer

### **2. Add Elements**
- **Add Text**: Click "Add Text" or double-click canvas
- **Add Image**: Click "Add Image" and upload file
- **Quick Text**: Use preset options like "Employee Name"

### **3. Edit Elements**
- **Select**: Click on any element
- **Move**: Drag selected element
- **Resize**: Drag corner handles
- **Delete**: Select element and click delete button

### **4. Text Editing**
- Select text element to show properties panel
- Change font, size, color, alignment
- Edit text content directly

### **5. Save Design**
- Click "Save Design" in toolbar
- Generates preview image automatically
- Saves to your account

### **6. View Saved Designs**
- Navigate to "My Designs" in sidebar
- View, edit, or delete saved designs

## 🛠️ **Technical Implementation**

### **Canvas Rendering**
```typescript
// Pure HTML5 Canvas with manual drawing
const drawCanvas = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Draw product background
  ctx.drawImage(productImage, 0, 0, canvas.width, canvas.height);
  
  // Draw each element with transformations
  state.elements.forEach(element => {
    ctx.save();
    // Apply rotation, position, etc.
    ctx.restore();
  });
}, [productImage, state.elements]);
```

### **State Management**
```typescript
// useReducer for complex state with undo/redo
const [state, dispatch] = useReducer(canvasReducer, initialState);

// History tracking for undo/redo
function addToHistory(state: CanvasState, newElements: DesignElement[]) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push([...newElements]);
  return { ...state, history: newHistory.slice(-50) };
}
```

### **Element Manipulation**
```typescript
// Mouse events for drag and resize
const handleMouseMove = useCallback((e: React.MouseEvent) => {
  if (state.isDragging) {
    const newX = x - dragStart.x;
    const newY = y - dragStart.y;
    moveElement(state.selectedElementId, newX, newY);
  }
}, [state.isDragging, dragStart, moveElement]);
```

## 📊 **Database Schema**

```sql
CREATE TABLE public.designs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES products(id),
  name TEXT NOT NULL,
  elements JSONB NOT NULL,
  canvas_width INTEGER DEFAULT 600,
  canvas_height INTEGER DEFAULT 600,
  product_view TEXT DEFAULT 'front',
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## 🎯 **Key Features Achieved**

1. **No External Dependencies**: Pure HTML5 Canvas implementation
2. **Full CRUD**: Create, read, update, delete designs
3. **Real-time Editing**: Immediate visual feedback
4. **Persistent Storage**: Designs saved to Supabase
5. **User Authentication**: User-specific designs
6. **Responsive Design**: Works on desktop and mobile
7. **Type Safety**: Full TypeScript implementation
8. **State Management**: Robust undo/redo system

## 🔄 **Next Steps (Optional Enhancements)**

- [ ] Zoom in/out functionality
- [ ] Layer management
- [ ] More text effects (shadow, outline)
- [ ] Shape tools (rectangles, circles)
- [ ] Grid/snap functionality
- [ ] Export to different formats
- [ ] Collaborative editing
- [ ] Template system

## 🧪 **Testing**

1. **Run the application**: `npm run dev`
2. **Apply database migration**: Run `sql/schema/012_designs.sql` in Supabase
3. **Test the flow**:
   - Go to a product page
   - Click "Customize This Uniform"
   - Add text and images
   - Test undo/redo
   - Save design
   - Check "My Designs" page

The design tool is now fully functional and ready for use! 🎉
