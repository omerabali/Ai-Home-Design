
const https = require('https');

const apiKey = 'yourId';
const model = 'black-forest-labs/flux-schnell';

const options = {
    hostname: 'api.replicate.com',
    path: `/v1/models/${model}`,
    method: 'GET',
    headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.latest_version) {
                console.log('LATEST_VERSION_ID:', json.latest_version.id);
            } else {
                console.log('JSON:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
