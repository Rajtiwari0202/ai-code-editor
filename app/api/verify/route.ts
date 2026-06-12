import { NextResponse } from "next/server"

import type { VerifyRequest } from "@/lib/ai/contracts"
import { allowedVerificationCommands, splitAllowedCommands } from "@/lib/verification/commands"

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyRequest
  const { allowed, blocked } = splitAllowedCommands(body.commands)

  return NextResponse.json({
    allowedCommands: allowedVerificationCommands,
    queuedCommands: allowed,
    blockedCommands: blocked,
  })
}
