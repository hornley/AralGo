"use client";

import { useEffect, useState } from "react";
import { getDb, type StoredChatSession, type StoredPracticeResult } from "@/lib/offline/db";
import type { GeneratedLesson } from "@/lib/types/supabase";

type CachedItem = {
  id: string;
  type: "lesson" | "practice" | "chat";
  title: string;
  subtitle: string;
  subject: string;
  savedAt: string;
  lesson?: GeneratedLesson;
  practice?: StoredPracticeResult;
  chat?: StoredChatSession;
};

function formatSubject(subject: string) {
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getSubjectColor(subject: string) {
  switch (subject) {
    case "mathematics": return "#0f766e";
    case "science": return "#7c3aed";
    case "english": return "#d97706";
    case "filipino": return "#b91c1c";
    default: return "#615e58";
  }
}

function getSubjectIcon(subject: string) {
  switch (subject) {
    case "mathematics": return "calculate";
    case "science": return "science";
    case "english": return "menu_book";
    case "filipino": return "import_contacts";
    default: return "school";
  }
}

function SubjectBadge({ subject }: { subject: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: getSubjectColor(subject),
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{getSubjectIcon(subject)}</span>
      {formatSubject(subject)}
    </span>
  );
}

function ItemCard({ item, onClick }: { item: CachedItem; onClick: (item: CachedItem) => void }) {
  return (
    <button
      onClick={() => onClick(item)}
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        width: "100%", padding: "14px 16px",
        background: "var(--surface, rgba(255,255,255,0.78))",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border, rgba(23,33,43,0.12))",
        borderRadius: 16,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        color: "var(--color-on-surface, #171d17)",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SubjectBadge subject={item.subject} />
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-on-surface-variant, #43483e)" }}>
          {formatDate(item.savedAt)}
        </span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{item.title}</div>
      <div style={{ fontSize: 12, color: "var(--color-on-surface-variant, #43483e)" }}>
        {item.subtitle}
      </div>
    </button>
  );
}

type DetailView = {
  type: "lesson" | "practice" | "chat";
  data: GeneratedLesson | StoredPracticeResult | StoredChatSession;
} | null;

