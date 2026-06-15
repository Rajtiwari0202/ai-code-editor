import SignInForm from "@/modules/auth/components/sign-in-form";
import Image from "next/image";

interface SignInPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

const Page = async ({ searchParams }: SignInPageProps) => {
  const params = await searchParams;

  return (
    <div className="grid min-h-screen w-full grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,440px)] lg:px-16">
      <div className="hidden min-h-[520px] items-center justify-center lg:flex">
        <Image
          src="/login.svg"
          alt=""
          height={360}
          width={360}
          className="object-contain"
          priority
        />
      </div>
      <SignInForm error={params?.error} />
    </div>
  );
};

export default Page;
