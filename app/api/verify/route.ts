import { NextResponse } from "next/server"

import { readJsonBody } from "@/lib/api/request"
import { verifyRequestSchema } from "@/lib/ai/contracts"
import { allowedVerificationCommands, splitAllowedCommands } from "@/lib/verification/commands"

export async function POST(request: Request) {
  const body = await readJsonBody(request)

  if (!body.ok) {
    return NextResponse.json(
      { error: body.error },
      { status: 400 }
    )
  }

  const result = verifyRequestSchema.safeParse(body.data)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid verification request",
        issues: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const { allowed, blocked } = splitAllowedCommands(result.data.commands)

  return NextResponse.json({
    allowedCommands: allowedVerificationCommands,
    queuedCommands: allowed,
    blockedCommands: blocked,
  })
}
