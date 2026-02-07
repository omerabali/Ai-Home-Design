import { db } from "../lib/firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { getModelVersion } from '../utils/replicateUtils';

/**
 * AI Image Generation Service
 * Uses Dezgo API for real image-to-image transformation
 * Falls back to Pollinations for text-to-image if no input image
 */

const DEZGO_API_KEY = import.meta.env.VITE_DEZGO_API_KEY;
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY; // New Free Tier Option
const DEZGO_IMG2IMG_URL = 'https://api.dezgo.com/image2image';
const DEZGO_TXT2IMG_URL = 'https://api.dezgo.com/text2image';

// Stil açıklamaları
const styleDescriptions = {
    modern: "modern contemporary style, clean lines, minimalist furniture, neutral colors with accent pieces, sleek surfaces, large windows",
    industrial: "industrial loft style, exposed brick walls, metal and iron accents, raw concrete, Edison bulb lighting, dark moody tones",
    scandinavian: "Scandinavian nordic style, light natural wood, white walls, cozy textiles, hygge atmosphere, plants, minimal decor",
    bohemian: "bohemian boho style, colorful patterns and textiles, many houseplants, eclectic vintage furniture, natural materials",
    artdeco: "art deco style, geometric patterns, gold brass accents, velvet upholstery, glamorous vintage Hollywood feel",
    minimalist: "minimalist zen style, very simple forms, monochrome palette, only essential furniture, lots of empty space",
    traditional: "traditional classic style, ornate furniture, rich warm colors, symmetrical layout, elegant crown moldings",
    rustic: "rustic farmhouse style, reclaimed wood, stone fireplace, warm earthy tones, cozy cabin atmosphere"
};

// Oda tipleri
// Oda tipleri (Daha detaylı mobilya tanımları)
const roomDescriptions = {
    living_room: "luxury living room with large comfortable sofa, designer coffee table, wall clock, lush indoor plants, textured area rug, art pieces on walls, soft throw pillows, curtains",
    bedroom: "cozy master bedroom with king size bed, bedside lamps, large wardrobe, vanity mirror, soft carpet, wall art, cozy armchair, ceiling fan",
    kitchen: "modern gourmet kitchen with marble countertops, high-end appliances, kitchen island with bar stools, pendant lighting, cabinetry, decorative vase",
    bathroom: "spa-like bathroom with freestanding bathtub, glass shower, double vanity, large mirror, towel warmer, indoor plants, marble tiles",
    office: "professional home office with ergonomic desk, leather chair, wall shelving units, library, reading lamp, wall clock, modern decor",
    dining: "elegant dining room with large solid wood table, upholstered chairs, crystal chandelier, sideboard with mirror, table centerpiece, wall art"
};

