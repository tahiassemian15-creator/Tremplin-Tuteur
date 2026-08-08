import { GoogleGenAI } from "@google/genai";

const DEFAULT_SYSTEM_PROMPT = `Tu es le tuteur pédagogique personnel intégré à « Tremplin », une plateforme d’excellence dédiée à la préparation aux examens pour les élèves en classes d’examen, notamment de 3e et de Terminale. Elle couvre l’ensemble des matières essentielles : Mathématiques, Physique-Chimie, SVT, Français, Anglais, Histoire-Géographie et Philosophie.

Règle n°1 — Longueur de la réponse :
Par défaut, réponds de façon SIMPLE, DIRECTE et COURTE : donne le résultat ou la réponse finale, bien structuré, sans détailler chaque étape de calcul ni justifier la méthode.

Ne développe une explication complète, une démonstration étape par étape ou la méthode de résolution QUE si l'étudiant le demande explicitement (mots comme "explique", "pourquoi", "comment", "détaille", "montre les étapes", "je ne comprends pas", etc.), ou si une simple réponse serait ambiguë.

Pour un exercice à plusieurs questions, donne d'abord les réponses de façon concise et numérotée ; propose ensuite en une phrase courte de détailler si besoin.

Règle n°2 — Écriture des mathématiques :
N'utilise JAMAIS de syntaxe LaTeX.

Écris toutes les mathématiques en texte normal et symboles standards :

- Fractions : "121/x" ou "121 ÷ x"
- Puissances : "x²", "x³" ou "x^2"
- Multiplication : "×" ou "*"
- Mise en valeur : **réponse**
- Racines : écris-les en toutes lettres si besoin

Ton rôle :

1. Corriger les exercices soumis (texte ou photo d'énoncé / devoir d'élève).
2. Identifier précisément les erreurs éventuelles sans juger.
3. Donner la réponse correcte de façon concise.
4. Expliquer complètement uniquement lorsque l'étudiant le demande.
5. Transmettre des techniques d'apprentissage pertinentes.
6. Adopter un ton bienveillant, stimulant et rigoureux.

Formatage :
Utilise un Markdown simple et aéré.`;

type Message = {
  role: "user" | "assistant";
  text?: string;
};

type AttachedImage = {
  data?: string;
  mediaType?: string;
};

type ChatRequest = {
  messages?: Message[];
  prompt?: string;
  attachedImage?: AttachedImage | null;
  systemPrompt?: string;
};

export default async (req: Request) => {
  // Autoriser uniquement POST
  if (req.method !== "POST") {
    return Response.json(
      {
        error: "Méthode non autorisée.",
      },
      { status: 405 },
    );
  }

  try {
    const body = (await req.json()) as ChatRequest;

    const {
      messages = [],
      prompt = "",
      attachedImage = null,
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
    } = body;

    // La clé reste uniquement côté serveur
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return Response.json(
        {
          error: "Clé Gemini non configurée.",
          message:
            "Ajoute GEMINI_API_KEY dans les variables d'environnement Netlify.",
        },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "tremplin-netlify",
        },
      },
    });

    // Historique des conversations
    const contents: Array<{
      role: "user" | "model";
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    }> = [];

    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: msg.text || "",
          },
        ],
      });
    }

    // Message actuel
    const currentParts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }> = [];

    // Image éventuellement envoyée
    if (attachedImage?.data) {
      currentParts.push({
        inlineData: {
          mimeType: attachedImage.mediaType || "image/jpeg",
          data: attachedImage.data,
        },
      });
    }

    const userText =
      prompt.trim() ||
      (attachedImage
        ? "Peux-tu analyser et corriger cet exercice joint ?"
        : "Bonjour !");

    currentParts.push({
      text: userText,
    });

    contents.push({
      role: "user",
      parts: currentParts,
    });

    // Liste des modèles (du meilleur au plus bas)
    const models = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3-flash",
    ];

    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        const reply = response.text || "Je n'ai pas pu générer de réponse.";

        return Response.json({
          reply,
          provider: model,
        });
      } catch (error: any) {
        console.error(`Erreur avec ${model}:`, error);

        if (error?.status === 429) {
          lastError = error;
          continue;
        }

        return Response.json(
          {
            error: "Erreur lors de la génération de la réponse.",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    }

    return Response.json(
      {
        error: "Limite gratuite atteinte.",
        message: "Tous les modèles sont temporairement indisponibles.",
        details: lastError?.message,
      },
      { status: 429 },
    );
  } catch (error: any) {
    console.error("Erreur globale :", error);

    return Response.json(
      {
        error: "Erreur serveur.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
