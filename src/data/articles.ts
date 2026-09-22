// Article content for the knowledge base.
// Each article has full body content rendered as HTML on the detail page.

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number; // minutes
  body: string; // HTML
}

export const articles: Article[] = [
  {
    slug: 'choosing-a-scrap-dealer-how-to-compare',
    title: 'Choosing a scrap dealer — how to compare',
    excerpt: 'What to look for when comparing scrap yards: price, service, documentation, and trust signals.',
    date: '2025-01-15',
    readTime: 6,
    body: `
      <p>Not all scrap yards are the same. Some specialise in ferrous metals, others in non-ferrous or electronics. Some offer container pickup, others only accept drop-offs. Knowing how to compare them saves you money and avoids problems.</p>

      <h2>Price — but not only price</h2>
      <p>Price per kilo is the obvious comparison, but it depends on how the yard grades your material. A yard offering €4.50/kg for copper that grades your cable as "mixed" rather than "bright" will pay less than one offering €4.20/kg that grades it correctly. Always ask how they classify and weigh.</p>

      <h2>Weighing method</h2>
      <p>Ask whether the yard uses a calibrated, certified weighbridge. In the EU, scrap yards handling more than small quantities are required to use approved weighing equipment. If a yard weighs your load on a portable scale or estimates by eye, that is a red flag.</p>

      <h2>Documentation</h2>
      <p>A reputable yard provides a weighbridge ticket and an invoice or receipt showing material, weight, unit price, and total. If you are a business, you need this for your accounting and for environmental compliance. If the yard cannot or will not provide documentation, look elsewhere.</p>

      <h2>Pickup and logistics</h2>
      <p>If you have a large volume, pickup matters as much as price. Ask: do they provide a container? Is there a minimum weight for free pickup? How quickly can they collect? A yard that picks up 5 tonnes free is often better than one that pays 5% more but requires you to deliver.</p>

      <h2>Verification and trust</h2>
      <p>In most EU countries, scrap yards must be licensed environmental operators. Ask for their permit number and check it against the national environmental register. On European Scrap Market, we verify yards before they join — but you should still do your own due diligence.</p>

      <h2>Payment terms</h2>
      <p>Most yards pay on collection or within a few days. If a yard wants to pay "when they sell it on" or offers significantly above-market prices with delayed payment, be cautious. Traceable payment — bank transfer, not cash — protects both parties.</p>

      <h2>Summary</h2>
      <p>Compare on: price per kg at the grade you expect, weighing method, documentation, pickup options, permit status, and payment terms. The cheapest per-kg is not always the best deal once logistics and trust are factored in.</p>
    `,
  },
  {
    slug: 'get-the-best-price-for-your-scrap',
    title: 'Get the best price for your scrap',
    excerpt: 'How sorting, cleaning, and volume affect the price you get. Practical tips for sellers.',
    date: '2025-01-10',
    readTime: 5,
    body: `
      <p>The price you get for scrap metal depends on three things: what it is, how clean it is, and how much you have. You control two of those three.</p>

      <h2>Sort by type</h2>
      <p>Mixed metal is always priced lower than sorted. A pile of mixed steel and aluminium might fetch €0.10–0.20/kg. The same metals sorted could be worth €0.50/kg for the steel and €1.20/kg for the aluminium. Sorting takes minutes and can double or triple what you get.</p>

      <h2>Clean means valuable</h2>
      <p>"Clean" in scrap means free of contaminants — no plastic, rubber, oil, concrete, or other metals attached. Bright copper wire (stripped of insulation) is worth more than the same wire with insulation on. Clean aluminium extrusions are worth more than painted or anodised ones. Removing non-metal attachments is the single most effective way to increase your payout.</p>

      <h2>Volume matters</h2>
      <p>Yards pay more per kilo for larger quantities because handling costs are spread over more material. 100 kg of copper will get a better per-kg price than 10 kg. If you have small amounts, consider accumulating until you have a meaningful volume, or team up with a neighbour.</p>

      <h2>Know the market price</h2>
      <p>Scrap metal prices track commodity exchanges — LME for non-ferrous, and regional indices for ferrous. Prices move weekly. Knowing the current market price for your material gives you a baseline to negotiate from. European Scrap Market shows reference prices per material class.</p>

      <h2>Timing</h2>
      <p>Prices fluctuate. If you can hold your scrap for a week or two, check the trend. But don't hold too long — storage has costs too, and metal can degrade if left outside.</p>

      <h2>Get multiple quotes</h2>
      <p>Submit your scrap to the European Scrap Market network and you get bids from multiple verified yards. Comparing offers is the simplest way to ensure you get a fair price.</p>
    `,
  },
  {
    slug: 'selling-scrap-as-a-private-individual',
    title: 'Selling scrap as a private individual',
    excerpt: 'Everything you need to know about selling metal scrap as a person, not a business.',
    date: '2025-01-05',
    readTime: 4,
    body: `
      <p>As a private individual, you can sell scrap metal in every EU country — but the rules differ. Here is what to know.</p>

      <h2>ID requirements</h2>
      <p>In most EU countries, yards are required to record the identity of anyone selling scrap, including private individuals. You will need to show a government-issued ID. This is an anti-theft measure — do not take it personally.</p>

      <h2>Cash vs. bank transfer</h2>
      <p>Many EU countries restrict or prohibit cash payments for scrap metal. In Germany, for example, scrap yards may not pay cash for purchases above €2,000. In France, cash payments for non-ferrous scrap are prohibited. Expect to be paid by bank transfer.</p>

      <h2>What you can sell</h2>
      <p>Common household scrap: old appliances, copper pipes and wire from renovations, aluminium window frames, car parts, steel fencing, brass fittings. Most yards accept these. Some materials — batteries, electronics with circuit boards, oil-contaminated metal — may require specialist handlers.</p>

      <h2>How much do you need?</h2>
      <p>Most yards have a minimum weight for drop-off, often 50–100 kg. Below that, some yards may still accept it but at a lower rate. For very small amounts, a local recycling centre may be more practical, though they typically do not pay.</p>

      <h2>Tax</h2>
      <p>Selling your own household scrap is generally not taxable income. If you buy scrap to resell, or sell scrap regularly as a side business, different rules apply. When in doubt, check with your tax authority.</p>

      <h2>Using European Scrap Market</h2>
      <p>Submit your scrap on our platform and a verified yard in your country contacts you. The service is free for sellers. You describe what you have, and the yard handles the rest — weighing, payment, and pickup if the volume justifies it.</p>
    `,
  },
  {
    slug: 'selling-scrap-as-a-business',
    title: 'Selling scrap as a business',
    excerpt: 'For industrial, construction, and engineering companies — production scrap, decommissioning, and containers.',
    date: '2024-12-20',
    readTime: 6,
    body: `
      <p>For businesses, scrap metal is a byproduct — but it is also a revenue stream. Managing it well reduces waste costs and generates income.</p>

      <h2>Production scrap</h2>
      <p>Manufacturing generates predictable scrap: offcuts, turnings, stampings, defective parts. Set up a sorting system at source — separate bins for steel, aluminium, copper, brass. This costs nothing once the bins are in place and significantly increases the value of what you sell.</p>

      <h2>Turnings and swarf</h2>
      <p>Machining generates turnings contaminated with cutting fluid. Yards pay less for wet or oily turnings. A simple centrifuge or draining rack can recover most fluid and increase the scrap value. Some yards also buy the recovered fluid.</p>

      <h2>Construction and demolition</h2>
      <p>Demolition generates large volumes of mixed metal — structural steel, rebar, piping, cable, sheet metal. The key is sorting early. Mixed demolition metal is low-value; sorted steel, copper, and aluminium are much more valuable. If you have a site, ask about a container service — many yards will place one and collect when full.</p>

      <h2>Decommissioning</h2>
      <p>Decommissioning industrial equipment — tanks, machinery, transformers — requires specialist handling. Some metals (e.g., from transformers) may be contaminated and require certified disposal. Work with a yard that has the appropriate environmental permits for your material type.</p>

      <h2>Container service</h2>
      <p>For ongoing scrap generation, a container service is the most practical option. The yard drops a skip or roll-off container at your site. You fill it as you go. They collect on a schedule or on call. This eliminates transport costs and keeps your site clean.</p>

      <h2>Documentation and compliance</h2>
      <p>As a business, you need proper documentation for scrap transactions — waste transfer notes, weighbridge tickets, and invoices. In many EU countries, scrap is classified as waste until it reaches the processing yard. Ensure your yard provides the necessary paperwork for your environmental compliance records.</p>

      <h2>Contract or spot?</h2>
      <p>For regular volumes, a contract with a fixed yard gives you stable pricing and reliable pickup. For one-off batches, spot deals through European Scrap Market let you compare bids and pick the best offer.</p>
    `,
  },
  {
    slug: 'safe-scrap-deals-payments-and-verification',
    title: 'Safe scrap deals — payments and verification',
    excerpt: 'How to protect yourself when selling scrap. Traceable payment, ID checks, and documentation.',
    date: '2024-12-15',
    readTime: 5,
    body: `
      <p>Scrap metal transactions involve money, identity, and goods that are hard to trace once melted. Here is how to protect yourself as a seller.</p>

      <h2>Use traceable payment</h2>
      <p>Bank transfer is the standard in most EU countries. It creates a record — who paid, when, and how much. Cash is restricted or banned for scrap in many countries. If a buyer insists on cash, especially above the legal threshold, that is a warning sign.</p>

      <h2>Get it in writing</h2>
      <p>Before the metal leaves your possession, get a weighbridge ticket and a purchase agreement or invoice. This should show: material, weight, unit price, total, date, and both parties' details. Without this, you have no recourse if something goes wrong.</p>

      <h2>Verify the buyer</h2>
      <p>Ask for the yard's environmental permit number and business registration. In the EU, scrap metal collectors and processors must be licensed. Check the permit against your country's environmental register. On European Scrap Market, we verify yards before they join — but always do your own check too.</p>

      <h2>Watch for red flags</h2>
      <ul>
        <li>Prices significantly above market — too good to be true usually is</li>
        <li>Reluctance to provide documentation</li>
        <li>Pressure to hand over metal before payment</li>
        <li>No physical address or unlicensed premises</li>
        <li>Cash-only, especially above legal thresholds</li>
      </ul>

      <h2>On European Scrap Market</h2>
      <p>Every yard in our network has been verified — permit checked, contact details confirmed, and identity validated. Bids come from these verified yards only. You communicate through the platform and accept a bid on your terms. Payment and pickup are arranged directly with the yard, but the bid and chat record provides a trail.</p>

      <h2>If something goes wrong</h2>
      <p>Contact the yard first. If the issue is not resolved, contact us at support@europeanscrapmarket.com. For criminal matters — theft, fraud — contact your local police. Keep all documentation.</p>
    `,
  },
  {
    slug: 'what-is-scrap-worth',
    title: 'What is scrap worth?',
    excerpt: 'How scrap metal prices are set — LME, purity, quantity, and transport distance.',
    date: '2024-12-10',
    readTime: 5,
    body: `
      <p>Scrap metal is not worth a fixed amount. The price you get depends on the commodity market, the grade of your material, the quantity, and where you are.</p>

      <h2>The commodity market</h2>
      <p>Non-ferrous metals (copper, aluminium, zinc, lead, nickel) are traded on the London Metal Exchange (LME). Scrap prices track these, typically at 70–90% of the primary metal price, depending on grade. Ferrous metals (steel, iron) are traded on regional indices and fluctuate with supply and demand in the local market.</p>

      <h2>Grade and purity</h2>
      <p>Within each metal type, grade determines price. Bright copper wire (clean, stripped) is worth more than mixed copper (tinned, insulated, painted). Clean aluminium extrusions are worth more than painted or mixed cast aluminium. The yard grades your material when you deliver it — ask to see the grading criteria.</p>

      <h2>Quantity</h2>
      <p>Yards pay more per kilo for larger quantities because handling costs are spread over more material. A 10 kg batch and a 1,000 kg batch of the same material will not get the same per-kg price. This is not the yard being difficult — it is economics.</p>

      <h2>Transport distance</h2>
      <p>The closer you are to a yard, the less transport costs. A yard 20 km away can pay more per kg than one 200 km away, because their collection cost is lower. This is why local competition matters — European Scrap Market connects you with yards in your country.</p>

      <h2>Currency</h2>
      <p>Within the eurozone, prices are in EUR. In non-euro countries (Sweden, Poland, Czech Republic, etc.), prices are in local currency but track the same commodity markets. Currency fluctuations can affect what you get.</p>

      <h2>How to check</h2>
      <p>European Scrap Market shows reference prices per material class. These are indicative — your actual offer will depend on grade, quantity, and location. Use them as a starting point, then get bids from multiple yards to see where you stand.</p>
    `,
  },
  {
    slug: 'common-mistakes-when-selling-scrap',
    title: 'Common mistakes when selling scrap',
    excerpt: 'Avoid these pitfalls that cost you money when selling metal scrap.',
    date: '2024-12-05',
    readTime: 4,
    body: `
      <p>Selling scrap seems simple, but small mistakes can significantly reduce what you get. Here are the most common ones.</p>

      <h2>Not sorting</h2>
      <p>The number one mistake. Mixed metal is always priced as the least valuable component. A bin of steel with a few copper pieces will be priced as mixed steel — the copper is lost. Sort by type before the yard sees it.</p>

      <h2>Leaving contaminants on</h2>
      <p>Plastic coating, rubber hoses, oil, concrete attachments — all reduce the grade and therefore the price. Taking 10 minutes to strip insulation off copper wire or remove plastic fittings from aluminium frames can increase the price by 30–50%.</p>

      <h2>Accepting the first offer</h2>
      <p>Without competition, you have no idea if the offer is fair. The first yard you call might offer €3/kg for copper that's worth €4.20/kg. Submit to European Scrap Market and get bids from multiple yards to see the range.</p>

      <h2>Not knowing the weight</h2>
      <p>If you don't know roughly how much you have, you can't judge if the weighbridge reading is right. Estimate your volume beforehand — weigh a sample, count the pieces, or use a bathroom scale for small batches.</p>

      <h2>Selling too small a batch</h2>
      <p>Small batches get lower per-kg prices and some yards won't accept them at all. If you have 20 kg of aluminium, see if you can wait until you have 100 kg. Or combine with other materials to reach a minimum weight.</p>

      <h2>Ignoring pickup costs</h2>
      <p>If you deliver to the yard, you save them collection cost — but you spend time and fuel. If they pick up, they deduct transport from the price. Compare the net amount, not just the per-kg rate.</p>

      <h2>No documentation</h2>
      <p>Selling without a weighbridge ticket or receipt means no record. If the payment is wrong or delayed, you have nothing to prove what was agreed. Always get it in writing.</p>
    `,
  },
  {
    slug: 'scrap-collection-how-it-works',
    title: 'Scrap collection — how it works',
    excerpt: 'On-call collection vs. on-site containers. Which option suits your scrap volume?',
    date: '2024-11-28',
    readTime: 4,
    body: `
      <p>Getting your scrap to the yard is part of the deal. There are two main options: you deliver, or they collect. Which one makes sense depends on volume and distance.</p>

      <h2>Drop-off</h2>
      <p>You bring the scrap to the yard. This is the default for small volumes — typically under 500 kg. The yard weighs your load on their weighbridge, grades the material, and pays you. No transport cost, but you spend time and fuel.</p>

      <h2>On-call collection</h2>
      <p>You call the yard, they send a truck. This works for one-off batches — a farm clearance, a renovation, a decommissioned machine. Most yards offer free collection above a certain weight (often 2–5 tonnes). Below that, there may be a collection fee.</p>

      <h2>Container service</h2>
      <p>For ongoing scrap generation — factories, workshops, construction sites — the yard places a skip or roll-off container at your site. You fill it as you go. They collect on a schedule or when you call. This is the most cost-effective for regular volumes.</p>

      <h2>Container types</h2>
      <p>Common sizes: 5 m³ (small workshop), 10 m³ (medium workshop or site), 20 m³ and 40 m³ roll-offs (large sites, demolition). The yard helps you choose based on how much and what type of scrap you generate.</p>

      <h2>Which option?</h2>
      <ul>
        <li><strong>Under 100 kg:</strong> Drop-off at a local yard.</li>
        <li><strong>100–500 kg:</strong> Drop-off, or check if a yard collects small loads.</li>
        <li><strong>500 kg–2 tonnes:</strong> On-call collection — ask about fees.</li>
        <li><strong>2+ tonnes:</strong> Free collection from most yards.</li>
        <li><strong>Regular generation:</strong> Container service.</li>
      </ul>

      <h2>On European Scrap Market</h2>
      <p>When you submit your scrap, specify the approximate weight. Yards that can handle your volume will bid. The bid includes whether they offer pickup and at what threshold it's free.</p>
    `,
  },
  {
    slug: 'sort-scrap-for-better-prices',
    title: 'Sort scrap for better prices',
    excerpt: 'Sorting your metal by type and grade can significantly increase what you get paid.',
    date: '2024-11-20',
    readTime: 4,
    body: `
      <p>Sorting is the single most effective way to increase what you get for scrap. Here is a practical guide.</p>

      <h2>The basic split: ferrous vs non-ferrous</h2>
      <p>Use a magnet. If it sticks, the metal is ferrous (steel, iron). If it doesn't, it's non-ferrous (copper, aluminium, brass, zinc, lead). Non-ferrous metals are worth 5–20× more per kg. Never mix them — a single steel bolt in a box of aluminium can downgrade the whole batch.</p>

      <h2>Sort non-ferrous by type</h2>
      <ul>
        <li><strong>Copper:</strong> Separate bright wire (clean, stripped), #1 copper (clean, no solder), #2 copper (soldered, painted, coated).</li>
        <li><strong>Aluminium:</strong> Separate extrusions (window frames, profiles), cast (engine parts, wheels), and mixed/can stock.</li>
        <li><strong>Brass:</strong> Separate yellow brass (fittings, valves) from red brass (plumbing fixtures).</li>
        <li><strong>Stainless steel:</strong> Separate by grade if known (304, 316). Turnings from solid.</li>
      </ul>

      <h2>Remove contaminants</h2>
      <p>For each sorted type, remove anything that isn't that metal:</p>
      <ul>
        <li>Strip insulation from copper wire</li>
        <li>Remove screws, bolts, and plastic fittings from aluminium frames</li>
        <li>Drain oil from engine parts</li>
        <li>Remove concrete from rebar</li>
        <li>Take rubber off cable</li>
      </ul>

      <h2>What you gain</h2>
      <p>A typical mixed batch of 500 kg might be priced as "mixed metal" at €0.15/kg — total €75. The same 500 kg sorted into 200 kg steel (€0.30/kg), 200 kg aluminium (€1.00/kg), and 100 kg copper (€4.00/kg) would be €60 + €200 + €400 = €660. Sorting is worth it.</p>

      <h2>Label your bins</h2>
      <p>If you generate scrap regularly, set up labelled bins: one for steel, one for aluminium, one for copper, one for brass. Sorting at source costs nothing and you never lose value to mixing.</p>

      <h2>When in doubt, ask</h2>
      <p>If you're not sure what a metal is, submit it on European Scrap Market and describe it. The yards in the network can identify materials and advise on sorting before they bid.</p>
    `,
  },
];
