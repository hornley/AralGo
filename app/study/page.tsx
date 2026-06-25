import { AnonymousLaunchpad } from "@/components/study/anonymous-launchpad";

export const dynamic = "force-dynamic";

export default function StudyPage() {
  return (
    <main>
      <div className="shell stack">
        <AnonymousLaunchpad />
      </div>
    </main>
  );
}
