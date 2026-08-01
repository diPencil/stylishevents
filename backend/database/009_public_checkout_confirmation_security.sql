ALTER TABLE public_checkout_sessions
  ADD COLUMN IF NOT EXISTS confirmation_token_hash CHAR(64) NULL AFTER payload_hash,
  ADD COLUMN IF NOT EXISTS confirmation_token_expires_at DATETIME NULL AFTER confirmation_token_hash,
  ADD COLUMN IF NOT EXISTS confirmed_at DATETIME NULL AFTER confirmation_token_expires_at;

CREATE INDEX idx_public_checkout_sessions_confirmation ON public_checkout_sessions (registration_id, confirmation_token_expires_at);
