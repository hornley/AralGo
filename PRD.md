# Product Requirements Document: AralGo AI Study Companion

## 1. Overview

AralGo is an AI-powered study companion designed to help Filipino learners access personalized academic support even when tutor access, device quality, or internet connectivity are limited. The product provides bilingual explanations in Filipino and English, generates practice exercises on demand, adapts support to a learner's grade level and demonstrated understanding, and is optimized for mobile-first, low-bandwidth use.

The product is not just a static lesson library. Its core value is AI tutoring: students can ask for explanations, request simpler or deeper versions of a concept, generate practice exercises, and receive guidance tailored to their subject, grade level, and recent performance.

## 2. Problem Statement

Many Filipino students face barriers to quality educational support because:

- Access to tutors is limited or expensive.
- Internet connectivity may be weak, unstable, or intermittent.
- Learners may understand concepts better in Filipino, English, or a mix of both.
- Existing learning tools often do not adapt to the learner's level or pace.
- Students outside major urban centers may rely primarily on low-cost mobile devices.

AralGo should reduce these barriers by offering accessible, personalized, bilingual academic help that works well on mobile devices and remains usable in low-bandwidth conditions.

## 3. Goals

- Provide AI-powered academic assistance for Filipino learners across multiple school subjects.
- Explain concepts in Filipino, English, or mixed bilingual mode.
- Generate lesson content, guided explanations, summaries, and practice exercises on demand.
- Adapt explanations and question difficulty to the learner's grade level and demonstrated mastery.
- Prioritize mobile usability and low-bandwidth performance.
- Make the product usable for both structured study sessions and quick question-and-answer tutoring.

## 4. Non-Goals

- Rebuilding a pre-existing gamified app experience feature-for-feature.
- Requiring constant high-speed connectivity for core learning flows.
- Supporting teacher dashboards, classroom administration, or LMS-style grading in the first release.
- Covering every possible curriculum standard in the first release.
- Producing formally accredited grades, certificates, or official school records.

## 5. Target Users

- Filipino elementary, junior high, and senior high school learners who need extra academic support.
- Students who prefer explanations in Filipino, English, or a blended style.
- Students studying on low-cost Android phones or older mobile devices.
- Learners in areas with unstable or expensive mobile data access.
- Parents or guardians helping students study at home.

## 6. Product Vision

AralGo should feel like a patient study companion that can:

- explain a topic clearly,
- switch language style when needed,
- create practice materials instantly,
- adjust difficulty up or down,
- and continue to be useful even when network conditions are poor.

The experience should support actual tutoring behavior, not just content browsing.

## 7. Core Product Scope

### 7.1 Must Have

- AI chat-based tutoring for academic questions.
- Bilingual explanations in Filipino and English.
- User-selectable language mode:
  - Filipino
  - English
  - Mixed Filipino-English
- Subject selection across core academic areas such as Math, Science, English, and Filipino.
- Learner profile with grade level or learning level selection.
- AI-generated concept explanations.
- AI-generated practice exercises.
- AI-generated answer explanations and step-by-step guidance.
- Difficulty adaptation based on learner level and recent performance.
- Mobile-first responsive interface.
- Low-bandwidth mode with reduced payloads and minimal media dependence.
- Basic study history so learners can revisit recent topics and exercises.

### 7.2 Should Have

- Session summaries after a tutoring interaction.
- Suggested follow-up questions based on the learner's current topic.
- Practice modes:
  - multiple choice
  - short answer
  - true/false
  - step-by-step problem solving
- Saved weak-topic indicators to guide future review.
- Caching of recent study sessions and generated content for repeat access.
- Optional audio-friendly or read-aloud-ready response formatting.

### 7.3 Could Have

- Parent-facing view of recent study activity.
- Teacher-curated prompt packs or lesson starters.
- Offline review of previously generated lessons and exercises.
- Image input for worksheet or textbook questions.
- Streaks, badges, or light gamification if they do not distract from tutoring quality.

## 8. Key User Journeys

### 8.1 Ask for Help on a Topic

1. Learner opens the app on mobile.
2. Learner selects subject and grade level if not yet set.
3. Learner asks a question such as "Explain fractions" or "Ano ang photosynthesis?"
4. AralGo responds in the selected language mode.
5. Learner asks for a simpler, deeper, or step-by-step explanation.
6. AralGo adapts the answer and suggests follow-up practice.

Acceptance criteria:

- The learner can ask free-form academic questions.
- The response language follows the learner's selected language mode.
- The learner can ask for a simpler or more advanced version without restarting the session.
- Explanations avoid unnecessary jargon for lower grade levels.

### 8.2 Generate Practice Exercises

1. Learner chooses a subject and topic.
2. Learner selects a practice type or asks for one.
3. AralGo generates a set of exercises matched to the learner's level.
4. Learner answers questions inside the app.
5. AralGo checks answers and explains mistakes.
6. AralGo can generate another set with easier or harder difficulty.

