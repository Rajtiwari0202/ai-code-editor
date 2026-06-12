import { NextResponse } from "next/server"

import type { PatchProposalRequest } from "@/lib/ai/contracts"
import { createPatchProposal } from "@/lib/ai/planner"

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PatchProposalRequest>

  if (!body.intent || !body.activeFile) {
    return NextResponse.json(
      { error: "intent and activeFile are required" },
      { status: 400 }
    )
  }

  return NextResponse.json(
    createPatchProposal({
      intent: body.intent,
      activeFile: body.activeFile,
      dirtyFiles: body.dirtyFiles ?? [],
      selectedStepIds: body.selectedStepIds,
    })
  )
}
