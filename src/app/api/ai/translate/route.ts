import { NextRequest, NextResponse } from 'next/server';

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
        translatedMessage:
          'Ich habe Schwierigkeiten mit [konkrete Situation]. Ich fühle mich [Emotion], weil [Grund wichtig]. ' +
          'Ich würde mir [konkrete Bitte] wünschen. Können wir gemeinsam darüber sprechen?',
        insights:
          'Diese Umformulierung nutzt die Prinzipien der Gewaltfreien Kommunikation. Sie benennt ' +
          'die Beobachtung, das Gefühl, den Grund und die konkrete Bitte.',
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
