import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import { GoogleGenAI } from '@google/genai';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Configure body parsing for JSON payloads
app.use(express.json());

// Lazy-initialization of the Google GenAI client to avoid crashes if GEMINI_API_KEY is missing.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY environment variable is not set. API routes will run in mock simulation mode.');
    return null;
  }
  
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiClient;
  } catch (err) {
    console.error('Error initializing GoogleGenAI client:', err);
    return null;
  }
}

// B2B System Context regarding JP EXIM
const jpeximContext = `
You are the AI Export Specialist for JP EXIM, a premier high-end international B2B agricultural trading and export firm based in Deesa, Gujarat, India.
Deesa is renowned as India's main potato cultivation hub.
Your job is to assist international buyers (importers, distributors, purchasing managers from UAE, Saudi Arabia, Oman, Qatar, Kuwait, Bahrain, Malaysia, Singapore, Bangladesh, Sri Lanka, and Europe) with absolute professional composure, corporate tone, and extensive industry knowledge.

BUSINESS DETAILS:
- Name: JP EXIM
- Tagline: Global Trade • Trusted Exports
- Owner/Proprietor/Signatory: Pradip Jitendrkumar Padhiyar
- Contact Number: +91 7046058487
- Address: Plot No. 60, Vedanta Bungalows, Highway Road, Near Laxmi Vandana, Deesa, Banas Kantha, Gujarat - 385535, India.
- Nature of business: Direct sourcing from farm, cleaning, grading, packing, cold storing, and shipping agricultural products globally.
- Primary Markets: Middle East (UAE, Saudi Arabia, Oman, Qatar, Kuwait, Bahrain) and Southeast Asia (Malaysia, Singapore, Bangladesh, Sri Lanka).

PRODUCTS IN CATALOG:
1. Fresh Potatoes:
   - Origin: Gujarat, India (Deesa)
   - HS Code: 0701
   - Shape: Round / Oval
   - Size Options (diameter): 35-45 mm, 45-55 mm, 55-65 mm, 65 mm+
   - Storage: Temperature-controlled cold storage facilities to maintain quality, shelf life, and skin firmness.
   - Packing: 25 kg / 50 kg Mesh Bags.
   - Container Capacity: Typically loaded in 40ft Reefer containers.

2. Peanut (Groundnut):
   - Origin: Gujarat, India
   - HS Code: 1202
   - Variety: Java (round, pinkish skin) / Bold (larger, reddish-brown skin)
   - Moisture: Max 8%
   - Admixture: Max 1%
   - Broken / Aflatoxin: Sourced to meet strictly specific buyer/country regulations (Aflatoxin controlled under standard laboratory analysis).
   - Counts/Ounce Options: 38/42 (Extra Large), 40/50 (Large), 50/60 (Medium), 60/70 (Small), 70/80 (Extra Small). Explain that lower count means larger kernels (more premium).
   - Packing: 25 kg / 50 kg PP Bags (or custom vacuum/food-grade packaging).
   - Storage: Clean, dry, well-ventilated warehouse storage.

PRODUCTION & HARVEST CYCLE:
- Potatoes: Land Preparation -> Seed Selection -> Crop Management -> Harvesting -> Field Collection -> Sorting/Cleaning -> Cold Storage (maintains freshness up to 8-10 months).
- Peanuts: Sowing -> Crop Monitoring -> Harvesting -> Sun Drying (in field for 2-3 days) -> Shelling -> Sorting -> Grading/Quality Lab Testing -> Packing -> Dry Storage.

REGULATORY & COMPLIANCE:
- IEC (Importer-Exporter Code): GUXPP6168P (Issued by Directorate General of Foreign Trade, Govt of India)
- GST Registration: 24GUXPP6168P1Z8
- Registrations: APEDA Registered, FSSAI Registered, ISO 9001:2015 Certified, SGS Quality Verified, Lab Tested.

LOGISTICS & INCOTERMS:
- Incoterms: EXW, FOB, CFR, CIF, CPT, CIP, DAP, DDP (Highly recommend FOB Mundra/Kandla Port, or CIF to Jebel Ali, Jeddah, Muscat, etc.).
- Payment Terms: 100% Advance T/T, or Confirmed Irrevocable Letter of Credit (L/C at sight) from prime international banks.
- Documents Provided: Commercial Invoice, Packing List, Certificate of Origin (COO), Bill of Lading (B/L), Phytosanitary/Inspection Certificate, Marine Insurance.

GUIDELINES FOR YOUR RESPONSES:
- Keep the response professional, factual, and extremely polite.
- Address the user as a respected global trading partner or importer.
- Answer queries about potato sizes, moisture limits, shipping terms, and logistics with exact technical terms.
- NEVER disclose that you are a language model. Act purely as the Senior Export Coordinator of JP EXIM.
- Format responses beautifully with bold headers, bullet points, and neat spacing so they look like high-quality emails or corporate reports.
- Keep answers concise, helpful, and focused on driving business inquiries.
`;

