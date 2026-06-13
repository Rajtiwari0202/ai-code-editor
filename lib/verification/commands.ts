const commandAllowlist = [
  "npm run validate:env",
  "npm run validate:templates",
  "npm run lint",
  "npm run build",
] as const

export const allowedVerificationCommands = [...commandAllowlist]

export function splitAllowedCommands(commands: string[] = []) {
  return commands.reduce(
    (result, command) => {
      const normalizedCommand = command.trim()

      if (
        commandAllowlist.includes(
          normalizedCommand as (typeof commandAllowlist)[number]
        )
      ) {
        result.allowed.push(normalizedCommand)
      } else {
        result.blocked.push(command)
      }

      return result
    },
    { allowed: [] as string[], blocked: [] as string[] }
  )
}