Acceptance criteria:

- Practice items are generated on demand.
- Practice difficulty reflects grade level and prior performance.
- The learner receives answer explanations, not just correctness labels.
- The learner can request more practice without losing context.

### 8.3 Switch Language for Better Understanding

1. Learner starts in English or Filipino.
2. Learner taps a control such as "Explain in Filipino" or "Explain in English."
3. AralGo re-explains the concept in the requested language.
4. Learner may choose mixed mode for bilingual reinforcement.

Acceptance criteria:

- Language switching is available during an active session.
- Re-explanations preserve the current topic context.
- Mixed-mode output remains readable and intentional, not random code-switching.

### 8.4 Receive Level-Appropriate Support

1. Learner sets grade level during onboarding or profile setup.
2. Learner completes exercises over time.
3. AralGo detects whether the learner is struggling or succeeding consistently.
4. AralGo adjusts wording, examples, and exercise difficulty.

Acceptance criteria:

- Learner profile stores a level or grade band.
- The system can lower or raise difficulty based on recent interactions.
- Adaptation affects both explanations and generated exercises.

### 8.5 Study in Low-Bandwidth Conditions

1. Learner opens the app with slow or unstable mobile data.
2. The app loads a lightweight interface quickly.
3. Learner submits a question or requests practice.
4. The app minimizes unnecessary assets and recovers gracefully from network disruption.
5. The learner can still access recent cached study items when available.

Acceptance criteria:

- The core interface remains usable on low-end mobile connections.
- The app does not depend on heavy images, videos, or animations for core learning flows.
- Error and retry states are clear and lightweight.
- Previously viewed study content can be reopened when cached locally.

## 9. Functional Requirements

### 9.1 Onboarding and Learner Profile

- Support lightweight onboarding that collects:
  - preferred language mode,
  - grade level or learning band,
  - preferred subjects,
  - optional study goals.
- Allow guest use with minimal setup friction.
- Persist learner preferences locally and optionally to an authenticated account.

### 9.2 AI Tutoring

- Accept free-form learner questions.
- Generate concept explanations tailored to:
  - selected subject,
  - selected language mode,
  - learner grade level,
  - recent performance when available.
- Support follow-up tutoring actions:
  - explain simply,
  - explain step by step,
  - give an example,
  - translate explanation,
  - summarize key points.
- Keep conversational context for the active study session.

### 9.3 AI-Generated Lesson Content

- Generate short topic lessons on demand.
- Lessons may include:
  - overview,
  - key terms,
  - worked examples,
  - common mistakes,
  - quick recap.
- Generated lessons should be structured for mobile reading with short sections.
- The app should allow regeneration of a lesson in a simpler, harder, shorter, or bilingual form.

### 9.4 AI-Generated Practice

- Generate practice sets by subject, topic, and difficulty.
- Support multiple exercise formats:
  - multiple choice,
  - short answer,
  - true/false,
  - guided problem solving.
- Provide answer checking and explanatory feedback.
- Allow the learner to request:
  - more like this,
  - easier set,
  - harder set,
  - explain the answer.

### 9.5 Personalization and Adaptation

- Store learner grade level or equivalent learning band.
- Track recent exercise performance at minimum by:
  - topic,
  - difficulty,
  - correctness,
  - timestamp.
- Use recent performance to adapt:
  - explanation complexity,
  - vocabulary difficulty,
  - exercise difficulty,
  - amount of scaffolding.
- Avoid adapting so aggressively that the learner loses continuity.

### 9.6 Subject Coverage

- Initial release should support at least:
  - Mathematics
  - Science
  - English
  - Filipino
- The system should be extensible for additional subjects later.
- Subject prompts and guardrails should be tuned so generated outputs remain educational and age-appropriate.

### 9.7 Language Support

- Every core tutoring flow must support:
  - Filipino
  - English
  - Mixed Filipino-English mode
- Language preference can be changed at any time.
- Practice questions and answer explanations should follow the selected language mode unless the learner requests translation.

### 9.8 Study History

- Show recent sessions, topics, or generated practice sets.
- Allow a learner to reopen a recent item.
- Store enough metadata to resume context without requiring a full transcript in every view.

### 9.9 Accounts and Sessions

- Support guest sessions.
- Support optional registered accounts for saved history across devices.
- Keep unauthenticated access lightweight so students can start studying quickly.
- Protect personal data and avoid collecting unnecessary information.

### 9.10 Safety and Quality

- The system should avoid unsafe, abusive, or clearly off-topic outputs.
- Academic responses should be framed as study support, not as guaranteed official answers.
- The product should favor clarity and age-appropriate explanations.
- Responses should make uncertainty visible when a question is ambiguous.

## 10. Low-Bandwidth and Mobile Requirements

