import { useState, useEffect, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainerProps {
  templateData: TemplateFolder | null;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContainerReturn => {
  const hasTemplateData = Boolean(templateData);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    if (!hasTemplateData) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let webcontainerInstance: WebContainer | null = null;
    let unsubscribeError: (() => void) | null = null;

    async function initializeWebContainer() {
      try {
        setIsLoading(true);
        setError(null);

        if (typeof SharedArrayBuffer === "undefined" || !window.crossOriginIsolated) {
          throw new Error(
            "WebContainers require cross-origin isolation. Serve the app over HTTPS in production and keep Cross-Origin-Opener-Policy: same-origin plus Cross-Origin-Embedder-Policy: require-corp enabled."
          );
        }

        webcontainerInstance = await WebContainer.boot({
          coep: "require-corp",
          workdirName: "forge-editor",
        });

        if (!mounted) {
          webcontainerInstance.teardown();
          return;
        }

        unsubscribeError = webcontainerInstance.on("error", (event) => {
          if (mounted) {
            setError(event.message || "WebContainer runtime error");
          }
        });

        setInstance(webcontainerInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer"
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mounted = false;
      unsubscribeError?.();
      webcontainerInstance?.teardown();
    };
  }, [hasTemplateData]);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true }); // Create folder structure recursively
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  const destroy = useCallback(() => {
    if(instance){
        instance.teardown()
        setInstance(null);
        setServerUrl(null)
    }
  },[instance])

  return {serverUrl , isLoading , error , instance , writeFileSync , destroy}
};
