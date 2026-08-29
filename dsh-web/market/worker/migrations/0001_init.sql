-- dsh-market: likes (per-device one vote) and aggregated counts.
CREATE TABLE IF NOT EXISTS likes (
  kind TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  device_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (kind, asset_id, device_hash)
);

CREATE INDEX IF NOT EXISTS idx_likes_kind_asset ON likes(kind, asset_id);

CREATE TABLE IF NOT EXISTS counts (
  kind TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, asset_id)
);