- Optimize the app for low-cost Android phones and mobile browsers.
- Keep initial page load lightweight.
- Avoid making heavy media a dependency for core tutoring flows.
- Prefer text-first interfaces with optional enhancements.
- Minimize round trips where possible in key interactions.
- Cache recent sessions, lessons, and exercises locally when feasible.
- Provide retry behavior and graceful degradation for interrupted requests.
- Ensure tap targets, typography, and input controls are usable on small screens.

## 11. Data Model

Recommended entities:

- `LearnerProfile`: id, accountId/null, displayName/null, gradeLevel, preferredLanguageMode, preferredSubjects, createdAt, updatedAt.
- `StudySession`: id, learnerProfileId, subject, topic, startedAt, lastActiveAt.
- `TutorMessage`: id, studySessionId, role, languageMode, content, createdAt.
- `GeneratedLesson`: id, learnerProfileId, subject, topic, level, languageMode, contentJson, createdAt.
- `PracticeSet`: id, learnerProfileId, subject, topic, difficulty, languageMode, createdAt.
- `PracticeQuestion`: id, practiceSetId, type, prompt, optionsJson/null, answerKeyJson, explanationJson, order.
- `PracticeAttempt`: id, learnerProfileId, practiceSetId, score, completedAt.
- `PracticeResponse`: id, practiceAttemptId, practiceQuestionId, learnerAnswerJson, isCorrect, feedbackJson.
- `TopicPerformance`: id, learnerProfileId, subject, topic, rollingAccuracy, rollingDifficulty, lastPracticedAt.
- `CachedStudyItem`: id, learnerProfileId, itemType, itemRefId, cachedAt, expiresAt/null.

## 12. Technical Requirements

- Use Next.js as the primary web application framework.
- Use a modern Next.js stack suitable for mobile-first delivery.
- The application should support AI inference or API-backed generation for:
  - tutoring responses,
  - lesson generation,
  - practice generation,
  - answer explanations.
- Prompting and response handling should incorporate:
  - subject context,
  - language preference,
  - grade level,
  - adaptation state.
- Separate product logic from prompt configuration so subject and level behavior can be improved without rewriting the whole app.
- Log generation requests and key outcomes in a privacy-conscious way for quality improvement.
- Add automated tests for:
  - adaptation logic,
  - language-mode behavior,
  - practice rendering,
  - low-bandwidth fallbacks,
  - study history persistence.

## 13. Accessibility Requirements

- Core flows must be usable with keyboard navigation where relevant on web.
- Text must remain legible on small screens.
- Form controls and chat inputs must have clear labels.
- Color contrast must meet WCAG AA for core text and controls.
- The interface should not rely only on color to communicate correctness.
- Feedback and errors should be understandable to younger learners.

## 14. Analytics and Success Metrics

Recommended events:

- onboarding_completed
- language_mode_selected
- subject_selected
- tutor_question_submitted
- tutor_response_received
- lesson_generated
- practice_set_generated
- practice_question_answered
- practice_set_completed
- difficulty_adjusted
- language_switched
- recent_item_reopened
- retry_triggered

Success metrics:

- Percentage of users who complete a first tutoring interaction.
- Percentage of users who generate at least one practice set.
- Repeat usage within 7 days.
- Average number of follow-up questions per study session.
- Practice completion rate.
- Improvement in correctness across repeated topic practice.
- Successful session completion rate under low-bandwidth conditions.

## 15. Release Priorities

### Phase 1: Core Tutor

- Build onboarding, learner profile, subject selection, and AI tutoring chat.
- Implement bilingual explanations.
- Support basic study history.
- Ship a mobile-first interface.

### Phase 2: Generated Learning Content

- Add AI-generated lesson content.
- Add AI-generated practice sets.
- Add answer explanations and follow-up actions.
- Add learner-controlled language switching within sessions.

### Phase 3: Personalization

- Add learner performance tracking.
- Add adaptive difficulty and explanation tuning.
- Improve subject-specific prompt quality.
- Add recent weak-topic guidance.

### Phase 4: Low-Bandwidth Hardening

- Add caching of recent study items.
- Improve degraded-network behavior and retry flows.
- Reduce payload sizes and optimize mobile performance.
- Test on low-end devices and constrained networks.

## 16. Acceptance Checklist

- Learners can ask academic questions and receive AI-generated tutoring responses.
- Learners can receive explanations in Filipino, English, or mixed mode.
- Learners can generate practice exercises for multiple subjects.
- Learners can request simpler, harder, shorter, or step-by-step explanations.
- The system adapts support based on grade level and recent learner performance.
- The product supports at least Math, Science, English, and Filipino.
- The mobile experience is usable on small screens.
- The app remains functional and understandable under low-bandwidth conditions.
- Recent study items can be reopened when available.
- The PRD reflects an AI tutoring product, not a static content migration project.
