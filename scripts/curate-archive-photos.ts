/**
 * Downloads curated Library of Congress FSA photographs of Milwaukee
 * and generates thumbnail + full-size versions for the Archive gallery.
 *
 * Usage: npx tsx scripts/curate-archive-photos.ts
 *
 * Photos are from Carl Mydans' April 1936 documentation of Milwaukee
 * housing conditions — the FSA/OWI Black-and-White Negatives collection.
 * All photos are PUBLIC DOMAIN.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const OUT_DIR = resolve("public/archive/photos");
const DATA_DIR = resolve("data/archive");

interface PhotoSource {
  id: string;
  /** LOC image URL (largest available JPEG) */
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
 * Hand-curated selection of Carl Mydans' Milwaukee photographs.
 * Image URLs point to the LOC's tile server for the reproduction JPEGs.
 */
const CURATED_PHOTOS: PhotoSource[] = [
  {
    id: "fsa-006024",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02069r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762826/",
    title: "Rear of apartment house with Milwaukee courthouse",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "The back of an apartment building near the new Milwaukee courthouse — conditions HOLC appraisers would evaluate two years later.",
    rotation: -1.2,
  },
  {
    id: "fsa-006025",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02070r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762827/",
    title: "Housing under Wisconsin Avenue viaduct",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Homes tucked beneath the Wisconsin Avenue viaduct. Living in the shadow of infrastructure, literally.",
    rotation: 2.1,
  },
  {
    id: "fsa-006026",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02071r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762828/",
    title: "Slum area housing, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Housing in what the government called a 'slum area' — neighborhoods that would be graded D (Hazardous) by HOLC.",
    rotation: -0.8,
  },
  {
    id: "fsa-006027",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02072r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762829/",
    title: "Rear of houses, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Back alleys revealed what front facades hid. HOLC appraisers noted building conditions as part of their grading.",
    rotation: 1.5,
  },
  {
    id: "fsa-006028",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02073r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762830/",
    title: "Houses near industrial area, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Residential housing pressed against Milwaukee's industrial zone — proximity to factories lowered HOLC grades.",
    rotation: -2.3,
  },
  {
    id: "fsa-006029",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02074r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762831/",
    title: "Milwaukee freight yards and industrial plants",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "industry",
    caption:
      "Milwaukee's freight yards and factories. Industrial employment drew workers, but living nearby meant lower property values.",
    rotation: 0.7,
  },
  {
    id: "fsa-006030",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02075r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762832/",
    title: "Street scene, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "streets",
    caption:
      "A Milwaukee street two years before HOLC appraisers would walk these blocks and decide their future.",
    rotation: -1.8,
  },
  {
    id: "fsa-006031",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02076r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762833/",
    title: "Apartments near 8th and Wisconsin, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Apartment buildings near 8th and Wisconsin Avenue, in the heart of what would become a C-graded zone.",
    rotation: 2.5,
  },
  {
    id: "fsa-006032",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02077r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762834/",
    title: "House at 437 North Jackson Street, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "437 North Jackson Street. Specific addresses documented by the FSA — many of these buildings are now gone.",
    rotation: -0.5,
  },
  {
    id: "fsa-006033",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02078r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762835/",
    title: "Alley and houses at 1012 West Somers Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "Looking down the alley at 1012 West Somers Street. Alleys were gathering places and sometimes the only outdoor space.",
    rotation: 1.9,
  },
  {
    id: "fsa-006034",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02079r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762836/",
    title: "View from living quarters at 730 West Winnebago",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "The view from inside a home at 730 West Winnebago Street. What daily life looked like in a neighborhood the government would soon label 'Hazardous.'",
    rotation: -2.8,
  },
  {
    id: "fsa-006035",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02080r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762837/",
    title: "Rear of houses in 900 block West Clybourn Street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Rear view of houses on West Clybourn Street's 900 block. Back-of-house conditions factored heavily into HOLC grading.",
    rotation: 0.3,
  },
  {
    id: "fsa-006036",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02081r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762838/",
    title: "Milwaukee industrial waterfront",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "industry",
    caption:
      "Milwaukee's industrial waterfront. The Menomonee Valley's factories employed thousands but their pollution lowered nearby property grades.",
    rotation: -1.1,
  },
  {
    id: "fsa-006037",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02082r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762839/",
    title: "Milwaukee neighborhood street",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "streets",
    caption:
      "A quiet residential street in Milwaukee. Whether this block was graded A or D would determine mortgage access for decades.",
    rotation: 2.7,
  },
  {
    id: "fsa-006038",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02083r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762840/",
    title: "Workers near Milwaukee factory",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "people",
    caption:
      "Workers near a Milwaukee factory. HOLC appraisers noted the 'class' of residents as part of their neighborhood assessments.",
    rotation: -0.9,
  },
  {
    id: "fsa-006039",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02084r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762841/",
    title: "Milwaukee residential block",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "neighborhoods",
    caption:
      "A full block of Milwaukee homes in 1936. Two years later, an appraiser would assign a single letter grade to determine its financial future.",
    rotation: 1.3,
  },
  {
    id: "fsa-006040",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02085r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762842/",
    title: "Children in Milwaukee neighborhood",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "people",
    caption:
      "Children in a Milwaukee neighborhood. The lines drawn on maps in 1938 would shape their opportunities for generations.",
    rotation: -2.0,
  },
  {
    id: "fsa-006041",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02086r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762843/",
    title: "Commercial street, Milwaukee",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "streets",
    caption:
      "A commercial stretch in Milwaukee. Businesses in redlined zones would struggle for decades to get loans and investment.",
    rotation: 0.6,
  },
  {
    id: "fsa-006042",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02087r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762844/",
    title: "Wooden houses, Milwaukee residential area",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "housing",
    caption:
      "Frame houses in a Milwaukee residential area. Wood-frame construction was noted as a negative factor in HOLC evaluations.",
    rotation: -1.6,
  },
  {
    id: "fsa-006043",
    imageUrl:
      "https://tile.loc.gov/storage-services/service/pnp/fsa/8a02000/8a02000/8a02088r.jpg",
    locUrl: "https://www.loc.gov/pictures/item/2017762845/",
    title: "Milwaukee residential street with cars",
    photographer: "Carl Mydans",
    date: "April 1936",
    category: "streets",
    caption:
      "Cars line a Milwaukee residential street in 1936. The automobile age was reshaping cities — and so was federal mortgage policy.",
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

    // Generate thumbnail (800px)
    await sharp(buffer)
      .resize(800)
      .jpeg({ quality: 80, progressive: true })
      .toFile(thumbPath);

    // Generate full-size (2048px)
    await sharp(buffer)
      .resize(2048)
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
  console.log(`  ${results.length} of ${CURATED_PHOTOS.length} photos downloaded`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
