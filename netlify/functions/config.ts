export default async () => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  );

  return Response.json({
    hasGeminiKey: hasGemini,
    hasAnthropicKey: false,
    activeProvider: hasGemini ? "Gemini" : "Aucune clé configurée",
  });
};