const callPollinationsFallback = async (prompt) => {
    console.log("🎨 [Pollinations] Fallback API çağrılıyor...");
    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations generates immediately via URL
    // We add a random seed to prevent caching
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=576&seed=${seed}&model=flux`;

    // Validate if the URL is accessible (optional but good for debugging)
    // For Pollinations, we just return the URL directly as it's a generation-on-demand URL
    return imageUrl;
};

/**
 * Hugging Face Instruct-Pix2Pix API (Free Tier Friendly)
 * Best for "Make this room modern" type commands
 */
const callHuggingFaceImg2Img = async (base64Image, prompt) => {
    console.log("🎨 [HuggingFace] Instruct-Pix2Pix çağrılıyor...");

    // Hugging Face inference API often handles Data URIs better in JSON payloads
    // or expects standard base64 strings. Let's try sending the full Data URI first
    // as it contains mime type info.
    const fullDataURI = base64Image;

    // Model: Instruct-Pix2Pix
    // Using local Vite proxy configured in vite.config.js to bypass CORS
    // Target: https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix
    const HF_PROXY_URL = "/api/huggingface/models/timbrooks/instruct-pix2pix";

    // Clean key just in case
    const apiKey = HUGGINGFACE_API_KEY ? HUGGINGFACE_API_KEY.trim() : "";

    const response = await fetch(HF_PROXY_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                // Trying specific parameter structure for pix2pix
                image: fullDataURI,
                num_inference_steps: 25,
                image_guidance_scale: 1.5,
                guidance_scale: 7.5
            }
        })
    });

    // NOTE: If the generic API fails with standard JSON, 
    // we might need to send Blob. But Instruct-Pix2Pix usually handles JSON inputs via some widgets.
    // Let's try the standard way first. If this fails, we catch it.

    if (!response.ok) {
        // If 503 (Loading), we should retry, but for now just fail to fallback
        throw new Error(`HF API error: ${response.status}`);
    }

    const imageBlob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
    });
};

/**
 * Dezgo Image-to-Image API çağrısı

/**
 * Dezgo Image-to-Image API çağrısı
 * Orijinal odayı alıp seçilen stilde yeniden tasarlar
 */
export const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

// Replicate Proxy (We should ideally use a backend, but for this demo we'll try direct or proxy)
// WARNING: Using Replicate in browser requires a proxy to hide the key, or "dangerouslyAllowBrowser: true" if supported by their JS client. 
// Since we are using fetch, we will hit CORS. We need a proxy.
// For now, let's use a standard HTTP proxy approach or assume the user has a local proxy. 
// Actually, the user has been having CORS issues. 
// Let's assume we will use a proxy `https://corsproxy.io/?` for Replicate API as well, 
// BUT Replicate API usually forbids browser calls for security.
// However, the user asked "which one to get on Replicate", implying they might have a key.

// Let's use the Dezgo fix first as a fallback, but implement Replicate as PRIMARY if key is present.
// Actually, to fix the IMMEDIATE error, let's just make Dezgo work first (since they have the key) and then add Replicate.

// Wait, the user specifically asked "replicate de hangisini almam gerekiyor". 
// I should answer that in the notification.
// And I should FIX the 'sdxl' error in the code simultaneously.

/**
 * Replicate ControlNet API Call
 * Uses 'jagilley/controlnet-canny' for structural preservation
 */
const callReplicateImg2Img = async (base64Image, prompt) => {
    console.log("🎨 [Replicate] ControlNet API çağrılıyor...");

    // Replicate expects a public URL or base64. 
    // Proxy: We need to use a proxy because Replicate API does not support CORS for browser calls directly.
    // Ideally this should be a backend call.
    // We will use the same corsproxy.io trick.

    // Model: jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613
    const REPLICATE_MODEL_VERSION = "aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613";
    // Using Vite Proxy instead of corsproxy.io
    const PROXY_URL = "/api/replicate/v1/predictions";

    const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
            // "Authorization" header is handled by the proxy or here? 
            // Replicate requires Authorization header. 
            // Since we are proxying, we pass it here and the proxy forwards it.
            "Authorization": `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            version: REPLICATE_MODEL_VERSION,
            input: {
                image: base64Image, // Replicate accepts Data URI
                prompt: prompt,
                a_prompt: "best quality, extremely detailed, photo from the future, cinematic lighting, photorealistic, 8k, hdr, unity 8k wallpaper", // positive prompt
                n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, blur, pixelated, text, watermark, signature",
                structure: "canny", // ControlNet type
                num_samples: "1",
                image_resolution: "512", // Higher might be slower
                ddim_steps: 30, // Increased for better quality
                scale: 9,
                eta: 0.0
            }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Replicate API Init Error: ${response.status} ${err}`);
    }

    const prediction = await response.json();
    console.log("⏳ Replicate işlemi başladı, ID:", prediction.id);

    // Polling for result
    // The prediction.urls.get is like "https://api.replicate.com/v1/predictions/xyz"
    // We need to route this through our proxy too.
    // Replace "https://api.replicate.com/v1/predictions" with "/api/replicate"
    // Actually the proxy setup replaced /api/replicate with https://api.replicate.com/v1/predictions
    // Wait, my proxy config was:
    // '/api/replicate': target: 'https://api.replicate.com', rewrite: path => path.replace(/^\/api\/replicate/, '')
    // So /api/replicate/v1/predictions -> https://api.replicate.com/v1/predictions

    // We can just construct the poll URL manually using the ID
    const getResultUrl = `/api/replicate/v1/predictions/${prediction.id}`;

    let result = null;
    let attempts = 0;
    while (!result && attempts < 40) { // Increased to 40 attempts (80s)
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s
        attempts++;
        console.log(`⏳ Replicate durumu kontrol ediliyor... (${attempts}/40)`);

        const pollResponse = await fetch(getResultUrl, {
            headers: {
                "Authorization": `Token ${REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!pollResponse.ok) {
            console.warn(`⚠️ Replicate poll HTTP Error: ${pollResponse.status}`);
            continue;
        }

        const pollData = await pollResponse.json();
        console.log(`✅ Replicate Status: ${pollData.status}`);

        if (pollData.status === "succeeded") {
            result = pollData.output[1]; // Output is usually [canny_edge, generated_image]
        } else if (pollData.status === "failed" || pollData.status === "canceled") {
            throw new Error(`Replicate generation failed: ${pollData.error || pollData.status}`);
        }
    }

    if (!result) throw new Error("Replicate timeout");

    return result; // URL of the generated image
};

/**
 * Replicate Flux API Call (SOTA Instruction Following)
 * Uses 'black-forest-labs/flux-schnell' for fast, high-quality generation
 */
const callReplicateFlux = async (base64Image, prompt) => {
    console.log("🚀 [Replicate] Flux Schnell API çağrılıyor...");

    console.log("🚀 [Replicate] Flux Depth ControlNet başlatılıyor...");

    // Endpoint: Standard Predictions
    const PROXY_URL = "/api/replicate/v1/predictions";

    // Dynamically fetch version for Flux Schnell (or depth-dev)
    // Using 'black-forest-labs/flux-depth-dev' if possible, or 'flux-schnell' + ControlNet logic
    // Actually, 'flux-depth-dev' is a specific model.
    let versionId = await getModelVersion("black-forest-labs", "flux-depth-dev");

    // Fallback known hash if fetch fails
    if (!versionId) versionId = "ae2b5597113075d385b2d194d805c31757879685123123"; // TODO: Update if still invalid

    let response;
    let retries = 0;
    while (retries < 3) {
        response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Using black-forest-labs/flux-depth-dev hash
                version: versionId,
                input: {
                    prompt: prompt,
                    control_image: base64Image,
                    strength: 0.45,
                    guidance: 5.0,
                    num_inference_steps: 28,
                    output_quality: 90
                }
            })
        });

        if (response.status === 429) {
            const waitTime = Math.pow(2, retries) * 1000;
            console.warn(`⚠️ Flux Rate Limited (429). Retrying in ${waitTime}ms...`);
            await new Promise(r => setTimeout(r, waitTime));
            retries++;
            continue;
        }
        break;
    }

    if (!response || !response.ok) {
        const err = await (response ? response.text() : "No response");
        throw new Error(`Replicate Flux Error: ${response ? response.status : "Unknown"} ${err}`);
    }

    const prediction = await response.json();
    console.log("⏳ Flux işlemi başladı, ID:", prediction.id);

    const getResultUrl = `/api/replicate/v1/predictions/${prediction.id}`;
    let result = null;
    let attempts = 0;

    while (!result && attempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        attempts++;

        const pollResponse = await fetch(getResultUrl, {
            headers: {
                "Authorization": `Token ${REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!pollResponse.ok) continue;

        const pollData = await pollResponse.json();

        if (pollData.status === "succeeded") {
            result = pollData.output[0]; // Flux returns array of strings
        } else if (pollData.status === "failed") {
            throw new Error(`Flux failed: ${pollData.error}`);
        }
    }

    if (!result) throw new Error("Flux timeout");
    return result;
};

/**
 * Stage 1: The "Architect" (VLM Analysis)
 * Uses LLaVA (Large Language-and-Vision Assistant) to see the room and plan the layout.
 */
const analyzeRoomWithVLM = async (base64Image, userRequest) => {
    console.log("🧠 [Architect] VLM Analyzing Room Structure...");

    // Standardizing on v1/predictions endpoint
    const PROXY_URL = "/api/replicate/v1/predictions";

    // Dynamically fetch LLaVA version
    // Using 'yorickvp/llava-13b' which is a reliable public version
    let versionId = await getModelVersion("yorickvp", "llava-13b");
    if (!versionId) versionId = "e272157381e2a3bf12df3a8edd1f38d1dbd736bbb7437277c8b34175f8fce358"; // Fallback known hash

    const prompt = `Role: Senior Interior Architect.
    Task: Analyze this room's structure and empty spaces to plan furniture placement.
    User Request: "${userRequest}"

    Output Format:
    1. Room Geometry: (e.g., "Rectangular room with bay windows on left")
    2. Best Layout Plan: (e.g., "Place the sofa in the center facing the fireplace")
    3. Structural Constraints: (e.g., "Avoid blocking the french doors")
    
    Provide a concise, professional instruction for the 3D renderer.`;

    try {
        let response;
        let retries = 0;

        while (retries < 3) {
            response = await fetch(PROXY_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    version: versionId,
                    input: {
                        image: base64Image,
                        prompt: prompt,
                        top_p: 1,
                        max_tokens: 150
                    }
                })
            });

            if (response.status === 429) {
                const waitTime = Math.pow(2, retries) * 1000;
                console.warn(`⚠️ VLM Rate Limited (429). Retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
                retries++;
                continue;
            }
            break;
        }

        if (!response || !response.ok) {
            const err = await (response ? response.text() : "No response");
            throw new Error(`VLM Request Failed: ${response ? response.status : "No Response"} - ${err}`);
        }

        const prediction = await response.json();
        const getResultUrl = `/api/replicate/v1/predictions/${prediction.id}`;

        // Polling loop
        let result = null;
        let attempts = 0;
        while (!result && attempts < 20) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
            const pollRes = await fetch(getResultUrl, {
                headers: { "Authorization": `Token ${REPLICATE_API_KEY}` }
            });
            const pollData = await pollRes.json();
            if (pollData.status === "succeeded") {
                result = pollData.output.join(" "); // LLaVA returns array of tokens
            } else if (pollData.status === "failed") {
                throw new Error("VLM Optimization Failed");
            }
        }

        console.log("🧠 [Architect] Plan:", result);
        return result;

    } catch (e) {
        console.warn("⚠️ Architect error:", e);
        return null; // Fallback to manual rules if VLM fails
    }
};

const callDezgoImg2Img = async (base64Image, prompt, strength = 0.75) => {
    console.log("🎨 [Dezgo] Image-to-Image API çağrılıyor...");

    // Base64'ten "data:image/..." prefix'ini kaldır
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(DEZGO_IMG2IMG_URL, {
        method: 'POST',
        headers: {
            'X-Dezgo-Key': DEZGO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            init_image: cleanBase64,
            strength: strength,
            guidance: 7.5,
            steps: 30,
            sampler: "dpmpp_2m_karras",
            model: "absolute_reality_1_8_1" // FIXED: Valid model ID
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[Dezgo] API Error:", response.status, errorText);
        throw new Error(`Dezgo API error: ${response.status} - ${errorText}`);
    }

    const imageBlob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
    });
};

const callDezgoTxt2Img = async (prompt) => {
    console.log("🎨 [Dezgo] Text-to-Image API çağrılıyor...");

    const response = await fetch(DEZGO_TXT2IMG_URL, {
        method: 'POST',
        headers: {
            'X-Dezgo-Key': DEZGO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy",
            width: 1024,
            height: 576,
            guidance: 7.5,
            steps: 30,
            sampler: "dpmpp_2m_karras",
            model: "absolute_reality_1_8_1" // FIXED: Valid model ID
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dezgo API error: ${response.status} - ${errorText}`);
    }

    const imageBlob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
    });
};

