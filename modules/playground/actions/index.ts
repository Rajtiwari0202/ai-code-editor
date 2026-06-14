"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import type { Prisma } from "@prisma/client";
import type { TemplateFolder } from "../lib/path-to-json";

export const getPlaygroundById = async (id: string) => {
  const user = await currentUser();
  if (!user?.id) return null;

  try {
    const playground = await db.playground.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        title: true,
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.error("Error loading playground:", error);
    return null;
  }
};

export const savePlaygroundFiles = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("User ID is required");
  }

  try {
    const playground = await db.playground.findFirst({
      where: {
        id: playgroundId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!playground) {
      throw new Error("Playground not found");
    }

    const content = data as unknown as Prisma.InputJsonValue;

    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId,
      },
      update: {
        content,
      },
      create: {
        playgroundId,
        content,
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.error("savePlaygroundFiles error:", error);
    throw new Error("Failed to save playground files");
  }
};
