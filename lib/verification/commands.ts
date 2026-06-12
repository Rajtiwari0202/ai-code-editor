const commandAllowlist = ["npm run lint", "npm run build", "npm test"] as const

export const allowedVerificationCommands = [...commandAllowlist]

export function splitAllowedCommands(commands: string[] = []) {
  return commands.reduce(
    (result, command) => {
      if (commandAllowlist.includes(command as (typeof commandAllowlist)[number])) {
        result.allowed.push(command)
      } else {
        result.blocked.push(command)
      }

      return result
    },
    { allowed: [] as string[], blocked: [] as string[] }
  )
}
