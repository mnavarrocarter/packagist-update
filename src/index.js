const core = require("@actions/core");
const fs = require("fs/promises");
require("isomorphic-fetch");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

async function run() {
  const domain = core.getInput("domain");
  const username = core.getInput("username");
  const apiToken = core.getInput("api_token");
  let packageName = core.getInput("package_name");
  const baseUrl = core.getInput("package_base_url");

  if (!packageName || packageName === "") {
    let buff = undefined;
    try {
      buff = await fs.readFile("composer.json");
    } catch (e) {
      throw new Error(
        "Could not read composer.json file. Try passing the package name explicitly or checkout the code."
      );
    }

    const data = JSON.parse(buff.toString("utf8"));
    packageName = data.name;

    if (!packageName) {
      throw new Error("Package name not present in composer.json");
    }
  }

  const request = {
    method: "POST",
    body: `{"repository":{"url":"${baseUrl}/${packageName}"}}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    await update(domain, packageName, username, apiToken, request);
  } catch (e) {
    if (e instanceof NotFoundError) {
      core.debug(e.message);
      core.debug("Package not found, creating it...");
      await create(domain, packageName, username, apiToken, request);
    } else {
      throw e;
    }
  }
}

async function update(domain, packageName, username, apiToken, request) {
  core.debug(`Sending request to update ${packageName} package`);

  const resp = await fetch(
    `https://${domain}/api/update-package?username=${username}&apiToken=${apiToken}`,
    request
  );

  if (!resp.ok) {
    if (resp.status == 404) {
      throw new NotFoundError(
        `Package ${packageName} not found - ${await resp.text()}`
      );
    } else {
      throw new Error(
        `Error response ${
          resp.status
        } from Packagist during update - ${await resp.text()}`
      );
    }
  }

  const data = await resp.json();
  core.setOutput("job_id", data.jobs[0]);
  core.info(`Package ${packageName} updated successfully!`);
}

async function create(domain, packageName, username, apiToken, request) {
  core.debug(`Sending request to create ${packageName} package`);

  const resp = await fetch(
    `https://${domain}/api/create-package?username=${username}&apiToken=${apiToken}`,
    request
  );

  if (!resp.ok) {
    throw new Error(
      `Error response ${
        resp.status
      } from Packagist during create - ${await resp.text()}`
    );
  }

  core.info(`Package ${packageName} created successfully!`);
}

run().catch((e) => core.setFailed(e.message));
