# UI Guide — `requestMissionClaimReward`

## UI guidance
- Show a loading indicator while the promise is pending; this is a
  server round-trip with side effects (DB writes, CRM rules) and may
  take 200–800ms depending on configured CRM automations.
- Disable the claim button for the duration of the call. The local
  `prize_claimed_date_ts` flag won't flip until the auto-refresh fires
  after the response.
- Treat `err_code === 0` and `err_code === 40017` identically in the
  UI: hide the claim button. Don't surface 40017 as an error.
- For `err_code === 40015` (window expired), show a dedicated message
  referencing the original `prize_claim_expiration_date`, not a generic
  error.
- For `err_code === 40016` (not completed), this should not normally
  happen if the UI gates on `is_completed === true`. If it does, the
  local state is stale — auto-refresh will correct it.
- Do NOT optimistically mark the prize as claimed before the response.
  Authoritative state comes from the SDK's auto-refresh.

**Visitor mode**: not supported.
