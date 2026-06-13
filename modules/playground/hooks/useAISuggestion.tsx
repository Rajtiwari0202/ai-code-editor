import { useState, useCallback } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";

type CodeEditor = MonacoEditor.IStandaloneCodeEditor;
type CodeSuggestionResponse = {
    suggestion?: string;
};

interface AISuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: { line: number; column: number } | null;
    decoration: string[];
    isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: CodeEditor | null) => Promise<void>;
    acceptSuggestion: (editor: CodeEditor | null, monaco: Monaco | null) => void;
    rejectSuggestion: (editor: CodeEditor | null) => void;
    clearSuggestion: (editor: CodeEditor | null) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
    });

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    }, [])

    const fetchSuggestion = useCallback(async (type: string, editor: CodeEditor | null) => {
        if (!state.isEnabled || !editor) return;

        const model = editor.getModel();
        const cursorPosition = editor.getPosition();

        if (!model || !cursorPosition) return;

        setState((currentState) => ({ ...currentState, isLoading: true }));

        try {
            const payload = {
                fileContent: model.getValue(),
                cursorLine: cursorPosition.lineNumber - 1,
                cursorColumn: cursorPosition.column - 1,
                suggestionType: type,
            };

            const response = await fetch("/api/code-completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = (await response.json()) as CodeSuggestionResponse;

            if (data.suggestion) {
                setState((prev) => ({
                    ...prev,
                    suggestion: data.suggestion?.trim() || null,
                    position: {
                        line: cursorPosition.lineNumber,
                        column: cursorPosition.column,
                    },
                    isLoading: false,
                }));
                return;
            }

            console.warn("No suggestion received from API.");
            setState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            console.error("Error fetching code suggestion:", error);
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [state.isEnabled])


    const acceptSuggestion = useCallback((editor: CodeEditor | null, monaco: Monaco | null) => {
        setState((currentState) => {
            if (!currentState.suggestion || !currentState.position || !editor || !monaco) {
                return currentState;
            }

            const { line, column } = currentState.position;
            const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "");

            editor.executeEdits("", [
                {
                    range: new monaco.Range(line, column, line, column),
                    text: sanitizedSuggestion,
                    forceMoveMarkers: true,
                }
            ]);

            if(editor && currentState.decoration.length > 0){
                editor.deltaDecorations(currentState.decoration , [])
            }

            return {
                ...currentState,
                suggestion:null,
                position:null,
                decoration:[]
            }
        })
    }, [])

    const rejectSuggestion = useCallback((editor: CodeEditor | null)=>{
            setState((currentState)=>{
                 if(editor && currentState.decoration.length > 0){
                    editor.deltaDecorations(currentState.decoration , [])
                }

                return {
                    ...currentState,
                    suggestion:null,
                    position:null,
                    decoration:[]
                }
            })
    },[]);
 
    const clearSuggestion = useCallback((editor: CodeEditor | null) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);


  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion
  }

}
