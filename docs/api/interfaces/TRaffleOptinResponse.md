# Interface: TRaffleOptinResponse

Result of `_smartico.api.requestRaffleOptin({raffle_id, draw_id, raffle_run_id})`.

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success. See `requestRaffleOptin` TSDoc for the full table.

***

### err\_message?

> `optional` **err\_message?**: `string`

Optional error message; populated on non-zero `err_code`.
