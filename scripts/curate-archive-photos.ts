/**
 * Downloads curated Library of Congress FSA photographs of Milwaukee
 * and generates thumbnail + full-size versions for the Archive gallery.
 *
 * Usage: npx tsx scripts/curate-archive-photos.ts
 *
 * Photos are from Carl Mydans' April 1936 documentation of Milwaukee
 * housing conditions — LOT 1102, FSA/OWI Black-and-White Negatives.
 * All photos are PUBLIC DOMAIN.
 *
 * Image URLs verified via LOC JSON API (loc.gov/item/{id}/?fo=json).
 * Each digital ID (LC-DIG-fsa-XXXXXXX) maps to the tile server path.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const OUT_DIR = resolve("public/archive/photos");
const DATA_DIR = resolve("data/archive");

interface PhotoSource {
  id: string;
  /** LOC high-res JPEG (v.jpg = ~1024px view copy) */
  imageUrl: string;
  /** LOC item page for attribution */
  locUrl: string;
  title: string;
  photographer: string;
  date: string;
  category: "housing" | "industry" | "neighborhoods" | "people" | "streets";
  caption: string;
  rotation: number;
}

/**
 * Hand-curated selection of Carl Mydans' Milwaukee photographs (LOT 1102).
 * Digital IDs verified against LOC JSON API — each URL tested.
 */
const CURATED_PHOTOS: PhotoSource[] = [
  {
    id: "fsa-8b28631",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28631v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017767052/",
    title: "Rear of apartment house showing Milwaukee courthouse",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "The back of an apartment building near the new Milwaukee courthouse — conditions HOLC appraisers would evaluate two years later.",
    rotation: -1.2,
  },
  {
    id: "fsa-8b28628",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28628v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761449/",
    title: "Housing under Wisconsin Avenue viaduct",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Homes tucked beneath the Wisconsin Avenue viaduct. Living in the shadow of infrastructure, literally.",
    rotation: 2.1,
  },
  {
    id: "fsa-8b26530",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b26000/8b26500/8b26530v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761462/",
    title: "Slums. Milwaukee, Wisconsin",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Housing in what the government called 'slums' — neighborhoods that would be graded D (Hazardous) by HOLC.",
    rotation: -0.8,
  },
  {
    id: "fsa-8b28642",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28642v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761463/",
    title: "Closeup of rear of houses, 900 block West Clyburn Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Rear view of houses on West Clyburn Street's 900 block. Back-of-house conditions factored heavily into HOLC grading.",
    rotation: 1.5,
  },
  {
    id: "fsa-8b28648",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28648v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761471/",
    title: "Residential houses crowded in industrial district",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Residential housing pressed against Milwaukee's industrial zone — proximity to factories lowered HOLC grades.",
    rotation: -2.3,
  },
  {
    id: "fsa-8b28618",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28618v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761440/",
    title: "Milwaukee freight yards and industrial plants",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "industry",
    caption:
      "Milwaukee's freight yards overshadowed by a residential district. Industrial employment drew workers, but living nearby meant lower property values.",
    rotation: 0.7,
  },
  {
    id: "fsa-8b28629",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28629v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761450/",
    title: "House on alley between 7th and 8th Streets",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "A house on the alley between 7th and 8th and Milbourn and State Streets. HOLC appraisers would walk these blocks and decide their future.",
    rotation: -1.8,
  },
  {
    id: "fsa-8b28654",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28654v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761476/",
    title: "Rear of apartments at 8th and Wisconsin",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Apartment buildings at 8th and Wisconsin Avenue, with the Milwaukee Public Library in background. The heart of what would become a C-graded zone.",
    rotation: 2.5,
  },
  {
    id: "fsa-8b26532",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b26000/8b26500/8b26532v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761469/",
    title: "House at 437 North Jackson Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "437 North Jackson Street. Specific addresses documented by the FSA — many of these buildings are now gone.",
    rotation: -0.5,
  },
  {
    id: "fsa-8b28649",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28649v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761472/",
    title: "Alley and houses at 1012 West Somers Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Looking down the alley at 1012 West Somers Street. Alleys were gathering places and sometimes the only outdoor space.",
    rotation: 1.9,
  },
  {
    id: "fsa-8b28650",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28650v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761473/",
    title: "View from living quarters at 730 West Winnebago Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "The view from inside a home at 730 West Winnebago Street, looking toward the alley. Daily life in a neighborhood the government would soon label 'Hazardous.'",
    rotation: -2.8,
  },
  {
    id: "fsa-8b28643",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28643v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761464/",
    title: "Rear of houses, 900 block West Clybourn Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Rear of a group of houses on West Clybourn Street. What front facades hid, back alleys revealed.",
    rotation: 0.3,
  },
  {
    id: "fsa-8b28620",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28620v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761441/",
    title: "1316 West Walnut Street blight",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "1316 West Walnut Street. The word 'blight' in the caption — the same language HOLC appraisers would use to justify redlining.",
    rotation: -1.1,
  },
  {
    id: "fsa-8b28634",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28634v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761453/",
    title: "Group of houses at 9th and Galena Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Houses at 9th and Galena Street. Whether this block was graded A or D would determine mortgage access for decades.",
    rotation: 2.7,
  },
  {
    id: "fsa-8b28647",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28647v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761470/",
    title: "Unemployed men salvaging coke from industrial cinder pile",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "people",
    caption:
      "Unemployed men salvaging coke from an industrial cinder pile at the Milwaukee Railroad shops. HOLC appraisers noted the 'class' of residents as part of their assessments.",
    rotation: -0.9,
  },
  {
    id: "fsa-8b26531",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b26000/8b26500/8b26531v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761465/",
    title: "Group of houses, 600 block East Detroit Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "A group of houses on East Detroit Street. Two years later, an appraiser would assign a single letter grade to determine this block's financial future.",
    rotation: 1.3,
  },
  {
    id: "fsa-8b26527",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b26000/8b26500/8b26527v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761444/",
    title: "Close housing adjoining junk",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Houses pressed up against a junk yard. Proximity to 'detrimental influences' was one of the factors HOLC used to downgrade neighborhoods.",
    rotation: -2.0,
  },
  {
    id: "fsa-8b28625",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28625v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761445/",
    title: "Housing alongside Chicago and Milwaukee Railroad",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Houses alongside the Chicago and Milwaukee Railroad. Railroads and industry drove HOLC grades down in adjacent neighborhoods.",
    rotation: 0.6,
  },
  {
    id: "fsa-8b28639",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b28000/8b28600/8b28639v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761459/",
    title: "1535 North 10th Street, house next to junk yard",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "1535 North 10th Street, a house next to a junk yard. Addresses documented by the FSA — many of these buildings are now gone.",
    rotation: -1.6,
  },
  {
    id: "fsa-8b26528",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8b26000/8b26500/8b26528v.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017761447/",
    title: "Exterior of house at 912 North 8th Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "912 North 8th Street. The lines drawn on maps in 1938 would shape opportunities on this block for generations.",
    rotation: 2.2,
  },
];

