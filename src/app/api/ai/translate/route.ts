import { NextRequest, NextResponse } from 'next/server';

// Demo-mode fallback used when no OPENAI_API_KEY is configured (e.g. this
// preview deployment). Rewriting an arbitrary accusatory message into a
// non-violent "I" statement WHILE preserving every piece of its actual
// content is a language-understanding task — no regex/keyword system can
// do that correctly for free-form text. Trying to fake it (e.g. by only
// using the first sentence) silently drops the real message, which is worse
// than being upfront about the limitation. So this fallback keeps the full
// original text intact (nothing is dropped) and only adds a GFK-style frame
// around it; it does NOT claim to have removed accusatory phrasing. Real
// rewriting happens below via GPT-4o-mini once OPENAI_API_KEY is set.
function buildDemoTranslation(originalMessage: string) {
  const trimmed = originalMessage.trim();

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

  const weilMatch = trimmed.match(/weil\s+(.+?)([.!?]|$)/i);
  const reasonClause = weilMatch ? ` weil ${weilMatch[1].trim()}.` : '';

  return {
    translatedMessage:
      `Das beschäftigt dich gerade: "${trimmed}"\n\n` +
      `Dabei fühlst du dich vermutlich ${feeling}.${reasonClause} ` +
      'Ich würde mir wünschen, dass wir gemeinsam eine Lösung finden, mit der wir beide gut leben können. ' +
      'Können wir darüber sprechen?',
    insights:
      'Demo-Modus (kein OPENAI_API_KEY hinterlegt): Ohne echtes Sprachmodell kann dieser Fallback ' +
      'Vorwürfe/Du-Botschaften nicht zuverlässig entfernen, ohne dabei Inhalt zu verlieren – deshalb ' +
      'zeigt er deinen Text unverändert an, statt ihn zu verfälschen oder zu kürzen. Für eine echte, ' +
      'inhaltlich vollständige Umformulierung ohne Vorwürfe OPENAI_API_KEY setzen (siehe .env.example) ' +
      '– dann übernimmt GPT-4o-mini die Umformulierung.',
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
          {
            role: 'system',
            content:
              'Du bist ein erfahrener Beziehungsmediator und Experte für Gewaltfreie Kommunikation (GFK). ' +
              'Der Nutzer gibt dir eine ungefilterte, emotional aufgeladene Frust-Nachricht. ' +
              'Deine Aufgabe: Wandle diese nach den Prinzipien der GFK in eine ruhige, konstruktive Ich-Botschaft um. ' +
              'Zwei Anforderungen sind nicht verhandelbar: ' +
              '(1) KEINE Du-Botschaften oder Vorwürfe – jede Formulierung, die die andere Person direkt ' +
              'anspricht, beschuldigt oder bewertet ("du bist...", "du machst nie...", "du nervst"), muss ' +
              'zu einer Ich-Aussage über die eigene Beobachtung/das eigene Gefühl umgebaut werden. ' +
              '(2) Verliere dabei KEINE inhaltliche Information aus der Originalnachricht – jedes konkrete ' +
              'Thema, jede genannte Situation und jeder Streitpunkt muss in der Umformulierung wiederzufinden ' +
              'sein, auch wenn die Nachricht mehrere Punkte enthält. Fasse nicht auf einen einzigen Satz zusammen. ' +
              'Zeige echtes Mitgefühl und formuliere am Ende eine konkrete Bitte. ' +
              'Antworte IMMER auf Schweizer Hochdeutsch (ss statt ß). ' +
              'Gib deine Antwort in diesem JSON-Format zurück: ' +
              '{"translatedMessage": "...", "insights": "..."} ' +
              'Struktur für translatedMessage (bei mehreren Themen: pro Thema eine eigene Beobachtung/Gefühl, ' +
              'dann eine gemeinsame Bitte am Schluss): ' +
              '"Ich habe Schwierigkeiten mit [Beobachtung 1]. Ich fühle mich [Gefühl], weil [Grund]. ' +
              '[Beobachtung 2, falls vorhanden]... Ich würde mir [konkrete Bitte] wünschen."',
          },
          {
            role: 'user',
            content: `Bitte wandle diese Frust-Nachricht um: "${originalMessage}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        translatedMessage: content,
        insights: 'Nachricht mit GFK-Prinzipien umformuliert.',
      };
    }

    return NextResponse.json({
      originalMessage,
      translatedMessage: parsed.translatedMessage || content,
      insights: parsed.insights || 'Transformiert zu einer konstruktiven Nachricht.',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    );
  }
}
