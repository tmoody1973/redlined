/**
 * Pre-generate narrator audio for all 14 story/chapter clips.
 *
 * Usage:
 *   npx convex env set ELEVENLABS_API_KEY <key>
 *   npm run seed:narration
 */

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { readFileSync } from "fs";

// ---------- Load Convex URL from .env.local ----------
const envFile = readFileSync(".env.local", "utf-8");
const match = envFile.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
if (!match) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}
const client = new ConvexHttpClient(match[1].trim());

// ---------- All 14 narrator entries ----------
const NARRATOR_ENTRIES: { cacheKey: string; text: string }[] = [
  // 6 story beats
  {
    cacheKey: "narrator:grading",
    text: "In 1938, the federal government sent surveyors into 239 American cities. Their job: grade every neighborhood from A to D — 'Best' to 'Hazardous.' The grades weren't based on building quality. They were based on who lived there.",
  },
  {
    cacheKey: "narrator:best-in-class",
    text: "A-grade neighborhoods — marked green — were 'homogeneous,' meaning white, native-born, and upper-income. Federal surveyors described them as 'best' for mortgage lending. Banks followed the ratings, funneling investment into these areas for decades.",
  },
  {
    cacheKey: "narrator:hazardous",
    text: "D-grade neighborhoods — marked red — were labeled 'Hazardous' almost exclusively because of racial composition. In Milwaukee, the appraiser wrote: 'This is the Negro and slum area.' That single sentence cut off mortgage access for an entire community.",
  },
  {
    cacheKey: "narrator:what-was-lost",
    text: "Bronzeville — Milwaukee's Black cultural center — thrived along Walnut Street with jazz clubs, Black-owned businesses, and a tight-knit community. In the 1960s, the city demolished most of it to build Interstate 43. The highway didn't just destroy buildings. It erased a neighborhood's identity.",
  },
  {
    cacheKey: "narrator:invisible-lines",
    text: "Racial covenants reinforced what the HOLC maps started. Deed restrictions legally barred Black families from buying homes in most of Milwaukee. Even after the Supreme Court struck them down in 1948, the boundaries held through custom, steering, and institutional inertia.",
  },
  {
    cacheKey: "narrator:still-here",
    text: "Today, the boundaries drawn in 1938 predict income, wealth, and health outcomes with startling accuracy. The median household income gap between A-grade and D-grade areas persists almost dollar-for-dollar, 87 years later. The map changed. The inequality didn't.",
  },

  // 8 Bronzeville chapters
  {
    cacheKey: "narrator:ch-the-arrival",
    text: "Between 1916 and 1970, six million Black Americans left the South in what became the Great Migration. Thousands came to Milwaukee, settling in a narrow corridor the city permitted them to occupy — bounded by racial covenants, custom, and eventually federal policy.",
  },
  {
    cacheKey: "narrator:ch-walnut-street",
    text: "By the 1930s, Walnut Street was the heart of Black Milwaukee. Jazz clubs, barbershops, churches, and Black-owned businesses lined the corridor. Bronzeville wasn't just a neighborhood — it was a self-contained economy born from exclusion, thriving despite it.",
  },
  {
    cacheKey: "narrator:ch-stamped-hazardous",
    text: "In 1938, HOLC surveyors arrived in Milwaukee and drew their map. The Bronzeville corridor received a D grade — 'Hazardous.' The appraiser's description was blunt: 'This is the Negro and slum area of Milwaukee.' That classification made it nearly impossible for residents to get mortgages, ensuring decades of disinvestment.",
  },
  {
    cacheKey: "narrator:ch-invisible-wall",
    text: "Racial covenants carved Milwaukee into zones of permission and exclusion. Deed restrictions explicitly barred Black families from purchasing homes across most of the city. Even after Shelley v. Kraemer (1948) made covenants legally unenforceable, the invisible walls held — realtors steered, banks redlined, and neighbors enforced.",
  },
  {
    cacheKey: "narrator:ch-the-bulldozers",
    text: "In the 1960s, Milwaukee chose to route Interstate 43 directly through the heart of Bronzeville. Entire blocks of Walnut Street were demolished. Hundreds of Black-owned businesses, homes, and cultural institutions were razed. The community called it 'urban removal' — displacement dressed as progress.",
  },
  {
    cacheKey: "narrator:ch-sound-of-absence",
    text: "Where Walnut Street's jazz clubs once drew crowds, today there is highway concrete and empty lots. The demolitions didn't just remove structures — they severed social networks, destroyed generational wealth, and scattered a community that had built something remarkable despite systematic oppression.",
  },
  {
    cacheKey: "narrator:ch-what-remains",
    text: "Some traces of old Bronzeville persist. America's Black Holocaust Museum stands as witness. A few original structures survived the highway. But the fabric of the neighborhood — the density, the walkability, the critical mass of Black enterprise — was permanently altered by the bulldozers.",
  },
  {
    cacheKey: "narrator:ch-still-here",
    text: "The 1938 HOLC map is 87 years old, but its boundaries still predict who thrives and who struggles in Milwaukee. Census data shows that D-graded areas have median incomes roughly half those of A-graded areas. The lines were drawn in ink. The consequences were written in lives.",
  },
];

// ---------- Generate clips sequentially ----------
async function main() {
  console.log(`Seeding ${NARRATOR_ENTRIES.length} narrator clips...\n`);

  for (let i = 0; i < NARRATOR_ENTRIES.length; i++) {
    const entry = NARRATOR_ENTRIES[i];
    console.log(
      `[${i + 1}/${NARRATOR_ENTRIES.length}] ${entry.cacheKey} (${entry.text.length} chars)`,
    );

    try {
      const url = await client.action(
        anyApi.tts.generateNarratorAudio as never,
        { cacheKey: entry.cacheKey, text: entry.text },
      );

      if (url) {
        console.log(`  ✓ ${url}\n`);
      } else {
        console.log(
          `  ✗ No URL returned (check ELEVENLABS_API_KEY is set)\n`,
        );
      }
    } catch (err) {
      console.error(`  ✗ Error:`, err);
    }

    // 1s delay between calls to respect ElevenLabs rate limits
    if (i < NARRATOR_ENTRIES.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log("Done.");
}

main();
