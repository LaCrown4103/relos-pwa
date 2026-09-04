import { NextRequest, NextResponse } from 'next/server';
import { DateIdea } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { budget, setting, energyLevel } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Demo mode fallback
    if (!apiKey || demoMode) {
      const demoIdeas: DateIdea[] = [
        {
          title: 'Gemütlicher Filmabend mit Snacks',
          description: 'Perfekt für Couch-Modus. Lieblingsfilm, Popcorn und Kuscheln.',
          estimatedCost: 'gratis',
          estimatedDuration: '2-3 Stunden',
          steps: [
            'Film aussuchen, den beide noch nicht gesehen haben',
            'Snacks und Getränke vorbereiten',
            'Handy ausschalten',
            'Kuschelig auf der Couch',
          ],
        },
        {
          title: 'Kochkurs zu Hause',
          description:
            'Gemeinsam ein neues Rezept ausprobieren. Spass in der Küche mit Wein.',
          estimatedCost: 'budget',
          estimatedDuration: '2-3 Stunden',
          steps: [
            'Rezept zusammen aussuchen',
            'Einkaufen gehen (zusammen)',
            'Kochen und Musikhören',
            'Gemeinsam geniessen',
          ],
        },
        {
          title: 'Wanderung mit Picknick',
          description: 'Schöne Natur, Bewegung und gemeinsamer Spass.',
          estimatedCost: 'gratis',
          estimatedDuration: '3 Stunden',
          steps: [
            'Wander-Route planen',
            'Picknick-Korb packen',
            'Früh starten',
            'Schöne Platz suchen und geniessen',
          ],
        },
      ];
      return NextResponse.json(demoIdeas);
    }

    const prompt = `Du bist ein kreativer Beziehungs-Coach und Erlebnis-Experte.
Generiere genau 3 konkrete, detaillierte Date-Ideen basierend auf:
- Budget: ${budget} (gratis, budget, luxus)
- Ort: ${setting} (zuhause, unterwegs)
- Energie: ${energyLevel} (couch-modus für niedrig, abenteuer für hoch)

Für JEDE Idee gib ein JSON-Objekt mit diesen Feldern:
{
  "title": "Name des Date",
  "description": "1-2 Sätze Beschreibung",
  "estimatedCost": "gratis|budget|luxus",
  "estimatedDuration": "z.B. '2 Stunden'",
  "steps": ["Schritt 1", "Schritt 2", "Schritt 3", "Schritt 4"]
}

Wichtig:
- Nutze Schweizer Hochdeutsch (ss statt ß)
- Sei konkret und umsetzbar
- Fokus auf Verbindung und Spass
- Gib 3 unterschiedliche Ideen

Antworte mit einem Array von JSON-Objekten, z.B.:
[{...}, {...}, {...}]`;

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
              'Du bist ein kreativer Beziehungs- und Aktivitäts-Coach. Generiere nur JSON-Arrays. Keine anderen Texte.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI error:', error);
      return NextResponse.json(
        { error: 'API-Fehler beim Generieren von Date-Ideen' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let ideas: DateIdea[];
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error('JSON parse error:', e);
      // Return demo data as fallback
      ideas = [
        {
          title: 'Spontanes Abenteuer',
          description: 'Überraschung und neue Erlebnisse teilen.',
          estimatedCost: 'budget',
          estimatedDuration: '3 Stunden',
          steps: [
            'Gemeinsam Zeit nehmen',
            'Spontan einen Ort wählen',
            'Neue Erfahrung machen',
            'Erinnerungen schaffen',
          ],
        },
      ];
    }

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Date ideas error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren von Date-Ideen' },
      { status: 500 }
    );
  }
}
