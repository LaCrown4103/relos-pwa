import { NextRequest, NextResponse } from 'next/server';

// Extreme profanity/threats never reach the model at all — this is a coarse,
// deliberately narrow net (not a general profanity filter) for content no
// rewrite should paper over: death/violence threats and the harshest slurs.
// Ordinary relationship frustration ("du nervst", "das ist unfair") must
// still go through to be rephrased, so keep this list short and specific.
const BLOCK_PATTERNS: RegExp[] = [
  /ich\s+(bring|töte|schlag)e?\s+dich/i,
  /ich\s+(werde|will)\s+dir\s+weh\s?tun/i,
  /du\s+solltest\s+(sterben|tot sein)/i,
  /hurensohn|wichser|fotze/i,
];

function isBlocked(message: string): boolean {
  return BLOCK_PATTERNS.some((pattern) => pattern.test(message));
}

const BLOCKED_MESSAGE =
  'Diese Nachricht enthält Drohungen oder extreme Beleidigungen, die sich nicht sinnvoll umformulieren lassen. ' +
  'Wenn es gerade eskaliert: Nimm dir kurz Abstand, bevor ihr weiterredet. Bei akuter Gefahr wende dich an ' +
  'die Polizei (112) oder das Hilfetelefon Gewalt gegen Männer/Frauen (116 016, kostenlos und anonym).';

const REFUSAL_MESSAGE =
  'Diese Nachricht enthält starke Vorwürfe, die sich schwer neutral formulieren lassen. ' +
  'Was genau ist dein eigentliches Bedürfnis dahinter?';

const SYSTEM_PROMPT = `Rolle: Du bist ein einfühlsamer Kommunikations-Coach für Paare, spezialisiert auf Gewaltfreie Kommunikation (GFK).
Aufgabe: Analysiere die impulsive, vorwurfsvolle oder verletzende Nachricht des Nutzers. Erkenne die zugrunde liegende Emotion und das unerfüllte Bedürfnis. Formuliere den Text in eine konstruktive, deeskalierende Nachricht um, die der Partner ohne Verteidigungshaltung annehmen kann.
Tonfall: Natürlich, ehrlich, auf Augenhöhe und nicht wie aus einem Lehrbuch. Keine therapeutischen Floskeln.

Die 4 Grundregeln der GFK:
1. Tatsachen statt Bewertungen (Beobachtung): Beschreibe nur neutral, was passiert ist. Entferne zwingend Verallgemeinerungen wie "immer", "nie" oder beleidigende rhetorische Fragen ("Bist du überhaupt ein Mann?").
2. Echte Gefühle benennen (Gefühl): Formuliere reine Ich-Botschaften (z.B. "Ich bin gestresst"). Filtere Pseudo-Gefühle heraus, die einen verdeckten Angriff darstellen (wie "Ich fühle mich von dir sabotiert").
3. Unerfüllte Bedürfnisse aufdecken (Bedürfnis): Das ist die wichtigste Übersetzungsleistung. Leite aus der Wut des Nutzers ab, was er eigentlich braucht (z.B. Entlastung, Wertschätzung, Ordnung, Zusammenarbeit).
4. Machbare Bitten formulieren (Bitte): Schlage am Ende eine konkrete, positiv formulierte Handlungsbitte vor, die dem Partner eine echte Wahl lässt (z.B. "Bist du bereit, X zu tun?").

Leitplanken:
- Alltagssprache: kurze, moderne, prägnante Sätze, so wie Menschen im echten Leben schreiben.
- Antworte auf Schweizer Hochdeutsch (ss statt ß).
- Erzeuge ZWEI Varianten: "short" (kurz, pragmatisch, für den Moment) und "deep" (etwas ausführlicher, benennt das Bedürfnis explizit, spricht das grössere Muster an).
- Verliere keine inhaltliche Information: jedes im Original genannte Thema muss in beiden Varianten wiederzufinden sein.

Ablehnung: Wenn die Nachricht offensichtliche emotionale Erpressung oder bewusste Manipulation enthält (nicht einfache Wut, sondern gezielte Manipulation), formuliere NICHT um. Gib stattdessen zurück:
{"refused": true, "message": "${REFUSAL_MESSAGE}"}

Antworte IMMER ausschliesslich mit JSON in genau einem dieser zwei Formate:
{"variants": {"short": "...", "deep": "..."}, "insights": "Ein Satz, welches Bedürfnis du erkannt hast und warum diese Formulierung hilft."}
oder (bei Ablehnung):
{"refused": true, "message": "..."}`;

// Demo-mode fallback used when no OPENAI_API_KEY is configured (e.g. this
// preview deployment). A full, faithful GFK rewrite of arbitrary free-form
// text is a language-understanding task no regex/keyword system can do
// properly — so this fallback does not attempt one. Instead it does the one
// thing it CAN do reliably: drop sentences that are themselves direct
// accusations/insults (see ACCUSATION_SENTENCE_PATTERNS below), and only
// ever quote the neutral, factual sentences that remain. Real, fully
// content-aware rewriting happens below via GPT-4o-mini once an API key is
// configured.
// Sentence-level patterns for direct accusations/insults ("Du bist kein
// Mann", "wie eine Putzfrau", "nie/immer" generalizations). These must never
// be quoted back in the "rephrased" output — that would just launder the
// insult through a template — so sentences matching them are dropped before
// building the observation, not just the words removed from the string.
const ACCUSATION_SENTENCE_PATTERNS: RegExp[] = [
  /du\s+bist\s+(kein|keine)/i,
  /du\s+(kriegst|bekommst|schaffst)\b.*\bnicht(s)?\b.*\bhin\b/i,
  /\b(immer|nie|niemals)\b/i,
  /behandelst\s+mich\s+wie/i,
  /wie\s+eine[nm]?\s+\w+/i,
  /bist\s+du\s+(überhaupt|eigentlich)/i,
  /du\s+bist\s+(so|total|völlig|einfach)/i,
];

