import type { OverlayType } from "./data-overlay";
import type {
  CameraTarget,
  BeatLayerState,
  StoryCitation,
} from "./story-beats";

/** A single chapter in the Bronzeville scrollytelling narrative. */
export interface BronzevilleChapter {
  id: string;
  number: number;
  title: string;
  camera: CameraTarget;
  /** HOLC zone area_id to select, or null for city-wide views. */
  zoneId: string | null;
  /** Year to set on the timeline. */
  year: number;
  /** Data overlay to activate, or null for none. */
  overlay: OverlayType;
  /** Layer visibility overrides. */
  layers: BeatLayerState;
  /** Main narrative text (2-4 sentences). */
  narrative: string;
  /** Key statistic displayed prominently. */
  stat: { value: string; label: string };
  /** Optional pull-quote with attribution. */
  quote?: { text: string; attribution: string };
  /** Source citations shown below the narrative. */
  citations: StoryCitation[];
}

export const BRONZEVILLE_CHAPTERS: BronzevilleChapter[] = [
  // Ch 1: The Arrival
  {
    id: "the-arrival",
    number: 1,
    title: "The Arrival",
    camera: { center: [-87.912, 43.055], zoom: 12.5, pitch: 40 },
    zoneId: null,
    year: 1920,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "In the early 1900s, Black workers fleeing the Jim Crow South arrived in Milwaukee. By 1940, nearly 21,000 African Americans had settled into a 12-block area known as Bronzeville \u2014 constrained not by choice, but by law and custom.",
    stat: { value: "21,000", label: "African Americans in Bronzeville by 1940" },
    citations: [
      {
        paperId: "ethnic-african-american",
        label: "Milwaukee African Americans",
        finding:
          "Nearly 21,000 African Americans settled in Milwaukee\u2019s Bronzeville between 1900\u20131950.",
      },
      {
        paperId: "paulson-wierschke-kim-2016",
        label: "Paulson et al., 2016",
        finding:
          "Milwaukee is the most highly segregated city in the United States.",
      },
    ],
  },

  // Ch 2: Walnut Street
  {
    id: "walnut-street",
    number: 2,
    title: "Walnut Street",
    camera: { center: [-87.918, 43.054], zoom: 14.5, pitch: 55, bearing: 15 },
    zoneId: "6305",
    year: 1938,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "Walnut Street was Milwaukee\u2019s Black Main Street. Willie Jones Billiards, Miss Lulu\u2019s Dry Goods, De Reef & Dorsey Lawyers. Jazz clubs where musicians held court every night. A complete, self-sufficient world \u2014 built because the wider city refused entry.",
    stat: { value: "12", label: "blocks of Black community" },
    quote: {
      text: "That was where the Black Jazz, the Black musicians, and the Black audience hung out.",
      attribution: "Adekola Adedapo",
    },
    citations: [
      {
        paperId: "ethnic-african-american",
        label: "Milwaukee African Americans",
        finding:
          "Walnut Street was Milwaukee\u2019s Black business district with dozens of Black-owned establishments.",
      },
      {
        paperId: "barbera-2012",
        label: "Barbera, 2012",
        finding:
          "Jazz served as a cultural bridge between Black and white communities, but urban renewal disrupted this potential.",
      },
      {
        paperId: "hood-design-2024",
        label: "Hood Design Studio, 2024",
        finding:
          "Mapped timelines of Black commercial and cultural development in Bronzeville.",
      },
    ],
  },

  // Ch 3: Stamped Hazardous
  {
    id: "stamped-hazardous",
    number: 3,
    title: "Stamped Hazardous",
    camera: { center: [-87.92, 43.054], zoom: 13.5, pitch: 50, bearing: 5 },
    zoneId: "6305",
    year: 1938,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "In 1938, federal appraisers arrived and stamped Bronzeville \u201cD\u201d \u2014 Hazardous. The appraiser\u2019s description: \u201cThis is the Negro and slum area of Milwaukee.\u201d With that grade, an entire community was cut off from federally backed mortgages, the primary engine of American wealth-building.",
    stat: { value: "3.97", label: "out of 4.0 Historic Redlining Score" },
    citations: [
      {
        paperId: "chang-smith-2016",
        label: "Chang & Smith, 2016",
        finding:
          "Home values, ownership rates, and incomes in non-redlined areas were continuously higher than redlined areas across all four time points: 1950, 1970, 1990, and 2010.",
      },
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "Class IV Areas (D-grade HOLC zones) were designated for \u201csubstantial clearance and redevelopment\u201d in the 1960s \u2014 the grades became a demolition blueprint.",
      },
    ],
  },

  // Ch 4: The Invisible Wall
  {
    id: "invisible-wall",
    number: 4,
    title: "The Invisible Wall",
    camera: { center: [-87.92, 43.06], zoom: 11.8, pitch: 40 },
    zoneId: null,
    year: 1926,
    overlay: null,
    layers: { covenantsVisible: true, ghostsVisible: false },
    narrative:
      "The grading didn\u2019t act alone. Racial covenants \u2014 legal clauses forbidding sale to non-white buyers \u2014 blanketed the county. 32,219 were filed, 71% in the 1920s alone. The National Association of Real Estate Boards\u2019 Code of Ethics directed agents not to introduce \u201cmembers of any race or nationality\u201d into neighborhoods. Bronzeville wasn\u2019t just marked \u2014 it was walled in.",
    stat: { value: "32,219", label: "racial covenants filed" },
    quote: {
      text: "Restrictive covenants and redlining set the city on a segregated track that is incredibly difficult to break.",
      attribution: "Rep. Evan Goyke",
    },
    citations: [
      {
        paperId: "paulson-wierschke-kim-2016",
        label: "Paulson et al., 2016",
        finding:
          "The Realtor Code of Ethics (1928\u20131955) explicitly directed realtors not to introduce \u2018members of any race or nationality\u2019 into neighborhoods.",
      },
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "The continuation of white neighborhood resistance, racist real estate practices, and federal redlining assured that slums would continue to be created.",
      },
    ],
  },

  // Ch 5: The Bulldozers
  {
    id: "the-bulldozers",
    number: 5,
    title: "The Bulldozers",
    camera: { center: [-87.924, 43.058], zoom: 13, pitch: 45, bearing: -10 },
    zoneId: "6300",
    year: 1965,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "In the 1960s, the city routed Interstate 43 directly through Bronzeville\u2019s heart. Walnut Street\u2019s commercial district was demolished. Thousands of families were displaced. The same D-grade maps that denied mortgages became the blueprint for urban renewal\u2019s bulldozers \u2014 Class IV Areas were designated for \u201csubstantial clearance and redevelopment.\u201d",
    stat: { value: "3,371", label: "net housing units lost, 1966\u20131971" },
    quote: {
      text: "Interstates were routed right down to the African American communities. Tore at the fabric of the community.",
      attribution: "Paul Geenen",
    },
    citations: [
      {
        paperId: "niemuth-2014",
        label: "Niemuth, 2014",
        finding:
          "Urban renewal resulted in the wholesale destruction of black neighborhoods, wiping away important areas of residential, economic and cultural development.",
      },
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "Milwaukee used federal urban renewal funds to continue racist policies of neighborhood segregation and containment. More homes were destroyed than rebuilt.",
      },
      {
        paperId: "barbera-2012",
        label: "Barbera, 2012",
        finding:
          "Jazz clubs were direct casualties of I-43 highway construction \u2014 Jimmy Mack\u2019s Main Event relocated twice before closing in 2002.",
      },
    ],
  },

  // Ch 6: The Sound of Absence
  {
    id: "sound-of-absence",
    number: 6,
    title: "The Sound of Absence",
    camera: { center: [-87.918, 43.054], zoom: 14, pitch: 55, bearing: 20 },
    zoneId: "6305",
    year: 1980,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "Jimmy Mack\u2019s Main Event \u2014 forced to relocate twice by highway construction before closing in 2002. Jazz wasn\u2019t just entertainment in Bronzeville. It was the sound of community, a bridge between Black and white Milwaukee. Urban renewal didn\u2019t just demolish buildings. It silenced the music.",
    stat: { value: "73.4% \u2192 44.7%", label: "Black male employment, 1970\u20132010" },
    quote: {
      text: "The African American community in Milwaukee was in a constant state of reappraisal, adjustment, and ultimately improvisational living.",
      attribution: "Barbera, 2012",
    },
    citations: [
      {
        paperId: "barbera-2012",
        label: "Barbera, 2012",
        finding:
          "African American migration, urban renewal, and deindustrialization combined to push jazz out of the Black community.",
      },
      {
        paperId: "niemuth-2014",
        label: "Niemuth, 2014",
        finding:
          "Black male employment in Milwaukee dropped from 73.4% (1970) to 44.7% (2010).",
      },
    ],
  },

  // Ch 7: What Remains
  {
    id: "what-remains",
    number: 7,
    title: "What Remains",
    camera: { center: [-87.936, 43.064], zoom: 13.5, pitch: 50 },
    zoneId: "6300",
    year: 2025,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: true },
    narrative:
      "Since 2005, D-grade zones have lost 7,349 buildings. A-grade zones lost 39. Zone D6 alone: 2,116 demolished \u2014 54 times more than all A-grade zones combined. Population density dropped from 24,430 per square mile in 1940 to 8,300 by 2010. The ghost buildings you see are what absence looks like.",
    stat: { value: "7,349 vs 39", label: "D-zone vs A-zone demolitions since 2005" },
    citations: [
      {
        paperId: "niemuth-2014",
        label: "Niemuth, 2014",
        finding:
          "I-43 highway destroyed Bronzeville, pushing displaced residents into Garfield Park (renamed Harambee).",
      },
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "K-3 (predominantly African American) was cleared as a \u2018slum\u2019; adjacent Midtown (white) was \u2018conserved\u2019 \u2014 same federal program, opposite outcomes by race.",
      },
      {
        paperId: "black-heritage",
        label: "Black Heritage in Milwaukee",
      },
    ],
  },

  // Ch 8: Still Here
  {
    id: "still-here",
    number: 8,
    title: "Still Here",
    camera: { center: [-87.912, 43.06], zoom: 12, pitch: 45 },
    zoneId: null,
    year: 2025,
    overlay: "income",
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "But the community persists. Displaced from Bronzeville, African Americans organized Harambee \u2014 Swahili for \u201clet\u2019s pull together\u201d \u2014 the quintessential example of Black agency in urban renewal. Today, the 1938 map still predicts outcomes: 2.7\u00d7 income gap, 73% higher lending discrimination, infant mortality 3\u00d7 higher. Milwaukee is America\u2019s most segregated metro. The grades were supposed to be temporary. The damage was not.",
    stat: { value: "2.7\u00d7", label: "A-to-D income gap in 2025" },
    citations: [
      {
        paperId: "niemuth-2014",
        label: "Niemuth, 2014",
        finding:
          "African Americans organized community-driven renewal in Harambee \u2014 \u2018the quintessential example\u2019 of Black agency in urban renewal.",
      },
      {
        paperId: "lynch-et-al-2021",
        label: "Lynch et al., 2021",
        finding:
          "Milwaukee has emerged as the epitome of a 21st century racial regime: a metropolis of entrenched segregation and racial inequality.",
      },
      {
        paperId: "chang-smith-2016",
        label: "Chang & Smith, 2016",
        finding:
          "The gap between Grade A and Grade D neighborhoods widened over time, not narrowed, despite civil rights legislation.",
      },
    ],
  },
];
