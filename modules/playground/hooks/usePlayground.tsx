import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, savePlaygroundFiles } from "../actions";

interface PlaygroundData {
  title?: string;
  templateFiles?: {
    content: unknown;
  }[];
}

type TemplateApiResponse = {
  templateJson?: TemplateFolder | TemplateFolder["items"];
};

function isTemplateFolder(value: unknown): value is TemplateFolder {
  return (
    typeof value === "object" &&
    value !== null &&
    "folderName" in value &&
    "items" in value &&
    typeof value.folderName === "string" &&
    Array.isArray(value.items)
  );
}

function parseSavedTemplateContent(rawContent: unknown): TemplateFolder | null {
  if (typeof rawContent === "string") {
    try {
      const parsedContent = JSON.parse(rawContent) as unknown;
      return isTemplateFolder(parsedContent) ? parsedContent : null;
    } catch {
      return null;
    }
  }

  return isTemplateFolder(rawContent) ? rawContent : null;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(
    null
  );
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayground = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaygroundById(id);

      setPlaygroundData(data ?? null);
      const rawContent = data?.templateFiles?.[0]?.content;

      const savedTemplate = parseSavedTemplateContent(rawContent);

      if (savedTemplate) {
        setTemplateData(savedTemplate);
        return;
      }

      const res = await fetch(`/api/template/${id}`);

      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = (await res.json()) as TemplateApiResponse;

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(
          templateRes.templateJson || {
            folderName: "Root",
            items: [],
          }
        );
      }
    } catch (error) {
      console.error("Error loading playground:", error);
      setError("Failed to load playground data");
      toast.error("Failed to load playground data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        await savePlaygroundFiles(id, data);
        setTemplateData(data);
      } catch (error) {
        console.error("Error saving template data:", error);
        toast.error("Failed to save changes");
        throw error;
      }
    },
    [id]
  );

  useEffect(() => {
    loadPlayground();
  }, [loadPlayground]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  };
};