async function downloadAndResize(photo: PhotoSource): Promise<boolean> {
  const thumbPath = resolve(OUT_DIR, `${photo.id}.jpg`);
  const fullPath = resolve(OUT_DIR, `${photo.id}-full.jpg`);

  if (existsSync(thumbPath) && existsSync(fullPath)) {
    console.log(`  ✓ ${photo.id} already exists, skipping`);
    return true;
  }

  try {
    console.log(`  ↓ Downloading ${photo.id}...`);
    const response = await fetch(photo.imageUrl);
    if (!response.ok) {
      console.error(`    ✗ HTTP ${response.status} for ${photo.id}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`    ${Math.round(buffer.length / 1024)}KB downloaded`);

    // Generate thumbnail (400px wide — source is ~1024px)
    await sharp(buffer)
      .resize(400)
      .jpeg({ quality: 80, progressive: true })
      .toFile(thumbPath);

    // Full-size: keep at source resolution (don't upscale)
    await sharp(buffer)
      .jpeg({ quality: 85, progressive: true })
      .toFile(fullPath);

    console.log(`    ✓ Saved thumb + full`);
    return true;
  } catch (err) {
    console.error(`    ✗ Failed: ${(err as Error).message}`);
    return false;
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  console.log(`Downloading ${CURATED_PHOTOS.length} LOC photos...\n`);

  const results: PhotoSource[] = [];

  for (const photo of CURATED_PHOTOS) {
    const ok = await downloadAndResize(photo);
    if (ok) results.push(photo);
    // Rate limit: wait 500ms between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Generate manifest
  const manifest = {
    source: "Library of Congress, FSA/OWI Black-and-White Negatives",
    license: "Public Domain",
    creditLine:
      "Library of Congress, Prints & Photographs Division, FSA/OWI Collection",
    photos: results.map((p) => ({
      id: p.id,
      title: p.title,
      photographer: p.photographer,
      date: p.date,
      thumbnailSrc: `/archive/photos/${p.id}.jpg`,
      fullSrc: `/archive/photos/${p.id}-full.jpg`,
      locUrl: p.locUrl,
      category: p.category,
      caption: p.caption,
      rotation: p.rotation,
    })),
  };

  const manifestPath = resolve(DATA_DIR, "fsa-photos.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written: ${manifestPath}`);
  console.log(
    `  ${results.length} of ${CURATED_PHOTOS.length} photos downloaded`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
