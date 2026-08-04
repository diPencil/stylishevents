USE directevents_platform;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_details_image_url VARCHAR(500) NULL AFTER banner_image_url;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

DELETE r1 FROM reviews r1
JOIN reviews r2
  ON r1.customer_id = r2.customer_id
 AND r1.event_id = r2.event_id
 AND r1.id > r2.id
WHERE r1.customer_id IS NOT NULL;

CREATE INDEX idx_reviews_public_event_status ON reviews (event_id, status, created_at);
CREATE INDEX idx_reviews_customer_event ON reviews (customer_id, event_id);
CREATE UNIQUE INDEX uq_reviews_customer_event ON reviews (customer_id, event_id);
