import { NextRequest, NextResponse } from 'next/server';

// Demo-mode fallback used when no OPENAI_API_KEY is configured (e.g. this
// preview deployment). It can't understand the message the way an LLM can,
// but it must never show unfilled template placeholders — so it pulls the
// actual observation/feeling/reason out of what the user wrote instead of
// leaving generic bracket tokens like "[Emotion]" in the output.
function buildDemoTranslation(originalMessage: string) {
  const trimmed = originalMessage.trim();
  const clauses = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const observation = (clauses[0] || trimmed).replace(/[.!?]+$/, '');

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
  const reason = weilMatch ? weilMatch[1].trim() : 'mir das wichtig ist';

  return {
    translatedMessage:
      `Wenn ich das erlebe: "${observation}" – fühle ich mich ${feeling}, weil ${reason}. ` +
      'Ich würde mir wünschen, dass wir gemeinsam eine Lösung finden, mit der wir beide gut leben können. ' +
      'Können wir darüber sprechen?',
    insights:
      'Demo-Modus (kein OPENAI_API_KEY hinterlegt): Diese Umformulierung übernimmt deine eigene ' +
      'Beobachtung und ein passendes Gefühlswort aus deinem Text, ist aber nicht KI-generiert. ' +
      'Für eine wirklich individuelle Analyse OPENAI_API_KEY setzen (siehe .env.example) – dann ' +
      'übernimmt GPT-4o-mini die Umformulierung.',
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
              'Zeige echtes Mitgefühl, entferne Vorwürfe und formuliere konkrete Bitten. ' +
              'Antworte IMMER auf Schweizer Hochdeutsch (ss statt ß). ' +
              'Gib deine Antwort in diesem JSON-Format zurück: ' +
              '{"translatedMessage": "...", "insights": "..."} ' +
              'Nutze im translatedMessage das GFK-Muster: ' +
              '"Ich habe Schwierigkeiten mit [Beobachtung]. Ich fühle mich [Gefühl], weil [Grund]. ' +
              'Ich würde mir [konkrete Bitte] wünschen."',
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
