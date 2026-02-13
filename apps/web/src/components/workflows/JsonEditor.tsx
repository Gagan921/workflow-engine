/**
 * JSON Editor Component
 * 
 * Monaco editor wrapper for editing JSON with syntax highlighting and validation.
 */

import { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export function JsonEditor({ 
  value, 
  onChange, 
  height = '300px',
  readOnly = false 
}: JsonEditorProps) {
  const editorRef = useRef<Parameters<NonNullable<Parameters<typeof Editor>[0]['onMount']>>[0] | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
      
      // Validate JSON
      try {
        JSON.parse(newValue);
        setHasError(false);
      } catch {
        setHasError(true);
      }
    }
  };

  const handleEditorMount = (editor: Parameters<NonNullable<Parameters<typeof Editor>[0]['onMount']>>[0]) => {
    editorRef.current = editor;
    
    // Add format on save/command
    editor.addCommand((window as unknown as { monaco: { KeyMod: { CtrlCmd: number }; KeyCode: { KeyS: number } } }).monaco.KeyMod.CtrlCmd | (window as unknown as { monaco: { KeyMod: { CtrlCmd: number }; KeyCode: { KeyS: number } } }).monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  return (
    <div className={`border rounded-md overflow-hidden ${hasError ? 'border-destructive' : 'border-border'}`}>
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          wordBasedSuggestions: 'currentDocument',
          parameterHints: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      />
    </div>
  );
}