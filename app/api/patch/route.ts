import { NextResponse } from "next/server"

import { readJsonBody } from "@/lib/api/request"
import { patchProposalRequestSchema } from "@/lib/ai/contracts"
import { createPatchProposal } from "@/lib/ai/planner"

export async function POST(request: Request) {
  const body = await readJsonBody(request)

  if (!body.ok) {
    return NextResponse.json(
      { error: body.error },
      { status: 400 }
    )
  }

  const result = patchProposalRequestSchema.safeParse(body.data)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid patch proposal request",
        issues: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(createPatchProposal(result.data))
}
