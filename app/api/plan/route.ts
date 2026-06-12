import { NextResponse } from "next/server"

import type { PlanRequest } from "@/lib/ai/contracts"
import { createPlan } from "@/lib/ai/planner"

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PlanRequest>

  if (!body.intent || !body.activeFile) {
    return NextResponse.json(
      { error: "intent and activeFile are required" },
      { status: 400 }
    )
  }

  return NextResponse.json(
    createPlan({
      intent: body.intent,
      activeFile: body.activeFile,
      dirtyFiles: body.dirtyFiles ?? [],
    })
  )
}
