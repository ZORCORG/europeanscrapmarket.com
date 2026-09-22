// EU + key European countries for the scrap marketplace
// Each country gets its own SEO landing page under /sell-scrap/[country]/

export interface Country {
  slug: string;
  name: string;
  capital: string;
  eu: boolean;
  population: number;
  lang: string;
  langCode: string;
  currency: string;
  // SEO: each country page gets unique copy
  scrapYards: number; // estimated active yards
  keyMetals: string[];
  localNote: string; // country-specific scrap market fact
  hreflang: string;
}

export const countries: Country[] = [
  { slug: 'germany', name: 'Germany', capital: 'Berlin', eu: true, population: 84000000, lang: 'German', langCode: 'de', currency: 'EUR', scrapYards: 4200, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "Germany is Europe's largest scrap metal market by volume, with a dense network of certified yards and strong industrial demand.", hreflang: 'de-DE' },
  { slug: 'france', name: 'France', capital: 'Paris', eu: true, population: 68000000, lang: 'French', langCode: 'fr', currency: 'EUR', scrapYards: 2800, keyMetals: ['Copper', 'Aluminium', 'Steel', 'Brass'], localNote: "France has a mature recycling sector with strict environmental certification requirements under the AGEC law.", hreflang: 'fr-FR' },
  { slug: 'italy', name: 'Italy', capital: 'Rome', eu: true, population: 59000000, lang: 'Italian', langCode: 'it', currency: 'EUR', scrapYards: 2500, keyMetals: ['Stainless steel', 'Copper', 'Aluminium', 'Brass'], localNote: "Italy is a major importer of scrap metal for its steel foundries in Brescia and the non-ferrous processing sector.", hreflang: 'it-IT' },
  { slug: 'spain', name: 'Spain', capital: 'Madrid', eu: true, population: 48000000, lang: 'Spanish', langCode: 'es', currency: 'EUR', scrapYards: 1900, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Spain's scrap sector serves both domestic steelmaking and export to North Africa and the Middle East.", hreflang: 'es-ES' },
  { slug: 'poland', name: 'Poland', capital: 'Warsaw', eu: true, population: 38000000, lang: 'Polish', langCode: 'pl', currency: 'PLN', scrapYards: 1800, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Poland is a fast-growing scrap hub with major steel mills and a large copper recycling industry.", hreflang: 'pl-PL' },
  { slug: 'netherlands', name: 'Netherlands', capital: 'Amsterdam', eu: true, population: 18000000, lang: 'Dutch', langCode: 'nl', currency: 'EUR', scrapYards: 850, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "The Port of Rotterdam is one of Europe's largest hubs for scrap metal export and transhipment.", hreflang: 'nl-NL' },
  { slug: 'belgium', name: 'Belgium', capital: 'Brussels', eu: true, population: 12000000, lang: 'Dutch', langCode: 'nl', currency: 'EUR', scrapYards: 520, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "Antwerp's port makes Belgium a key node for international scrap trade flows.", hreflang: 'nl-BE' },
  { slug: 'sweden', name: 'Sweden', capital: 'Stockholm', eu: true, population: 10500000, lang: 'Swedish', langCode: 'sv', currency: 'SEK', scrapYards: 450, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "Sweden has advanced steel recycling with electric arc furnaces and a well-regulated permit system.", hreflang: 'sv-SE' },
  { slug: 'finland', name: 'Finland', capital: 'Helsinki', eu: true, population: 5600000, lang: 'Finnish', langCode: 'fi', currency: 'EUR', scrapYards: 280, keyMetals: ['Steel', 'Copper', 'Stainless steel'], localNote: "Finland's scrap sector is tied to its forest-industry equipment cycles and stainless steel production.", hreflang: 'fi-FI' },
  { slug: 'denmark', name: 'Denmark', capital: 'Copenhagen', eu: true, population: 5900000, lang: 'Danish', langCode: 'da', currency: 'DKK', scrapYards: 260, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Denmark's compact geography makes collection efficient, with strong municipal sorting infrastructure.", hreflang: 'da-DK' },
  { slug: 'austria', name: 'Austria', capital: 'Vienna', eu: true, population: 9000000, lang: 'German', langCode: 'de', currency: 'EUR', scrapYards: 340, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Austria is home to major aluminium recycling and has strict waste separation standards.", hreflang: 'de-AT' },
  { slug: 'ireland', name: 'Ireland', capital: 'Dublin', eu: true, population: 5200000, lang: 'English', langCode: 'en', currency: 'EUR', scrapYards: 180, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Ireland exports most of its processed scrap, with ELV and WEEE streams growing rapidly.", hreflang: 'en-IE' },
  { slug: 'portugal', name: 'Portugal', capital: 'Lisbon', eu: true, population: 10300000, lang: 'Portuguese', langCode: 'pt', currency: 'EUR', scrapYards: 320, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Portugal's scrap sector serves domestic foundries and export through Atlantic ports.", hreflang: 'pt-PT' },
  { slug: 'czech-republic', name: 'Czech Republic', capital: 'Prague', eu: true, population: 10500000, lang: 'Czech', langCode: 'cs', currency: 'CZK', scrapYards: 620, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Czech Republic has a strong tradition in steel and non-ferrous metal recycling.", hreflang: 'cs-CZ' },
  { slug: 'romania', name: 'Romania', capital: 'Bucharest', eu: true, population: 19000000, lang: 'Romanian', langCode: 'ro', currency: 'RON', scrapYards: 780, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Romania is one of Eastern Europe's largest scrap sources, with growing industrial collection.", hreflang: 'ro-RO' },
  { slug: 'hungary', name: 'Hungary', capital: 'Budapest', eu: true, population: 9700000, lang: 'Hungarian', langCode: 'hu', currency: 'HUF', scrapYards: 380, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Hungary's automotive industry generates significant production scrap volumes.", hreflang: 'hu-HU' },
  { slug: 'greece', name: 'Greece', capital: 'Athens', eu: true, population: 10400000, lang: 'Greek', langCode: 'el', currency: 'EUR', scrapYards: 290, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Greece's ship-breaking industry in the Aegean is a significant source of scrap steel.", hreflang: 'el-GR' },
  { slug: 'bulgaria', name: 'Bulgaria', capital: 'Sofia', eu: true, population: 6900000, lang: 'Bulgarian', langCode: 'bg', currency: 'BGN', scrapYards: 310, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Bulgaria has a long metallurgical tradition and exports significant volumes to Turkey and beyond.", hreflang: 'bg-BG' },
  { slug: 'croatia', name: 'Croatia', capital: 'Zagreb', eu: true, population: 3900000, lang: 'Croatian', langCode: 'hr', currency: 'EUR', scrapYards: 150, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Croatia's scrap market is growing with EU membership and stricter waste framework compliance.", hreflang: 'hr-HR' },
  { slug: 'slovakia', name: 'Slovakia', capital: 'Bratislava', eu: true, population: 5500000, lang: 'Slovak', langCode: 'sk', currency: 'EUR', scrapYards: 240, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Slovakia's automotive sector generates high-quality production scrap for recycling.", hreflang: 'sk-SK' },
  { slug: 'slovenia', name: 'Slovenia', capital: 'Ljubljana', eu: true, population: 2100000, lang: 'Slovenian', langCode: 'sl', currency: 'EUR', scrapYards: 95, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Slovenia has efficient recycling systems and serves Central European foundries.", hreflang: 'sl-SI' },
  { slug: 'lithuania', name: 'Lithuania', capital: 'Vilnius', eu: true, population: 2800000, lang: 'Lithuanian', langCode: 'lt', currency: 'EUR', scrapYards: 120, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Lithuania's Klaipeda port is a key Baltic export hub for scrap metal.", hreflang: 'lt-LT' },
  { slug: 'latvia', name: 'Latvia', capital: 'Riga', eu: true, population: 1900000, lang: 'Latvian', langCode: 'lv', currency: 'EUR', scrapYards: 85, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Latvia's scrap sector supports both domestic and Baltic export markets.", hreflang: 'lv-LV' },
  { slug: 'estonia', name: 'Estonia', capital: 'Tallinn', eu: true, population: 1300000, lang: 'Estonian', langCode: 'et', currency: 'EUR', scrapYards: 60, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Estonia's compact market relies on cross-border trade with Finland and the Baltics.", hreflang: 'et-EE' },
  { slug: 'cyprus', name: 'Cyprus', capital: 'Nicosia', eu: true, population: 1200000, lang: 'Greek', langCode: 'el', currency: 'EUR', scrapYards: 35, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Cyprus' scrap market is small but growing, with export through Limassol port.", hreflang: 'el-CY' },
  { slug: 'luxembourg', name: 'Luxembourg', capital: 'Luxembourg', eu: true, population: 650000, lang: 'French', langCode: 'fr', currency: 'EUR', scrapYards: 30, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Luxembourg's steel industry (ArcelorMittal) makes it a notable scrap consumer.", hreflang: 'fr-LU' },
  { slug: 'malta', name: 'Malta', capital: 'Valletta', eu: true, population: 530000, lang: 'Maltese', langCode: 'mt', currency: 'EUR', scrapYards: 18, keyMetals: ['Steel', 'Copper', 'Aluminium'], localNote: "Malta's island market relies on containerised scrap export to mainland Europe.", hreflang: 'mt-MT' },
  // Non-EU European countries (significant scrap markets)
  { slug: 'united-kingdom', name: 'United Kingdom', capital: 'London', eu: false, population: 67000000, lang: 'English', langCode: 'en', currency: 'GBP', scrapYards: 3500, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "The UK is one of Europe's largest scrap exporters, with major deep-sea ports handling global trade.", hreflang: 'en-GB' },
  { slug: 'norway', name: 'Norway', capital: 'Oslo', eu: false, population: 5500000, lang: 'Norwegian', langCode: 'no', currency: 'NOK', scrapYards: 230, keyMetals: ['Steel', 'Aluminium', 'Copper'], localNote: "Norway's aluminium industry is a major consumer and producer of recycled metal.", hreflang: 'nb-NO' },
  { slug: 'switzerland', name: 'Switzerland', capital: 'Bern', eu: false, population: 8800000, lang: 'German', langCode: 'de', currency: 'CHF', scrapYards: 190, keyMetals: ['Steel', 'Copper', 'Aluminium', 'Stainless steel'], localNote: "Switzerland has advanced recycling infrastructure and high metal recovery rates.", hreflang: 'de-CH' },
];

export function getCountry(slug: string): Country | undefined {
  return countries.find(c => c.slug === slug);
}

// Scrap material classes (mirrors skrottorget.se /skrotklasser/)
export interface ScrapClass {
  slug: string;
  name: string;
  description: string;
  metals: string[];
}

export const scrapClasses: ScrapClass[] = [
  { slug: 'copper', name: 'Copper', description: 'High-value non-ferrous metal. Bright wire, mixed, and copper alloys.', metals: ['Bright copper wire', 'Copper tubing', 'Mixed copper', 'Copper radiators'] },
  { slug: 'brass', name: 'Brass', description: 'Yellow brass, red brass, and mixed brass scrap from fittings and valves.', metals: ['Yellow brass', 'Red brass', 'Mixed brass', 'Brass turnings'] },
  { slug: 'aluminium', name: 'Aluminium', description: 'Lightweight metal — extrusions, castings, cans, and clean scrap.', metals: ['Aluminium extrusions', 'Aluminium cast', 'Aluminium cans (UBC)', 'Mixed aluminium'] },
  { slug: 'stainless-steel', name: 'Stainless Steel', description: '304 and 316 grades — turnings, solids, and process scrap.', metals: ['304 solids', '316 solids', 'Stainless turnings', 'Mixed stainless'] },
  { slug: 'steel-iron', name: 'Steel & Iron', description: 'Heavy melting scrap, light iron, and mixed ferrous material.', metals: ['HMS 1&2', 'Light iron', 'Cast iron', 'Steel turnings'] },
  { slug: 'cable', name: 'Cable & Wire', description: 'Insulated copper and aluminium cable — sorted by copper content.', metals: ['Heavy copper cable', 'Light copper cable', 'Aluminium cable', 'Data / telecom cable'] },
  { slug: 'mixed-production', name: 'Mixed Production Scrap', description: 'Batches from industry and workshops — sorted on-site by the yard.', metals: ['Workshop turnings', 'Demolition mixed', 'Production offcuts', 'Mixed metals'] },
];

// FAQ for the homepage
export const faqs = [
  { q: 'How does European Scrap Market work?', a: 'European Scrap Market is the hub of Europe\'s scrap metal network. When you submit a request on any site in the network, it lands here. A verified scrap yard in your country picks up the case and contacts you directly, often the same day. You see who reaches out and decide for yourself whether to do business — with no obligation.' },
  { q: 'Does it cost anything to sell scrap through European Scrap Market?', a: 'No. Submitting a request and being contacted by a scrap yard is completely free and without obligation for you as a seller. It is the scrap yards that pay for the leads they accept.' },
  { q: 'What materials can I sell?', a: 'All common metal scrap: copper, brass, aluminium, stainless steel (304/316), iron and steel, cable, and mixed production scrap from industry and workshops. Yards in the network handle both single batches and recurring container volumes.' },
  { q: 'How are scrap prices set?', a: 'Metal prices are driven by the world market (LME) and change daily. The price is also affected by the purity of the fraction, the quantity, and the transport distance. The yard that takes your case gives you a current daily price — and you are never locked in. If you decline, the case can pass to another yard.' },
  { q: 'How do I track my request?', a: 'Log in with the same email address you provided in your request, and you will see your requests and which yard has taken your case in your portal. We email a secure login link — no password needed.' },
  { q: 'What do scrap yards see about me?', a: 'Before a yard takes the case, it only sees what is needed to assess the batch: material, approximate weight, and country. Once a verified yard takes your case, it gets your contact details to reach out — but only that yard, never several at once, and never publicly. You decide whether to do business.' },
  { q: 'Can businesses use European Scrap Market?', a: 'Yes — industrial, construction, and engineering companies use the network for production scrap, decommissioning, and site clearances. Yards offer both on-call collection and on-site containers with scheduled emptying, with settlement notes and correct waste documentation.' },
  { q: 'How does my scrap yard become a partner?', a: 'Apply directly in the portal: provide company details, environmental permit or waste transport registration, and accept the network\'s safety commitments — traceable payment, ID verification, and documentation. We review applications manually and activate the account, normally within one business day.' },
  { q: 'Am I required to do business with the yard that contacts me?', a: 'No. You are never locked in. If the price, yard, or arrangement does not suit you, simply decline. If you hear nothing, or are not helped, the case is released so another yard can take it.' },
  { q: 'How do I know the yards are reputable?', a: 'Every yard is verified before it can accept requests: company registration, tax status, and permits are checked, and the yard commits to traceable payment without cash, ID checks, and documented transactions. Read more on the Trust page.' },
];
