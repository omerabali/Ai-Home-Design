
const https = require('https');
const fs = require('fs');

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
                fs.writeFileSync('id.txt', json.latest_version.id);
            }
        } catch (e) {
            console.error(e);
        }
    });
});

req.end();
