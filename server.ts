import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;

// Lazy initialization for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

const DEFAULT_SYSTEM_PROMPT = `Tu es le tuteur pédagogique personnel intégré à « Tremplin », une plateforme d’excellence dédiée à la préparation aux examens pour les élèves en classes d’examen, notamment de 3e et de Terminale. Elle couvre l’ensemble des matières essentielles : Mathématiques, Physique-Chimie, SVT, Français, Anglais, Histoire-Géographie et Philosophie'.

Règle n°1 — Longueur de la réponse :
Par défaut, réponds de façon SIMPLE, DIRECTE et COURTE : donne le résultat ou la réponse finale, bien structuré, sans détailler chaque étape de calcul ni justifier la méthode. Exemple : si on te demande "1+1", réponds "1 + 1 = 2", pas plus.
Ne développe une explication complète, une démonstration étape par étape ou la méthode de résolution QUE si l'étudiant le demande explicitement (mots comme "explique", "pourquoi", "comment", "détaille", "montre les étapes", "je ne comprends pas", etc.), ou si une simple réponse serait ambiguë ou risquée sans contexte (ex. une erreur qu'il faut absolument justifier pour que l'étudiant comprenne).
Pour un exercice à plusieurs questions, donne d'abord les réponses de façon concise et numérotée (une ligne par question quand c'est possible) ; propose ensuite en une phrase courte de détailler si besoin, plutôt que de développer systématiquement.

Règle n°2 — Écriture des mathématiques :
N'utilise JAMAIS de syntaxe LaTeX (pas de \`$...$\`, \`\\frac{}{}\`, \`\\mathbf{}\`, \`\\times\`, \`\\div\`, etc.) : l'interface n'affiche pas le LaTeX, il apparaîtrait comme du code brut illisible. Écris toutes les mathématiques en texte normal et symboles clavier standards :
- Fractions : "121/x" ou "121 ÷ x" (pas \\frac)
- Puissances : "x²", "x³" (caractères unicode) ou "x^2" si le caractère n'existe pas
- Multiplication : "×" ou "*"
- Mise en valeur d'un résultat : gras Markdown normal (**réponse**), jamais \\mathbf
- Racines, sommes, etc. : écris-les en toutes lettres si besoin ("racine carrée de x")

Ton rôle :
1. Corriger les exercices soumis (texte ou photo d'énoncé / devoir d'élève) :
   - Identifie précisément les erreurs éventuelles sans juger.
   - Donne la réponse correcte de façon concise (voir Règle n°1).
   - Si l'étudiant demande une explication, explique alors la notion ou le théorème sous-jacent et démontre la démarche complète, rigoureuse et étape par étape.
   - Mets en valeur les points positifs du travail de l'étudiant.
2. Transmettre des techniques d'apprentissage éprouvées (rappel actif, répétition espacée, méthode Feynman, fiches réflexes, gestion du temps d'épreuve et du stress) — uniquement quand c'est pertinent ou demandé.
3. Adopter un ton bienveillant, stimulant et rigoureux pour donner confiance à l'étudiant, sans jamais noyer la réponse sous du texte inutile.

Formatage : Utilise un Markdown simple et aéré (numérotation, gras pour le résultat final). Réserve les titres ##, formules détaillées et encadrés d'astuces aux réponses où une explication complète a été demandée.`;

async function startServer() {
  const app = express();

  // Support JSON with larger payload for image uploads
  app.use(express.json({ limit: "30mb" }));

  // API Status & Configuration endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/config", (req, res) => {
    const hasGemini = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    );
    const hasAnthropic = Boolean(
      process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY.trim() !== "",
    );
    res.json({
      hasGeminiKey: hasGemini,
      hasAnthropicKey: hasAnthropic,
      activeProvider: hasGemini
        ? "Gemini 3.6 Flash"
        : hasAnthropic
          ? "Anthropic Claude"
          : "Aucune clé configurée",
    });
  });

  // Main Chat endpoint for Tremplin Tutor
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages = [],
        prompt = "",
        attachedImage = null,
        systemPrompt = DEFAULT_SYSTEM_PROMPT,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;

      // 1. Try Gemini API first (standard in AI Studio)
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        const ai = getGeminiClient();
        if (!ai) {
          return res
            .status(500)
            .json({ error: "Échec d'initialisation du client Gemini." });
        }

        // Construct contents array for Gemini
        const contents: Array<{
          role: "user" | "model";
          parts: Array<{
            text?: string;
            inlineData?: { mimeType: string; data: string };
          }>;
        }> = [];

        // Add history turns (skip last if it's the current one)
        for (const msg of messages) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text || "" }],
          });
        }

        // Current turn
        const currentParts: Array<{
          text?: string;
          inlineData?: { mimeType: string; data: string };
        }> = [];

        if (attachedImage && attachedImage.data) {
          // Normalize mimeType (default to image/jpeg or image/png)
          const mimeType = attachedImage.mediaType || "image/jpeg";
          currentParts.push({
            inlineData: {
              mimeType,
              data: attachedImage.data,
            },
          });
        }

        const userText =
          prompt && prompt.trim()
            ? prompt
            : attachedImage
              ? "Peux-tu analyser et corriger cet exercice joint ?"
              : "Bonjour !";
        currentParts.push({ text: userText });

        contents.push({
          role: "user",
          parts: currentParts,
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply =
          response.text ||
          "Je n'ai pas pu générer de réponse. N'hésite pas à reformuler ta question.";
        return res.json({ reply, provider: "gemini" });
      }

      // 2. Fallback to Anthropic Claude if ANTHROPIC_API_KEY is configured
      if (anthropicKey && anthropicKey.trim() !== "") {
        const anthropicMessages = messages.map(
          (m: { role: string; text: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text,
          }),
        );

        const userContent: Array<
          | { type: "text"; text: string }
          | {
              type: "image";
              source: { type: "base64"; media_type: string; data: string };
            }
        > = [];

        if (attachedImage && attachedImage.data) {
          userContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: attachedImage.mediaType || "image/jpeg",
              data: attachedImage.data,
            },
          });
        }

        userContent.push({
          type: "text",
          text: prompt || "Peux-tu m'aider avec cet exercice ?",
        });

        anthropicMessages.push({
          role: "user",
          content: userContent,
        });

        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            system: systemPrompt,
            messages: anthropicMessages,
          }),
        });

        if (!claudeRes.ok) {
          const errData = await claudeRes.text();
          console.error("Erreur Anthropic:", errData);
          return res.status(claudeRes.status).json({
            error: `Erreur API Anthropic: ${claudeRes.statusText}`,
            details: errData,
          });
        }

        const data = await claudeRes.json();
        const reply =
          data?.content
            ?.filter((b: { type: string }) => b.type === "text")
            ?.map((b: { text: string }) => b.text)
            ?.join("\n") || "Réponse vide reçue.";

        return res.json({ reply, provider: "anthropic" });
      }

      // 3. If neither key is found
      return res.status(400).json({
        error: "Aucune clé API configurée.",
        message:
          "Veuillez configurer GEMINI_API_KEY ou ANTHROPIC_API_KEY dans les paramètres pour activer la correction IA.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Erreur dans /api/chat:", errorMessage);
      return res.status(500).json({
        error: "Une erreur est survenue lors de la génération de la réponse.",
        details: errorMessage,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Tremplin actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erreur lors du démarrage du serveur:", err);
});