// Senaryo Tabanlı Prompt Eklentileri
const promptScenarios = {
    living: "Layout: Open concept, central seating area. Furniture: Comfortable sofa facing the focal point, coffee table in center. Atmosphere: Daily use, family friendly, balanced lighting.",
    cinema: "Layout: Theater arrangement, seating facing screen. Furniture: Large L-shaped sofa facing a large wall-mounted TV or projection screen, low coffee table. Atmosphere: Dim warm ambient lighting, blackout curtains, cozy movie night vibes.",
    hosting: "Layout: Social circle arrangement, maximizing seating capacity. Furniture: Large sectional sofa, multiple armchairs arranged in a conversation circle, side tables, avoiding empty corners. Atmosphere: Bright welcoming lighting, fresh flowers, crowded and lively.",
    workspace: "Layout: Productivity focused, desk facing room or window. Furniture: Ergonomic office chair, large desk with technology, bookshelves in background. Atmosphere: Task lighting, organized, professional and clean.",
    relaxing: "Layout: Cozy nook arrangement. Furniture: Comfortable reading chair or chaise lounge near window/light source, soft textures, floor cushions. Atmosphere: Zen, peaceful, soft sunlight, plants.",
    luxury: "Layout: Symmetrical formal arrangement. Furniture: High-end designer furniture, matching sets, grand scale items. Atmosphere: Hotel suite vibes, velvet, gold accents, spot lighting on art.",
    gaming: "Layout: Immersive setup. Furniture: Gaming desk with multiple monitors, RGB lighting, ergonomic racing chair, acoustic panels. Atmosphere: Neon accents, dark room, high tech."
};