function DetailPanel({ detail, onClose }: { detail: NonNullable<DetailView>; onClose: () => void }) {
  const isLesson = detail.type === "lesson";
  const lesson = isLesson ? (detail.data as GeneratedLesson) : null;
  const practice = detail.type === "practice" ? (detail.data as StoredPracticeResult) : null;
  const chat = detail.type === "chat" ? (detail.data as StoredChatSession) : null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", flexDirection: "column",
        background: "var(--color-surface, #f6fbf1)",
        overflow: "hidden",
      }}
    >
      <header style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border, rgba(23,33,43,0.12))",
        background: "var(--surface, rgba(255,255,255,0.78))",
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 24, lineHeight: 1,
            color: "var(--color-on-surface, #171d17)",
            fontFamily: "system-ui, sans-serif",
          }}
          aria-label="Back"
        >
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {isLesson ? "Lesson" : detail.type === "practice" ? "Practice" : "Chat Session"}
        </span>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {isLesson && lesson ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <SubjectBadge subject={lesson.subject} />
              <h2 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700 }}>{lesson.topic}</h2>
            </div>
            <section>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #43483e)" }}>Overview</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-on-surface, #171d17)" }}>{lesson.content_json?.overview}</p>
            </section>
            {lesson.content_json?.keyTerms?.length > 0 && (
              <section>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #43483e)" }}>Key Terms</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {lesson.content_json.keyTerms.map((kt, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "var(--surface, rgba(255,255,255,0.78))", borderRadius: 12, border: "1px solid var(--border, rgba(23,33,43,0.12))" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{kt.term}</div>
                      <div style={{ fontSize: 13, color: "var(--color-on-surface-variant, #43483e)", marginTop: 2 }}>{kt.definition}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {lesson.content_json?.recap && (
              <section>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #43483e)" }}>Recap</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-on-surface, #171d17)" }}>{lesson.content_json.recap}</p>
              </section>
            )}
          </div>
        ) : null}

        {practice ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <SubjectBadge subject={practice.subject} />
              <h2 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700 }}>{practice.topic}</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-on-surface-variant, #43483e)" }}>
                {practice.score} / {practice.total} correct
              </p>
            </div>
            {practice.questions.map((q, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  background: "var(--surface, rgba(255,255,255,0.78))",
                  borderRadius: 14,
                  border: `1px solid ${q.isCorrect ? "rgba(15,118,110,0.3)" : "rgba(191,42,36,0.2)"}`,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{q.prompt}</div>
                <div style={{ fontSize: 13, color: "var(--color-on-surface-variant, #43483e)" }}>
                  Your answer: <span style={{ color: q.isCorrect ? "#0f766e" : "#bf2a24" }}>{q.userAnswer}</span>
                </div>
                {!q.isCorrect && (
                  <div style={{ fontSize: 13, color: "var(--color-on-surface-variant, #43483e)", marginTop: 2 }}>
                    Correct answer: <span style={{ fontWeight: 600, color: "#0f766e" }}>{q.correctAnswer}</span>
                  </div>
                )}
                {q.feedback && (
                  <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, padding: "8px 12px", background: "rgba(69,103,50,0.08)", borderRadius: 10 }}>
                    {q.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {chat ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <SubjectBadge subject={chat.subject} />
              <h2 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700 }}>{chat.topic || "Chat Session"}</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-on-surface-variant, #43483e)" }}>
                {chat.messageCount} messages
              </p>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-on-surface-variant, #43483e)", textAlign: "center", padding: "40px 0" }}>
              Full chat transcript is available when you reconnect.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function OfflineContent() {
  const [online, setOnline] = useState(false);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailView>(null);

  useEffect(() => {
    const check = () => setOnline(navigator.onLine);
    window.addEventListener("online", check);
    return () => window.removeEventListener("online", check);
  }, []);

  useEffect(() => {
    if (online) {
      window.location.reload();
    }
  }, [online]);

  useEffect(() => {
    async function load() {
      try {
        const db = await getDb();
        const result: CachedItem[] = [];

        const lessons = await db.getAll("lessons");
        for (const lesson of lessons.slice(0, 5)) {
          result.push({
            id: lesson.id,
            type: "lesson",
            title: lesson.topic,
            subtitle: `Grade ${lesson.grade_band.replace("_", " ")} • ${lesson.language_mode}`,
            subject: lesson.subject,
            savedAt: lesson.created_at,
            lesson,
          });
        }

        const practiceResults = await db.getAll("practice-results");
        for (const pr of practiceResults.slice(0, 5)) {
          result.push({
            id: pr.id,
            type: "practice",
            title: pr.topic,
            subtitle: `${pr.score} / ${pr.total} correct`,
            subject: pr.subject,
            savedAt: pr.completedAt,
            practice: pr,
          });
        }

        const chatSessions = await db.getAll("chat-sessions");
        for (const cs of chatSessions.slice(0, 3)) {
          result.push({
            id: cs.id,
            type: "chat",
            title: cs.topic || `${formatSubject(cs.subject)} Session`,
            subtitle: `${cs.messageCount} message${cs.messageCount !== 1 ? "s" : ""}`,
            subject: cs.subject,
            savedAt: cs.lastActiveAt,
            chat: cs,
          });
        }

        result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setItems(result);
      } catch (err) {
        console.error("Failed to load offline items:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        backgroundColor: "var(--color-surface, #f6fbf1)",
        color: "var(--color-on-surface, #171d17)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 0,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: "var(--surface, rgba(255,255,255,0.78))",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border, rgba(23,33,43,0.12))",
        }}
      >
        <span style={{ fontSize: 28, lineHeight: 1 }}>&#x1F4E1;&#xFE0F;</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>You&apos;re offline</h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-on-surface-variant, #43483e)" }}>
            Cached study items are still available below
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            backgroundColor: "var(--color-primary, #456732)",
            color: "var(--color-on-primary, #fff)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Try again
        </button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 16,
                  background: "var(--color-surface-container, #eaf0e5)",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--color-on-surface-variant, #43483e)",
            }}
          >
            <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>&#x1F4DA;</span>
            <p style={{ fontSize: 14, margin: 0 }}>
              No cached study items yet. Study online first to build your offline collection.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", color: "var(--color-on-surface-variant, #43483e)" }}>
              Recently cached ({items.length})
            </p>
            {items.map((item) => (
              <ItemCard key={`${item.type}-${item.id}`} item={item} onClick={() => {
                if (item.type === "lesson" && item.lesson) setDetail({ type: "lesson", data: item.lesson });
                else if (item.type === "practice" && item.practice) setDetail({ type: "practice", data: item.practice });
                else if (item.type === "chat" && item.chat) setDetail({ type: "chat", data: item.chat });
              }} />
            ))}
          </div>
        )}
      </div>

      {detail && <DetailPanel detail={detail} onClose={() => setDetail(null)} />}
    </main>
  );
}
