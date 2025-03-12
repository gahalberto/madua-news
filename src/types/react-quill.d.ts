declare module 'react-quill' {
  import React from 'react';
  
  export interface QuillToolbar {
    container?: string | string[] | Array<Array<string | object>>;
    handlers?: Record<string, Function>;
  }
  
  export interface QuillModules {
    toolbar?: boolean | string | string[] | QuillToolbar | Array<Array<string | object>>;
    [key: string]: any; // Outros módulos que podem ser adicionados
  }
  
  export interface ReactQuillProps {
    theme?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    modules?: QuillModules;
    formats?: string[];
    [key: string]: unknown; // Propriedades adicionais
  }
  
  const ReactQuill: React.FC<ReactQuillProps>;
  
  export default ReactQuill;
} 