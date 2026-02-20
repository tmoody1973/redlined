import type { OverlayType } from "./data-overlay";

/** Citation reference linking a story beat to a research paper. */
export interface StoryCitation {
  /** Matches `id` in research-context.json. */
  paperId: string;
  /** Short display label, e.g. "Barbera, 2012". */
  label: string;
  /** Optional inline quote or finding. */
  finding?: string;
}

/** Camera target for a story beat. */
export interface CameraTarget {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing?: number;
}

/** Layer state to set when entering a beat. */
export interface BeatLayerState {
  covenantsVisible?: boolean;
  ghostsVisible?: boolean;
}

/** A single beat in the guided story. */
export interface StoryBeat {
  id: string;
  title: string;
  subtitle: string;
  camera: CameraTarget;
  /** HOLC zone area_id to select, or null for city-wide views. */
  zoneId: string | null;
  /** Year to set on the timeline. */
  year: number;
  /** Whether to expand the timeline bar. */
  expandTimeline: boolean;
  /** Data overlay to activate, or null for none. */
  overlay: OverlayType;
  /** Layer visibility overrides. */
  layers: BeatLayerState;
  /** Main narrative text (2-3 sentences). */
  narrative: string;
  /** Key statistic displayed prominently. */
  stat: { value: string; label: string };
  /** Extended content shown in "Learn more" expansion. */
  learnMore: string;
  /** Source citations shown in learn-more section. */
  citations: StoryCitation[];
}

