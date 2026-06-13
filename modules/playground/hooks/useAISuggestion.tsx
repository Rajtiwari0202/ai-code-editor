import { useCallback, useRef, useState } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { toast } from "sonner";

type CodeEditor = MonacoEditor.IStandaloneCodeEditor;

type CodeSuggestionResponse = {
  suggestion?: string;
  error?: string;
  message?: string;
};

interface AISuggestionsState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
  error: string | null;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: CodeEditor | null) => Promise<void>;
  acceptSuggestion: (editor: CodeEditor | null, monaco: Monaco | null) => void;
  rejectSuggestion: (editor: CodeEditor | null) => void;
  clearSuggestion: (editor: CodeEditor | null) => void;
}

async function readSuggestionError(response: Response) {
  try {
    const data = (await response.json()) as CodeSuggestionResponse;
    if (data.message) {
      return `${data.error || "AI completion failed"}: ${data.message}`;
    }
    return data.error || `AI completion failed with status ${response.status}`;
  } catch {
    return `AI completion failed with status ${response.status}`;
  }
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
  const [state, setState] = useState<AISuggestionsState>({
    suggestion: null,
    isLoading: false,
    position: null,
    decoration: [],
    isEnabled: true,
    error: null,
  });

  const lastErrorToastAt = useRef(0);

  const notifySuggestionError = useCallback((message: string) => {
    const now = Date.now();

    if (now - lastErrorToastAt.current > 15000) {
      toast.error(message);
      lastErrorToastAt.current = now;
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setState((previous) => ({
      ...previous,
      isEnabled: !previous.isEnabled,
      error: null,
      suggestion: null,
      position: null,
      decoration: [],
    }));
  }, []);

  const fetchSuggestion = useCallback(
    async (type: string, editor: CodeEditor | null) => {
      if (!state.isEnabled || !editor) return;

      const model = editor.getModel();
      const cursorPosition = editor.getPosition();

      if (!model || !cursorPosition) return;

      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
        suggestion: null,
        position: null,
      }));

      try {
        const response = await fetch("/api/code-completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileContent: model.getValue(),
            cursorLine: cursorPosition.lineNumber - 1,
            cursorColumn: cursorPosition.column - 1,
            suggestionType: type,
          }),
        });

        if (!response.ok) {
          throw new Error(await readSuggestionError(response));
        }

        const data = (await response.json()) as CodeSuggestionResponse;
        const suggestion = data.suggestion?.trim();

        if (!suggestion) {
          setState((current) => ({
            ...current,
            isLoading: false,
            suggestion: null,
            position: null,
          }));
          return;
        }

        setState((current) => ({
          ...current,
          suggestion,
          position: {
            line: cursorPosition.lineNumber,
            column: cursorPosition.column,
          },
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "AI completion is unavailable.";

        notifySuggestionError(message);
        setState((current) => ({
          ...current,
          isLoading: false,
          suggestion: null,
          position: null,
          error: message,
        }));
      }
    },
    [notifySuggestionError, state.isEnabled]
  );

  const acceptSuggestion = useCallback(
    (editor: CodeEditor | null, monaco: Monaco | null) => {
      setState((current) => {
        if (!current.suggestion || !current.position || !editor || !monaco) {
          return current;
        }

        const { line, column } = current.position;
        const sanitizedSuggestion = current.suggestion.replace(/^\d+:\s*/gm, "");

        editor.executeEdits("", [
          {
            range: new monaco.Range(line, column, line, column),
            text: sanitizedSuggestion,
            forceMoveMarkers: true,
          },
        ]);

        if (current.decoration.length > 0) {
          editor.deltaDecorations(current.decoration, []);
        }

        return {
          ...current,
          suggestion: null,
          position: null,
          decoration: [],
          error: null,
        };
      });
    },
    []
  );

  const rejectSuggestion = useCallback((editor: CodeEditor | null) => {
    setState((current) => {
      if (editor && current.decoration.length > 0) {
        editor.deltaDecorations(current.decoration, []);
      }

      return {
        ...current,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const clearSuggestion = useCallback((editor: CodeEditor | null) => {
    setState((current) => {
      if (editor && current.decoration.length > 0) {
        editor.deltaDecorations(current.decoration, []);
      }

      return {
        ...current,
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
    clearSuggestion,
  };
};