function isAccusationSentence(sentence: string): boolean {
  return ACCUSATION_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence));
}

function buildDemoTranslation(originalMessage: string) {
  const trimmed = originalMessage.trim();

  // Split into sentences and drop the ones that are pure accusations, so
  // the template below only ever quotes neutral, non-insulting observations.
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const observationSentences = sentences.filter((s) => !isAccusationSentence(s));
  const hadAccusations = observationSentences.length < sentences.length;
  const observation =
    observationSentences.length > 0
      ? observationSentences.join(' ')
      : 'das, was gerade zwischen uns passiert.';

  const feelingPatterns: [RegExp, string][] = [
    [/genervt|nervst|nervt/i, 'genervt'],
    [/stör/i, 'gestört'],
    [/wütend|sauer/i, 'wütend'],
    [/frustr/i, 'frustriert'],
    [/ersch[öo]pft|müde|kaputt/i, 'erschöpft'],
    [/allein gelassen|einsam/i, 'allein gelassen'],
    [/übersehen|ignoriert/i, 'übersehen'],
    [/entt[äa]uscht/i, 'enttäuscht'],
    [/überfordert/i, 'überfordert'],
    [/traurig/i, 'traurig'],
    [/verletzt/i, 'verletzt'],
  ];
  const feeling =
    feelingPatterns.find(([pattern]) => pattern.test(trimmed))?.[1] || 'frustriert';

  const needPatterns: [string, string][] = [
    ['genervt', 'Ordnung und dass Aufgaben nicht an dir hängen bleiben'],
    ['gestört', 'Ordnung und dass Aufgaben nicht an dir hängen bleiben'],
    ['erschöpft', 'Entlastung und Unterstützung im Alltag'],
    ['allein gelassen', 'Verbindung und dass ihr als Team auftretet'],
    ['übersehen', 'Wertschätzung für das, was du schon machst'],
    ['enttäuscht', 'Verlässlichkeit'],
    ['überfordert', 'Entlastung'],
    ['traurig', 'Nähe und Verständnis'],
    ['verletzt', 'Respekt'],
    ['wütend', 'Fairness und Gehörtwerden'],
    ['frustriert', 'Gehörtwerden'],
  ];
  const need = needPatterns.find(([key]) => key === feeling)?.[1] || 'gehört zu werden';

  // Only look for a "weil ..." reason inside the filtered observation, never
  // in a dropped accusatory sentence.
  const weilMatch = observation.match(/weil\s+(.+?)([.!?]|$)/i);
  const reasonClause = weilMatch ? ` weil ${weilMatch[1].trim()}.` : '';

  return {
    variants: {
      short:
        `Ich bin gerade ${feeling}, wenn ich sehe: "${observation}"${reasonClause} ` +
        'Können wir kurz darüber reden?',
      deep:
        `Ich bin gerade ${feeling}, wenn ich sehe: "${observation}"${reasonClause} ` +
        `Mir ist wichtig, dass wir ${need} hinbekommen. Wärst du bereit, dich heute kurz mit mir hinzusetzen, ` +
        'damit wir das gemeinsam anschauen können?',
    },
    insights: hadAccusations
      ? `Vorwürfe und Verallgemeinerungen wurden entfernt – übrig bleibt, worum es eigentlich geht: ${need}.`
      : `Dahinter steckt vermutlich das Bedürfnis nach ${need}.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { originalMessage } = await request.json();

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Nachricht erforderlich' },
        { status: 400 }
      );
    }

    if (isBlocked(originalMessage)) {
      return NextResponse.json({
        originalMessage,
        blocked: true,
        message: BLOCKED_MESSAGE,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Demo mode fallback if no API key
    if (!apiKey || demoMode) {
      return NextResponse.json({
        originalMessage,
        ...buildDemoTranslation(originalMessage),
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Bitte wandle diese Frust-Nachricht um: "${originalMessage}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI error:', error);
      return NextResponse.json(
        { error: 'API-Fehler beim Übersetzen' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      // Model didn't return valid JSON — surface the raw text as the short
      // variant rather than silently dropping the response.
      parsed = { variants: { short: content, deep: content } };
    }

    if (parsed.refused) {
      return NextResponse.json({
        originalMessage,
        refused: true,
        message: parsed.message || REFUSAL_MESSAGE,
      });
    }

    return NextResponse.json({
      originalMessage,
      variants: {
        short: parsed.variants?.short || content,
        deep: parsed.variants?.deep || parsed.variants?.short || content,
      },
      insights: parsed.insights || 'Umformuliert nach den Prinzipien der Gewaltfreien Kommunikation.',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    );
  }
}
