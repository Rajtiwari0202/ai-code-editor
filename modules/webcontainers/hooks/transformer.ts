import type { FileSystemTree } from "@webcontainer/api";
import type {
  TemplateFile,
  TemplateFolder,
  TemplateItem,
} from "@/modules/playground/lib/path-to-json";

type WebContainerNode = FileSystemTree[string];

const isTemplateFolder = (item: TemplateItem): item is TemplateFolder =>
  "folderName" in item;

const getTemplateItemName = (item: TemplateItem) => {
  if (isTemplateFolder(item)) {
    return item.folderName;
  }

  return item.fileExtension
    ? `${item.filename}.${item.fileExtension}`
    : item.filename;
};

const transformTemplateItem = (item: TemplateItem): WebContainerNode => {
  if (isTemplateFolder(item)) {
    return {
      directory: transformTemplateItems(item.items),
    };
  }

  const file = item as TemplateFile;

  return {
    file: {
      contents: file.content,
    },
  };
};

const transformTemplateItems = (items: TemplateItem[]): FileSystemTree => {
  return items.reduce<FileSystemTree>((tree, item) => {
    tree[getTemplateItemName(item)] = transformTemplateItem(item);
    return tree;
  }, {});
};

export function transformToWebContainerFormat(
  template: TemplateFolder
): FileSystemTree {
  return transformTemplateItems(template.items);
}
