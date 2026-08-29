# Agent Note: Remove dsh-miku-pet

Status: implemented

## Problem

The dsh-miku-pet package was shipped as a standalone plugin, included in the dsh-web-all aggregate, listed in the community plugin index, and published in the Workshop manifest. Keeping those surfaces after removing the plugin would leave installable metadata and aggregate references pointing at a package that no longer exists.

## Decision

The dsh-miku-pet package and its assets are removed. Its community index entry, dsh-web-all aggregate manifest and generated patch/dependency outputs are removed, and the workspace lockfile and generated Workshop plugin manifest are regenerated. The built-in dsh-pet remains available.

## Alternatives considered

- Disable only the runtime profile entry: rejected because the package would remain installable and discoverable through the community index and Workshop.
- Keep the package source but remove it from the aggregate: rejected because stale package code and metadata would preserve an unsupported plugin surface.

## Consequences

The dsh-miku-pet overlay, routes, settings section, assets, and installation metadata are no longer available. Existing users must remove any separately installed dsh-miku-pet bundle from their DSH profile; this repository no longer provides or aggregates it.

## Testing

The aggregate generator, workspace lockfile, community index, and Workshop manifest are regenerated and checked for remaining active or generated dsh-miku-pet references.
