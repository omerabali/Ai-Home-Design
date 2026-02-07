
const https = require('https');

const apiKey = 'yourId';
const model = 'black-forest-labs/flux-schnell';

const options = {
    hostname: 'api.replicate.com',
    path: `/v1/models/${model}/versions`,
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
            if (json.results) {
                console.log('Found versions:', json.results.length);
                json.results.slice(0, 5).forEach(v => {
                    console.log(`ID: ${v.id} | Created: ${v.created_at}`);
                });
            } else {
                console.log('JSON:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error(e);
        }
    });
});

req.end();
