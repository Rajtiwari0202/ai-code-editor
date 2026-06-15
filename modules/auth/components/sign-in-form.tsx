import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome, Github } from "lucide-react";
import Link from "next/link";

const authErrorMessages: Record<string, string> = {
  AccessDenied: "Access was denied by the provider. Try again or choose another sign-in method.",
  Configuration: "OAuth is not fully configured for this deployment yet.",
  OAuthAccountNotLinked:
    "This email is already linked to another provider. Sign in with the original provider.",
};

async function handleGoogleSignIn() {
  "use server";
  await signIn("google");
}

async function handleGithubSignIn() {
  "use server";
  await signIn("github");
}

interface SignInFormProps {
  error?: string;
}

const SignInForm = ({ error }: SignInFormProps) => {
  const errorMessage = error
    ? authErrorMessages[error] ?? "Sign-in failed. Check the provider configuration and try again."
    : null;

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 text-zinc-50 shadow-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-2xl font-semibold">
          Continue to Forge Editor
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Use a trusted OAuth provider to access your playgrounds.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          >
            {errorMessage}
          </div>
        )}

        <form action={handleGoogleSignIn}>
          <Button type="submit" variant="outline" className="h-11 w-full justify-start">
            <Chrome className="mr-2 h-4 w-4" />
            <span>Sign in with Google</span>
          </Button>
        </form>
        <form action={handleGithubSignIn}>
          <Button type="submit" variant="outline" className="h-11 w-full justify-start">
            <Github className="mr-2 h-4 w-4" />
            <span>Sign in with GitHub</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="w-full text-center text-sm text-zinc-400">
          By signing in, you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-zinc-100">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-100">
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
