const core = require('@actions/core');
const fs = require('fs/promises')
require('isomorphic-fetch')

async function run() {
    const domain = core.getInput('domain');
    const username = core.getInput('username');
    const apiToken = core.getInput("api_token");
    let packageName = core.getInput("package_name");

    if (!packageName || packageName === '') {
        let buff = undefined;
        try {
            buff = await fs.readFile('composer.json');
        } catch (e) {
            throw new Error('Could not read composer.json file. Try passing the package name explicitly or checkout the code.');
        }

        const data = JSON.parse(buff.toString('utf8'));
        packageName = data.name;

        if (!packageName) {
            throw new Error("Package name not present in composer.json");
        }
    }

    core.debug(`Sending request to update ${packageName} package`);

    const resp = await fetch(`https://${domain}/api/update-package?username=${username}&apiToken=${apiToken}`, {
        method: 'POST',
        body: `{"repository":{"url":"https://${domain}/packages/${packageName}"}}`,
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!resp.ok) {
        throw new Error(`Error response ${resp.status} from Packagist`);
    }

    const data = await resp.json();
    core.setOutput('job_id', data.jobs[0]);
    core.info(`Package ${packageName} updated successfully!`);
}

run().catch(e => core.setFailed(e.message));