export const STORY_BEATS: StoryBeat[] = [
  // Beat 1: The Grading
  {
    id: "grading",
    title: "The Grading",
    subtitle: "Milwaukee, 1938",
    camera: { center: [-87.9065, 43.0389], zoom: 11.5, pitch: 45 },
    zoneId: null,
    year: 1938,
    expandTimeline: true,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "In 1938, federal appraisers arrived in Milwaukee. They divided the city into 114 neighborhoods and assigned each a grade \u2014 A through D \u2014 that would determine who could get a mortgage and who could not.",
    stat: { value: "114", label: "zones graded" },
    learnMore:
      "The Home Owners\u2019 Loan Corporation (HOLC) used a four-tier color system: green for \u201cBest,\u201d blue for \u201cStill Desirable,\u201d yellow for \u201cDeclining,\u201d and red for \u201cHazardous.\u201d Racial composition was explicitly listed as a grading criterion \u2014 neighborhoods with Black residents were almost automatically marked \u201cHazardous.\u201d These grades would become the blueprint for 1960s urban renewal: Class IV Areas (D-grade zones) were designated for \u201csubstantial clearance and redevelopment.\u201d",
    citations: [
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "Class IV Areas (D-grade HOLC zones) were designated for \u201csubstantial clearance and redevelopment\u201d in the 1960s \u2014 the grades became a demolition blueprint.",
      },
    ],
  },

  // Beat 2: Best in Class
  {
    id: "best-in-class",
    title: "Best in Class",
    subtitle: "Zone A1 \u2014 Shorewood & Whitefish Bay",
    camera: { center: [-87.897, 43.11], zoom: 13, pitch: 50, bearing: -15 },
    zoneId: "6284",
    year: 1938,
    expandTimeline: false,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "Zone A1 \u2014 Shorewood and Whitefish Bay \u2014 received the highest grade: \u201cBest.\u201d The appraiser noted \u201cBusiness & professional\u201d residents. No Black residents were recorded. This grade unlocked decades of federally backed mortgage lending.",
    stat: { value: "88.2%", label: "White today" },
    learnMore:
      "Home ownership in A-grade zones increased over 10% between 1970 and 2010, reaching 78.8% \u2014 while D-grade zones flatlined at roughly 38%. Median household income in A1 today is $93,615 with a median home value of $389,967. Only 39 buildings have been demolished here since 2005. Suburban communities like Shorewood and Whitefish Bay deliberately excluded African Americans from housing through restrictive covenants and realtor practices.",
    citations: [
      {
        paperId: "chang-smith-2016",
        label: "Chang & Smith, 2016",
        finding:
          "Home ownership rate for Grade A increased more than 10% over 1970\u20132010, while rates for Grades B, C, and D did not change.",
      },
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "Suburban communities deliberately excluded African Americans from housing through restrictive practices.",
      },
    ],
  },

  // Beat 3: Hazardous
  {
    id: "hazardous",
    title: "Hazardous",
    subtitle: "Zone D5 \u2014 The Heart of Bronzeville",
    camera: { center: [-87.92, 43.054], zoom: 14, pitch: 55, bearing: 10 },
    zoneId: "6305",
    year: 1938,
    expandTimeline: false,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "Eight miles south, Zone D5 \u2014 the heart of Bronzeville \u2014 was stamped \u201cHazardous.\u201d The appraiser wrote: \u201cThis is the Negro and slum area of Milwaukee.\u201d With that single grade, an entire community was cut off from the engine of American wealth-building.",
    stat: { value: "3.97", label: "/ 4.0 Historic Redlining Score" },
    learnMore:
      "D5 was 65% Black in 1938 and is 68.2% Black today. D-grade home ownership has been frozen at roughly 38% for 60 years, while the A-to-D income ratio widened from 1.3x in 1950 to 2.7x by 2010. But before the grading, Bronzeville was a vibrant 12-block community: Walnut Street had Willie Jones Billiards, Miss Lulu\u2019s Dry Goods, De Reef & Dorsey Lawyers, and jazz clubs where musicians held court. \u201cThat was where the Black Jazz, the Black musicians, and the Black audience hung out.\u201d",
    citations: [
      {
        paperId: "ethnic-african-american",
        label: "Milwaukee African Americans",
        finding:
          "Walnut Street was Milwaukee\u2019s Black business district, with dozens of Black-owned establishments including billiard halls, law offices, and dry goods stores.",
      },
      {
        paperId: "barbera-2012",
        label: "Barbera, 2012",
        finding:
          "That was where the Black Jazz, the Black musicians, and the Black audience hung out.",
      },
      {
        paperId: "hood-design-2024",
        label: "Hood Design Studio, 2024",
        finding:
          "Mapped timelines of Black commercial and cultural development in Bronzeville for the Bronzeville Center for the Arts.",
      },
    ],
  },

  // Beat 4: What Was Lost
  {
    id: "what-was-lost",
    title: "What Was Lost",
    subtitle: "Zone D6 \u2014 The Triangle",
    camera: { center: [-87.936, 43.064], zoom: 13.5, pitch: 50 },
    zoneId: "6300",
    year: 2025,
    expandTimeline: false,
    overlay: null,
    layers: { covenantsVisible: false, ghostsVisible: true },
    narrative:
      "This is Zone D6 \u2014 the Triangle. Since 2005, 2,116 buildings have been demolished here. That is 54 times more than all A-grade zones combined. Disinvestment didn\u2019t just deny loans \u2014 it erased the physical fabric of a community.",
    stat: { value: "2,116", label: "buildings demolished" },
    learnMore:
      "D-grade zones lost 7,349 buildings since 2005; A-grade zones lost just 39. Population density dropped from 24,430 per square mile in 1940 to 8,300 by 2010. The I-43 highway cut through Bronzeville\u2019s heart in the 1960s, destroying Walnut Street\u2019s commercial district and displacing thousands. Jimmy Mack\u2019s Main Event jazz club was forced to relocate twice by highway construction before closing in 2002. Between 1966 and 1971, the Model Cities area lost 3,371 net housing units. More homes were destroyed by urban renewal than were ever rebuilt.",
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
      {
        paperId: "black-heritage",
        label: "Black Heritage in Milwaukee",
      },
    ],
  },

  // Beat 5: The Invisible Lines
  {
    id: "invisible-lines",
    title: "The Invisible Lines",
    subtitle: "32,219 Racial Covenants",
    camera: { center: [-87.92, 43.06], zoom: 11.8, pitch: 40 },
    zoneId: null,
    year: 1926,
    expandTimeline: true,
    overlay: null,
    layers: { covenantsVisible: true, ghostsVisible: false },
    narrative:
      "Redlining did not act alone. Racial covenants \u2014 legal clauses in property deeds forbidding sale to non-white buyers \u2014 blanketed the county. 32,219 covenants were filed, 71% in the 1920s alone, building an invisible wall years before HOLC arrived.",
    stat: { value: "32,219", label: "racial covenants" },
    learnMore:
      "Covenants concentrated in suburban areas, creating a ring of exclusion around the central city. The National Association of Real Estate Boards\u2019 Code of Ethics (1928\u20131955) explicitly directed realtors not to introduce \u201cmembers of any race or nationality\u201d into neighborhoods. Though the Supreme Court ruled covenants unenforceable in Shelley v. Kraemer (1948), they continued to be written into deeds for another decade. The invisible architecture of exclusion was already in place before the HOLC appraisers ever arrived.",
    citations: [
      {
        paperId: "honer-2015",
        label: "Honer, 2015",
        finding:
          "The continuation of white neighborhood resistance, racist real estate practices, and federal redlining of minority neighborhoods assured that slums would continue to be created.",
      },
      {
        paperId: "paulson-wierschke-kim-2016",
        label: "Paulson et al., 2016",
        finding:
          "Restrictive covenants and redlining set the city on a segregated track that is incredibly difficult to break.",
      },
    ],
  },

  // Beat 6: Still Here
  {
    id: "still-here",
    title: "Still Here",
    subtitle: "The Map Still Matches",
    camera: { center: [-87.9065, 43.045], zoom: 11.5, pitch: 45 },
    zoneId: null,
    year: 2025,
    expandTimeline: false,
    overlay: "income",
    layers: { covenantsVisible: false, ghostsVisible: false },
    narrative:
      "Today, 87 years later, the map still matches. Income, health, home ownership, property values \u2014 every metric traces the lines drawn in 1938. Milwaukee is now the most segregated metro area in America. The grades were supposed to be temporary. The damage was not.",
    stat: { value: "2.7\u00d7", label: "A-to-D income gap" },
    learnMore:
      "Lending discrimination is 73% higher in historically redlined tracts. The infant mortality rate for Black Milwaukeeans is three times higher than for whites (15.6 vs 6.4 per 1,000 births). Only 44.7% of Black working-age men in Milwaukee are employed, down from 73.4% in 1970. 12.8% of Black working-age men in Wisconsin are incarcerated \u2014 twice the national average. But the community persists \u2014 Harambee emerged from urban renewal\u2019s ashes, with African Americans organizing to create self-sufficient neighborhoods. Now explore the map yourself \u2014 click any zone to learn its story.",
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
        paperId: "barbera-2012",
        label: "Barbera, 2012",
        finding:
          "The jazz community survived, but it became smaller, middle class, and predominately populated by white musicians and audience members.",
      },
    ],
  },
];
