"use client";

import { useState } from "react";
import { isOnboardingComplete } from "@/lib/study/learner-profile";
import { OnboardingWizard } from "@/components/study/onboarding-wizard";
import { StudyHome } from "@/components/study/study-home";

export default function StudyPage() {
  const [state, setState] = useState<"loading" | "onboarding" | "home">(
    () => {
      if (typeof window !== "undefined") {
        return isOnboardingComplete() ? "home" : "onboarding";
      }
      return "loading";
    },
  );

  if (state === "loading") {
    return (
      <main>
        <div className="shell stack" />
      </main>
    );
  }

  if (state === "onboarding") {
    return (
      <main>
        <div className="shell stack">
          <OnboardingWizard onComplete={() => setState("home")} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="shell stack">
        <StudyHome />
      </div>
    </main>
  );
}
