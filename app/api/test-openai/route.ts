import { openai } from "@/lib/openai";

export async function GET() {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: "Decime una receta simple con pollo y miel",
      },
    ],
  });

  return Response.json({
    result: response.choices[0].message.content,
  });
}
