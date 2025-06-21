export interface TextElementData {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElementData {
  src: string;
  opacity: number;
  originalWidth: number;
  originalHeight: number;
}

export interface DesignElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: TextElementData | ImageElementData;
}

export interface ElementUpdate {
  data?: Partial<TextElementData | ImageElementData>;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotation?: number;
}
