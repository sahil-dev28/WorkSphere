import { BrandPanel } from "./brand-panel";
import { LoginCard } from "./login-card";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col min-[900px]:flex-row">
      <div className="min-[900px]:w-[52%]">
        <BrandPanel />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <LoginCard />
      </div>
    </div>
  );
}