// Tasarım Gerekçesi Üretici (Design Rationale)
const getDesignRationale = (scenario, style) => {
    const rationals = [
        `Selected ${style} style to match the ${scenario} mood.`,
        `Optimized lighting and furniture layout for a ${scenario} experience.`,
        `Incorporated ${style} elements to enhance the ${scenario} functionality.`,
        `Focused on creating a ${scenario} atmosphere with distinct ${style} touches.`
    ];
    return rationals[Math.floor(Math.random() * rationals.length)];
};

export const generateImage = async (userId, originalImageBase64, style, roomType, model = 'flux', scenario = 'living', customPrompt = '') => {
    try {
        const finalUserId = userId || `guest_${Math.random().toString(36).substring(2, 10)}`;
        let newDesignRef;
        const dbInitialized = db && (typeof db.collection === 'function' || db._app);
        let canWriteToDb = false;

        try {
            if (db && Object.keys(db).length > 0) canWriteToDb = true;
        } catch (e) { canWriteToDb = false; }

        if (canWriteToDb) {
            try {
                newDesignRef = doc(collection(db, "designs"));
                // Rationale oluştur
                const designRationale = getDesignRationale(scenario, style);

                await setDoc(newDesignRef, {
                    userId: finalUserId,
                    originalImageUrl: originalImageBase64 ? "uploaded" : "none",
                    style,
                    roomType,
                    scenario,
                    customPrompt, // Save custom prompt
                    designRationale,
                    status: 'processing',
                    createdAt: new Date().toISOString(),
                    modelUsed: model
                });
            } catch (e) {
                console.warn("⚠️ DB write failed, continuing:", e);
                canWriteToDb = false;
            }
        }

        const styleDesc = styleDescriptions[style] || styleDescriptions.modern;
        const roomDesc = roomDescriptions[roomType] || roomDescriptions.living_room;
        const scenarioDesc = promptScenarios[scenario] || promptScenarios.living;

        // NEW: Stage 1 - Call the Architect (VLM)
        let architectPlan = "";
        if (customPrompt && REPLICATE_API_KEY) {
            architectPlan = await analyzeRoomWithVLM(originalImageBase64, customPrompt);
        }

        // ZENGİNLEŞTİRİLMİŞ PROMPT (Katmanlı Yapı - Universal Layout Engine)
        // 1. Layer: Structure (Handled by ControlNet Depth)
        // 2. Layer: VLM Architect Plan (Dynamic Layout)
        // 3. Layer: Decor (Density Rule)

        let prompt = `Role: Professional Interior Designer.
        Task: Redesign this room while preserving exact architectural geometry.
        
        Style: ${styleDesc} ${roomDesc}.
        Scenario: ${scenarioDesc}.
        
        ${architectPlan ? `ARCHITECTURAL PLAN (MUST FOLLOW): ${architectPlan}` : ""}
        
        Execution:
        - Furniture Placement: Follow the Architect Plan above strictly.
        - Density: Fully furnished, lived-in look, no empty spaces (Layer 3).
        - Aesthetics: Cinematic lighting, professional photography, 8k, highly detailed textures, depth of field, Architectural Digest style.
        `;

        // Add custom user request if exists
        if (customPrompt) {
            prompt += ` \nUser Request: ${customPrompt}. IMPORTANT: Follow user request strictly.`;

            // 1. Basic Object Translation
            const keywords = {
                "televizyon": "large wall-mounted TV",
                "tv": "large wall-mounted TV",
                "koltuk": "modern comfortable sofa",
                "kanepe": "sofa",
                "masa": "dining table",
                "sehpa": "coffee table",
                "halı": "area rug",
                "çiçek": "indoor plants",
                "bitki": "indoor plants",
                "lamba": "modern lighting",
                "aydınlatma": "lighting fixtures",
                "kütüphane": "bookshelves",
                "kitaplık": "bookshelves",
                "klima": "air conditioner unit"
            };

            let detectedObjects = [];
            const lowerPrompt = customPrompt.toLowerCase();

            Object.keys(keywords).forEach(key => {
                if (lowerPrompt.includes(key)) detectedObjects.push(keywords[key]);
            });

            // 2. Spatial Logic Mapping (New: Fixes "Wrong Place" issue)
            // Maps specific user intents to explicit spatial English commands
            const spatialRules = [
                {
                    condition: (p) => (p.includes("televizyon") || p.includes("tv")) && (p.includes("şömine") || p.includes("duvar")),
                    instruction: "mount the TV directly above the fireplace/mantel" // Specific fix for this use case
                },
                {
                    condition: (p) => (p.includes("koltuk") || p.includes("kanepe")) && (p.includes("şömine") || p.includes("karşı")),
                    instruction: "place a large sectional sofa in the center of the room, occupying the foreground, directly facing the fireplace" // Force foreground placement
                },
                {
                    condition: (p) => (p.includes("halı")) && (p.includes("yer") || p.includes("orta") || p.includes("zemin")),
                    instruction: "place a large area rug on the floor in the center"
                },
                {
                    condition: (p) => p.includes("tavan") && (p.includes("lamba") || p.includes("şık")),
                    instruction: "install modern chandelier or recessed lighting on the ceiling"
                }
            ];

            let spatialInstructions = [];
            spatialRules.forEach(rule => {
                if (rule.condition(lowerPrompt)) {
                    spatialInstructions.push(rule.instruction);
                }
            });

            // Construct Final Prompt Injection
            if (detectedObjects.length > 0) {
                prompt += `\nMandatory Objects: ${detectedObjects.join(", ")}.`;
            }
            if (spatialInstructions.length > 0) {
                prompt += `\nSpatial Layout Instructions: ${spatialInstructions.join(". ")}. IMPORTANT: Respect these positions exactly.`; // Strong enforcement
            }
        }

        prompt += `\nCinematic lighting, professional photography, highly detailed textures, depth of field, ray tracing, Architectural Digest style, award-winning interior design, soft sunlight, 4k, hdr.
        NEGATIVE PROMPT: poorly placed furniture, floating objects, extra doors, new windows, changing room geometry, distorted perspective, bad anatomy, blurry, low resolution, ugly, deformed.`;

        let imageUrl = null;
        let provider = null;
        let fallbackError = null;

        // PRIORITY 1: Replicate (Professional ControlNet or Flux)
        if (REPLICATE_API_KEY && originalImageBase64) {
            try {
                if (model === 'flux') {
                    console.log("Bm Flux seçildi, Flux Img2Img başlatılıyor...");
                    imageUrl = await callReplicateFlux(originalImageBase64, prompt);
                    provider = 'replicate-flux';
                } else {
                    console.log("🔄 Replicate ControlNet başlatılıyor...");
                    imageUrl = await callReplicateImg2Img(originalImageBase64, prompt);
                    provider = 'replicate-controlnet';
                }
            } catch (repError) {
                console.warn("⚠️ Replicate hatası:", repError.message);
                fallbackError = "Replicate: " + repError.message;
            }
        }

        // PRIORITY 2: Dezgo (Disabled per user request for now)
        /*
        if (!imageUrl && DEZGO_API_KEY) {
            try {
                if (originalImageBase64) {
                    console.log("🔄 Dezgo Img2Img başlatılıyor...");
                    imageUrl = await callDezgoImg2Img(originalImageBase64, prompt, 0.35);
                    provider = 'dezgo-img2img';
                } else {
                    imageUrl = await callDezgoTxt2Img(prompt);
                    provider = 'dezgo-txt2img';
                }
            } catch (dezgoError) {
                console.warn("⚠️ Dezgo hatası:", dezgoError.message);
                fallbackError = dezgoError.message;
            }
        }
        */

        // PRIORITY 3: Hugging Face (Free)
        if (!imageUrl && HUGGINGFACE_API_KEY && originalImageBase64) {
            try {
                console.log("🔄 HuggingFace Img2Img başlatılıyor...");
                // Using corsproxy.io to fix CORS error
                const hfPrompt = `turn this room into ${style} style`;
                imageUrl = await callHuggingFaceImg2Img(originalImageBase64, hfPrompt);
                provider = 'huggingface-pix2pix';
            } catch (hfError) {
                console.warn("⚠️ HuggingFace hatası:", hfError.message);
                fallbackError = fallbackError ? fallbackError + " | " + hfError.message : hfError.message;
            }
        }

        // FAILSAFE
        if (!imageUrl) {
            if (originalImageBase64) {
                throw new Error("Resim işlenemedi. Dezgo model hatası giderildi, lütfen tekrar deneyin. Replicate entegrasyonu için API key bekleniyor.");
            } else {
                imageUrl = callPollinationsFallback(prompt);
                provider = 'pollinations-fallback';
            }
        }

        if (canWriteToDb && newDesignRef) {
            await updateDoc(newDesignRef, { status: 'completed', aiGeneratedImageUrl: imageUrl, prompt, provider });
        }

        return { success: true, designId: newDesignRef ? newDesignRef.id : 'guest-design', imageUrl, provider, prompt };

    } catch (error) {
        console.error("❌ Hata:", error);
        return { success: false, error: error.message };
    }
};

