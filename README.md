Packagist Update
================

This action triggers an on-demand package update on Packagist.

## Inputs

### `username`

**Required.** The Packagist username to use.

### `api_token`

**Required.** The Packagist api token to use.

### `package_name`

The package name to update in `vendor/name` form. If not provided, it is taken from `composer.json`.

> NOTE: To read `composer.json` you need to checkout your code before using this action. If that is not convenient
> to you, you MUST pass the package name explicitly.

### `domain`

The Packagist domain to call. Default `"packagist.org"`.

## Outputs

### `job_id`

The packagist job created for your update.

## Example usage

```yaml
uses: mnavarrocarter/packagist-update@v1.0
with:
  username: "your-username"
  api_token: ${{ secrets.packagist_token }}
  package_name: vendor/name # No need to be explicit if you have checked out a composer.json
  domain: "packagist.org" # This is by default, so no need to specify this.
```


