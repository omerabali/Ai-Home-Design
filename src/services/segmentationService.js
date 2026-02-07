import { REPLICATE_API_KEY } from './aiService';
import { getModelVersion } from '../utils/replicateUtils';

/**
 * Stage 2: The "Surveyor" (Segmentation Engine)
 * Uses Meta's Segment Anything Model (SAM-2) to analyze room geometry.
 */
export const segmentRoom = async (base64Image) => {
    console.log("📐 [Surveyor] Segmenting Room Structure...");

    const PROXY_URL = "/api/replicate/v1/predictions";

    try {
        // 1. Get Valid Model Version
        // Try official meta/facebook model first, fallback to public mirror 'ijulius' if needed
        let versionId = await getModelVersion("facebook", "segment-anything-2");
        if (!versionId) {
            console.log("⚠️ Meta model private/unavailable, trying 'ijulius' mirror...");
            versionId = await getModelVersion("ijulius", "segment-anything-2");
        }

        // Hard fallback if dynamic fetch fails (Standard SAM-2 hash)
        if (!versionId) versionId = "9d1a3c00dcccc451631d8ce52207b533f8cf742962363574d754378772960655";

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
                        multimask_output: true
                    }
                })
            });

            if (response.status === 429) {
                const waitTime = Math.pow(2, retries) * 1000;
                console.warn(`⚠️ Segmentation Rate Limited. Retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
                retries++;
                continue;
            }
            break;
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Segmentation Request Failed: ${response.status} - ${errText}`);
        }

        const prediction = await response.json();
        const getResultUrl = `/api/replicate/v1/predictions/${prediction.id}`;

        let result = null;
        let attempts = 0;
        while (!result && attempts < 30) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
            const pollRes = await fetch(getResultUrl, {
                headers: { "Authorization": `Token ${REPLICATE_API_KEY}` }
            });
            const pollData = await pollRes.json();

            if (pollData.status === "succeeded") {
                result = pollData.output;
            } else if (pollData.status === "failed") {
                throw new Error("Segmentation Analysis Failed");
            }
        }

        console.log("📐 [Surveyor] Segmentation Complete:", result ? "Success" : "Empty");
        return result;

    } catch (e) {
        console.warn("⚠️ Surveyor error:", e);
        return null;
    }
};