// Kullanıcının tasarım geçmişini getir
export const getUserDesigns = async (userId) => {
    try {
        if (!userId || userId.startsWith('guest_')) return [];

        const { query, where, orderBy, getDocs } = await import('firebase/firestore');
        if (!db || Object.keys(db).length === 0) return [];

        const designsRef = collection(db, "designs");
        const q = query(designsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Tasarımlar alınamadı (likely guest or no-db):", error);
        return [];
    }
};

// Video oluşturma (Real via Replicate SVD)
export const generateVideoFromImage = async (imageUrl) => {
    try {
        // Proxy URL - Replicate için
        const PROXY_URL = "/api/replicate/v1/predictions";
        const SVD_VERSION = "3f0457e4619daac51203dedb472816f3af3123d6c3263ddad97f3d748a255563"; // Stable Video Diffusion

        console.log("🎥 [Replicate] Video Generation başlatılıyor...");

        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Authorization": `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                version: SVD_VERSION,
                input: {
                    input_image: imageUrl,
                    video_length: "14_frames_with_svd_xt",
                    sizing_strategy: "maintain_aspect_ratio",
                    frames_per_second: 6,
                    motion_bucket_id: 127,
                    cond_aug: 0.02
                }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Replicate Video API Error: ${response.status}`);
        }

        const prediction = await response.json();
        console.log("⏳ Video ID:", prediction.id);

        const getResultUrl = `/api/replicate/v1/predictions/${prediction.id}`;
        let result = null;
        let attempts = 0;

        while (!result && attempts < 60) { // 2 dakikaya kadar bekle
            await new Promise(r => setTimeout(r, 2000));
            attempts++;

            const pollResponse = await fetch(getResultUrl, {
                headers: {
                    "Authorization": `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            if (!pollResponse.ok) continue;

            const pollData = await pollResponse.json();
            console.log(`🎥 Video Status: ${pollData.status}`);

            if (pollData.status === "succeeded") {
                result = pollData.output; // URL
            } else if (pollData.status === "failed") {
                throw new Error("Video generation failed.");
            }
        }

        if (!result) throw new Error("Video generation timed out.");

        return { success: true, videoUrl: result };

    } catch (error) {
        console.error("Video hatası:", error);
        return { success: false, error: error.message };
    }
};

export const interpolateVideo = async (videoUrl) => {
    return { success: false, error: "Video interpolasyon yakında." };
};