/**
 * Endpoint for B2B Interactive Assistant Chat
 */
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant fallback simulation
    const lowercaseMsg = message.toLowerCase();
    let reply = '';
    if (lowercaseMsg.includes('potato') || lowercaseMsg.includes('potatoes')) {
      reply = `**Thank you for your interest in our premium Fresh Potatoes.**\n\nAt **JP EXIM**, we specialize in exporting 100% farm-fresh potatoes directly sourced from Deesa, Gujarat, the agricultural heartland of India.\n\n* **HS Code:** 0701\n* **Sizes available:** 35-45 mm, 45-55 mm, 55-65 mm, and 65 mm+\n* **Packaging:** 25 kg / 50 kg high-ventilation Mesh Bags\n* **Storage:** Clean, temperature-controlled cold storage\n\nWould you like me to draft an initial FOB or CIF quote for your required destination port?`;
    } else if (lowercaseMsg.includes('peanut') || lowercaseMsg.includes('peanuts') || lowercaseMsg.includes('groundnut')) {
      reply = `**Regarding our Premium Peanut (Groundnut) exports:**\n\nGujarat is India's leading producer of superior-grade peanuts. We supply both **Java** and **Bold** varieties under strict quality specifications:\n\n* **HS Code:** 1202\n* **Count Sizes (Kernels per Ounce):** 38/42, 40/50, 50/60, 60/70, 70/80\n* **Moisture content:** Maximum 8%\n* **Admixture:** Maximum 1%\n* **Packaging:** 25 kg / 50 kg durable PP Bags\n\nWe provide full lab testing, FSSAI clearance, and APEDA documentation. What is your target port and required volume (in Metric Tons)?`;
    } else if (lowercaseMsg.includes('payment') || lowercaseMsg.includes('price') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('term')) {
      reply = `**JP EXIM Trade & Payment Terms:**\n\nTo ensure security and absolute transaction reliability, we accept:\n1. **Advance Bank Transfer (T/T)** - 30% to 50% advance deposit with the balance payable upon presentation of shipping documents (B/L draft).\n2. **Letter of Credit (L/C)** - 100% Confirmed, Irrevocable Letter of Credit at sight from a first-class international bank.\n\nWe quote on **FOB (Mundra / Kandla Port)**, **CFR**, or **CIF** basis depending on your logistics convenience.`;
    } else if (lowercaseMsg.includes('certif') || lowercaseMsg.includes('iec') || lowercaseMsg.includes('gst') || lowercaseMsg.includes('apeda')) {
      reply = `**JP EXIM Compliance & Quality Certifications:**\n\nWe strictly adhere to all international trade laws and quality standards. Our credentials include:\n\n* **IEC (Importer-Exporter Code):** GUXPP6168P (Issued by Govt of India)\n* **GST Number:** 24GUXPP6168P1Z8\n* **Registrations:** APEDA, FSSAI registered\n* **Certification:** ISO 9001:2015\n* **Inspection:** SGS or pre-shipment surveyor testing verified for chemical residues, moisture, and grading compliance.\n\nAll documents are provided immediately upon shipping.`;
    } else {
      reply = `Welcome to **JP EXIM (Global Trade • Trusted Exports)**. I am Pradip Padhiyar's virtual export coordinator.\n\nWe specialize in high-end exports of **Farm-Fresh Potatoes** and **Premium Gujarat Peanuts (Groundnuts)** to global ports including UAE, Saudi Arabia, Oman, Qatar, and Southeast Asia.\n\nHow can I assist your import business today? Feel free to ask about potato sizing, peanut count options, payment terms, or our production timelines!`;
    }
    res.json({ text: reply, simulated: true });
    return;
  }

  try {
    const formattedHistory = (history || []).map((h: { role: 'user' | 'model'; text: string }) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Start a chat session with the grounding system context
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: jpeximContext,
        temperature: 0.7,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message: message });
    res.json({ text: response.text });
  } catch (error) {
    const err = error as Error;
    console.error('Gemini Chat API Error:', err);
    res.status(500).json({ error: 'Failed to process assistant response', details: err.message });
  }
});

