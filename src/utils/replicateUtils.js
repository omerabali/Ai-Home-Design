import { REPLICATE_API_KEY } from '../services/aiService';

// Cache to store model IDs so we don't fetch them every time
const versionCache = {};

/**
 * Fetches the latest version ID for a given Replicate model.
 * @param {string} modelOwner - The owner of the model (e.g., "facebook" or "black-forest-labs")
 * @param {string} modelName - The name of the model (e.g., "segment-anything-2")
 * @returns {Promise<string>} - The version ID
 */
export const getModelVersion = async (modelOwner, modelName) => {
    const cacheKey = `${modelOwner}/${modelName}`;

    // Return cached version if exists
    if (versionCache[cacheKey]) {
        console.log(`💎 [Cache] Using cached version for ${cacheKey}`);
        return versionCache[cacheKey];
    }

    console.log(`🔍 [Replicate] Fetching latest version for ${cacheKey}...`);

    try {
        // Use the list versions endpoint
        // Endpoint: https://api.replicate.com/v1/models/{model_owner}/{model_name}
        // Proxy: /api/replicate/v1/models/{model_owner}/{model_name}
        const response = await fetch(`/api/replicate/v1/models/${modelOwner}/${modelName}`, {
            headers: {
                "Authorization": `Token ${REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.warn(`⚠️ Failed to fetch model info for ${cacheKey}: ${response.status}`);
            return null; // Let the caller handle the fallback
        }

        const data = await response.json();

        // The API returns the model details, usually including 'latest_version'
        if (data.latest_version && data.latest_version.id) {
            const versionId = data.latest_version.id;
            versionCache[cacheKey] = versionId; // Cache it
            console.log(`✅ [Replicate] Found version for ${cacheKey}: ${versionId}`);
            return versionId;
        } else {
            console.warn(`⚠️ No latest_version found for ${cacheKey}`);
            return null;
        }

    } catch (error) {
        console.error(`❌ [Replicate] Error fetching version for ${cacheKey}:`, error);
        return null;
    }
};
