declare module 'react-quill' {
  import React from 'react';
  
  export interface QuillToolbar {
    container?: string | string[] | Array<Array<string | object>>;
    handlers?: Record<string, (value: unknown) => void>;
  }
  
  export interface QuillModules {
    toolbar?: boolean | string | string[] | QuillToolbar | Array<Array<string | object>>;
    [key: string]: unknown; // Outros módulos que podem ser adicionados
  }
  
  interface ReactQuillProps {
    value: string;
    onChange: (value: string) => void;
    modules?: QuillModules;
    formats?: string[];
    theme?: string;
    readOnly?: boolean;
    placeholder?: string;
  }
  
  export default class ReactQuill extends React.Component<ReactQuillProps> {}
} 