const invalidPathSegmentPattern = /[<>:"\\|?*\x00-\x1F/]/;

export function normalizeFileExtension(extension: string, fallback: string) {
  return extension.trim().replace(/^\.+/, "") || fallback;
}

export function getPathSegmentError(value: string, label: string) {
  const name = value.trim();

  if (!name) {
    return `${label} is required`;
  }

  if (name === "." || name === "..") {
    return `${label} cannot be "${name}"`;
  }

  if (invalidPathSegmentPattern.test(name)) {
    return `${label} cannot contain path separators or reserved characters`;
  }

  return null;
}

export function getFileExtensionError(extension: string) {
  if (!extension) {
    return null;
  }

  if (extension.includes(".") || invalidPathSegmentPattern.test(extension)) {
    return "Extension must be a simple value like js, tsx, or md";
  }

  return null;
}
