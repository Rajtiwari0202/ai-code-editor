import { NextResponse } from "next/server"

import { readJsonBody } from "@/lib/api/request"
import { planRequestSchema } from "@/lib/ai/contracts"
import { createPlan } from "@/lib/ai/planner"

export async function POST(request: Request) {
  const body = await readJsonBody(request)

  if (!body.ok) {
    return NextResponse.json(
      { error: body.error },
      { status: 400 }
    )
  }

  const result = planRequestSchema.safeParse(body.data)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid plan request",
        issues: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(createPlan(result.data))
}
