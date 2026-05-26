# UI Guide — `requestMissionOptIn`

## UI guidance
- Show a loading indicator (spinner, dots, button-disable) while the
  promise is pending; opt-in is a server round-trip and may take
  100–500ms under normal conditions.
- Disable the trigger element for the duration of the call to prevent
  double-clicks. The local `is_opted_in` flag won't flip until the
  `onUpdate` callback fires post-response.
- Treat `err_code === 0` and `err_code === 40010` identically in the
  UI: hide the opt-in button. Don't surface 40010 as an error.
- For `err_code === 40014` (locked), show the mission's
  `unlock_mission_description` instead of a generic error.
- Do NOT optimistically set `is_opted_in = true` before the response.
  Authoritative refresh comes from the SDK's `onUpdate` invocation,
  not from local state.
