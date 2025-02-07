import { OpenAI } from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get active products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .limit(20);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return Response.json({ recommendations: [] });
    }

    console.log("Found products:", products?.length);

    if (!products?.length) {
      return Response.json({ recommendations: [] });
    }

    // Generate outfit recommendations using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a fashion stylist. Create 3 trendy outfit combinations using the provided products.
          Each outfit should have 2-4 items that work well together.
          Format your response as a JSON object with a 'recommendations' array.
          Each recommendation should have:
          {
            "title": "A catchy name for the outfit",
            "description": "Why these items work well together",
            "style": "The overall style (Casual, Formal, etc.)",
            "occasion": "Best occasion for this outfit",
            "products": ["array of product IDs to use"]
          }`,
        },
        {
          role: "user",
          content: JSON.stringify({
            products: products.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              style: p.style,
              colors: p.colors,
              occasions: p.occasions,
            })),
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    console.log("AI Response:", aiResponse);

    // Map product IDs to full product objects
    const recommendations = aiResponse.recommendations.map((outfit: any) => ({
      ...outfit,
      products: outfit.products
        .map((id: string) => products.find((p) => p.id === id))
        .filter(Boolean),
    }));

    console.log("Final recommendations:", recommendations);
    return Response.json({ recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    return Response.json({ recommendations: [] });
  }
}
