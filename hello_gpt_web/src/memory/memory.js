import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { createExitSignal, staticServer } from "../shared/server.ts";
import { gptPrompt } from "../shared/openai.ts";

// change working dirctory to the current file's directory
Deno.chdir(new URL(".", import.meta.url).pathname);
// log the current working directory with friendly message
console.log(`Current working directory: ${Deno.cwd()}`);

const app = new Application();
const router = new Router();

// API routes
router.get("/api/memory", async (ctx) => {
  const memory = ctx.request.url.searchParams.get("memory");
  if (memory === null) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Missing 'memory' parameter" };
    return;
  } else {
    const instructionFormat = `
    {
    "title": "Jazz up your memory",
    "1": "Improvisation with a Box of Chocolates: Think of jazz improvisation like a box of assorted chocolates – you never know what you're gonna get, but each piece is a delightful surprise. Each bite is a new, spontaneous creation, much like how jazz musicians weave in and out of melodies and rhythms.",
    "2": "Swing Rhythms with Swinging on a Swing Set: Picture yourself swinging back and forth on a swing set, the rhythm of your movements perfectly in sync with the swing rhythms of jazz. The higher you go, the more exhilarating the music, embodying the uplifting and energetic spirit of swing jazz.",
    "3": "Jazz Fusion with Fusion Cuisine: Think of jazz fusion like a fusion cuisine dish that blends elements from different culinary traditions to create something innovative and exciting. Just as fusion cuisine might combine flavors from Asian and Latin American kitchens, jazz fusion blends jazz with rock, funk, and other styles, producing a fresh, genre-crossing sound."}`;

    const prompt =
      `come up with a concise, fun way for memorizing ${memory} knowledge. Use food, pun, and objects found in life as a hint for memorizing. Be creative and list different ways. Respond with JSON. Use this format: ${instructionFormat}. Format it properly, such as change lines.
    Return only the JSON, starting with { and end with }.`;
    const answer = await gptPrompt(
      prompt,
      {
        temperature: 0.6,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      },
    );

    let result;
    try {
      result = JSON.parse(answer);
      //console.log(result);
    } catch (e) {
      console.error("The JSON did not parse");
      Deno.exit(1);
    }

    ctx.response.headers.set("Cache-Control", "no-store"); // Prevent caching of the response
    ctx.response.body = result;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer);

console.log("\nListening on http://localhost:8000");

await app.listen({ port: 8000, signal: createExitSignal() });
