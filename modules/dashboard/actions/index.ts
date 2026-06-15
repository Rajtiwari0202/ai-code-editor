"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  createPlaygroundSchema,
  editProjectSchema,
  projectIdSchema,
  type CreatePlaygroundInput,
  type EditProjectInput,
} from "../contracts";

async function requireCurrentUserId() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  return userId;
}

export const togglePlaygroundStar = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const userId = await requireCurrentUserId();

  try {
    const projectId = projectIdSchema.parse(playgroundId);

    const playground = await db.playground.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!playground) {
      throw new Error("Playground not found");
    }

    if (isChecked) {
      await db.starMark.upsert({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: projectId,
          },
        },
        update: {
          isMarked: true,
        },
        create: {
          userId,
          playgroundId: projectId,
          isMarked: true,
        },
      });
    } else {
      await db.starMark.deleteMany({
        where: {
          userId,
          playgroundId: projectId,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating favorite:", error);
    return { success: false, error: "Failed to update favorite" };
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  try {
    const playground = await db.playground.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
        starMarks: {
          where: {
            userId,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.error("Error loading playgrounds:", error);
    return [];
  }
};

export const createPlayground = async (data: CreatePlaygroundInput) => {
  const userId = await requireCurrentUserId();

  try {
    const { template, title, description } = createPlaygroundSchema.parse(data);

    const playground = await db.playground.create({
      data: {
        title,
        description: description ?? null,
        template,
        userId,
      },
    });

    return playground;
  } catch (error) {
    console.error("Error creating playground:", error);
    throw new Error("Failed to create playground");
  }
};

export const deleteProjectById = async (id: string) => {
  const userId = await requireCurrentUserId();

  try {
    const projectId = projectIdSchema.parse(id);

    const result = await db.playground.deleteMany({
      where: {
        id: projectId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new Error("Project not found");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
};

export const editProjectById = async (
  id: string,
  data: EditProjectInput
) => {
  const userId = await requireCurrentUserId();

  try {
    const projectId = projectIdSchema.parse(id);
    const parsedData = editProjectSchema.parse(data);

    const result = await db.playground.updateMany({
      where: {
        id: projectId,
        userId,
      },
      data: parsedData,
    });

    if (result.count === 0) {
      throw new Error("Project not found");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error editing project:", error);
    throw new Error("Failed to edit project");
  }
};

export const duplicateProjectById = async (id: string) => {
  const userId = await requireCurrentUserId();

  try {
    const projectId = projectIdSchema.parse(id);

    const originalPlayground = await db.playground.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!originalPlayground) {
      throw new Error("Original playground not found");
    }

    const savedTemplate = originalPlayground.templateFiles[0];
    const savedTemplateContent =
      savedTemplate?.content === undefined || savedTemplate.content === null
        ? undefined
        : (savedTemplate.content as Prisma.InputJsonValue);

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(savedTemplateContent !== undefined
          ? {
              templateFiles: {
                create: {
                  content: savedTemplateContent,
                },
              },
            }
          : {}),
      },
    });

    revalidatePath("/dashboard");
    return duplicatedPlayground;
  } catch (error) {
    console.error("Error duplicating project:", error);
    throw new Error("Failed to duplicate project");
  }
};
