# Tapvora MVP plan

## Locked product decisions

- Permanent public URL per physical card: `https://tapvora.in/r/{code}`.
- The printed QR and NFC NDEF URL contain that same Tapvora URL.
- The dashboard changes the Google Review destination; the physical card is not reprinted or rewritten.
- PVC card format: 85 × 54 mm, matching the current blank-card stock, with review-focused face and minimal Tapvora branding.
- Initial inventory: 20 blank cards.

## MVP surface

1. Public landing page.
2. Private admin login backed by Supabase Auth.
3. Batch-create one to fifty permanent card records.
4. Assign a business name and Google Review URL.
5. Mark cards unused, active, or inactive.
6. Download a high-resolution QR SVG.
7. Download an exact-size 85 × 54 mm SVG artwork.
8. Redirect `/r/{code}` through the database using a non-cacheable HTTP 307 response.
9. Count combined QR/NFC opens and retain the last-opened timestamp.

## Production flow for the first 20 cards

1. Create a batch of 20 records in the dashboard.
2. Download and place each card's artwork into the print workflow.
3. Program the matching permanent URL to that card as an NDEF URI record.
4. Keep the NFC chip unlocked for the prototype batch.
5. Test QR and NFC before and after printing, and again after adhesive mounting.
6. Assign and activate a card only after its business and destination are verified.

## Deliberately deferred

- Customer accounts and subscriptions.
- Separate NFC-versus-QR analytics; both currently use one URL by design.
- Multiple destinations, link pages, menus, WhatsApp, and social profiles.
- Multi-location business hierarchy.
- Automated billing, order fulfilment, and printer integrations.