/**
 * Endpoint for B2B Inquiry Processing
 * Analyzes inquiry payload and drafts a detailed, fully customized B2B Proforma Invoice / Business Quotation Draft
 */
app.post('/api/inquiry', async (req, res) => {
  const { name, company, country, email, phone, product, quantity, message } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and Email are required fields' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Generate an elegant local mock proposal draft
    const responseText = `
DEAR ${name.toUpperCase()},
REPRESENTING ${company ? company.toUpperCase() : 'VALUED IMPORT CO.'} (${country || 'GLOBAL PORT'})

SUBJ: OFFICIAL B2B EXPORT INTEREST ACKNOWLEDGMENT & INQUIRY REF #JPX-${Math.floor(1000 + Math.random() * 9000)}

Thank you for contacting JP EXIM, Gujarat's premier agricultural exporter. We have received your inquiry for:
- Product of Interest: ${product || 'Fresh Potatoes / Peanuts'}
- Target Quantity: ${quantity ? quantity + ' Metric Tons' : 'Trial shipment'}
- Contact Phone/WhatsApp: ${phone || 'Not provided'}

Below is our preliminary trade acknowledgement and next steps:

1. PRODUCT DETAILS & GRADING
We specialize in 100% natural, farm-fresh produce sourced directly from Gujarat's finest soils.
- If Potato: Round/Oval shapes from Deesa, cold-stored and graded carefully.
- If Peanut: High oil-content Java/Bold kernels with aflatoxin lab certification.

2. LOGISTICS & DOCUMENTATION
We offer flexible logistics under Incoterms 2020 including FOB (Mundra/Kandla Port, India) and CIF (Your target port).
Every shipment is accompanied by a Commercial Invoice, Packing List, Phytosanitary Certificate, and Certificate of Origin.

3. NEXT STEPS
Our Senior Signatory, Mr. Pradip Padhiyar, has been notified. We will reach out to you directly via your email (${email}) or WhatsApp (${phone || 'provided phone'}) within 12 hours with a comprehensive, final price quote.

Sincerely,
Export Desk, JP EXIM Deesa
Direct WhatsApp: +91 7046058487
    `.trim();

    res.json({
      replyText: responseText,
      followUpMessage: `Thank you, ${name}! Your inquiry has been logged successfully. A draft business proposal has been prepared for you below. We will also contact you on WhatsApp/Email shortly.`,
      simulated: true
    });
    return;
  }

  try {
    const prompt = `
A customer has submitted a formal export inquiry through our website.
Please draft an extremely professional, comprehensive, and warm B2B business correspondence/quotation draft in response.

INQUIRY DETAILS:
- Buyer Name: ${name}
- Buyer Company: ${company || 'Private Buyer'}
- Buyer Country/Target Port: ${country || 'International Market'}
- Buyer Email: ${email}
- Buyer Phone/WhatsApp: ${phone || 'Not Provided'}
- Product Requested: ${product}
- Quantity Requested: ${quantity ? quantity + ' Metric Tons' : 'Standard container load'}
- Additional Message/Request: ${message || 'No additional message'}

Please structure your response exactly like a high-end corporate B2B offer letter. Include:
1. Warm, professional appreciation of their interest.
2. Technical specifics for the requested product (Potatoes size, storage; or Peanuts variety, moisture limit, counts/ounce).
3. Explanation of standard shipping/logistic options (FOB Mundra Port, or CIF to their country).
4. Outline of Payment terms (T/T or L/C) and our regulatory compliance (APEDA, FSSAI, ISO, IEC).
5. Clear call to action (arranging a short WhatsApp or Zoom call, sending detailed specification sheets, or finalizing a trial container order).
6. Sign-off from:
   Export Desk, JP EXIM
   Proprietor: Mr. Pradip Padhiyar
   Plot No. 60, Vedanta Bungalows, Deesa, Gujarat, India
   Contact: +91 7046058487

Keep the formatting clean with appropriate spacing, bold labels, and paragraphs. Avoid any markdown code block wraps in your text, just return the text formatted nicely.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: jpeximContext,
        temperature: 0.6,
      }
    });

    res.json({
      replyText: response.text,
      followUpMessage: `Inquiry successfully processed! Our B2B AI Generator has compiled a tailored export proposal based on your specific requirements. Our Director, Mr. Pradip Padhiyar, will reach out to you on WhatsApp at ${phone || 'your phone number'} or Email at ${email} shortly.`,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Gemini Inquiry API Error:', err);
    res.status(500).json({ error: 'Failed to process inquiry proposal', details: err.message });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

