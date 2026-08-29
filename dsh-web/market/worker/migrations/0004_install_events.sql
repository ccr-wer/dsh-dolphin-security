-- dsh-market: one-shot Workshop install events and per-asset cumulative counts.
-- The event id is a deterministic hash of (kind, asset_id, device_hash, install_id),
-- so retrying the same install collapses while an uninstall followed by a fresh
-- install of the same asset on the same device counts again (fresh install_id).
CREATE TABLE IF NOT EXISTS install_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  device_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS install_counts (
  kind TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  installs INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_install_events_kind_asset ON install_events(kind, asset_id);
