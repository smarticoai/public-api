# Interface: TMiniGamePlayResult

TMiniGamePlayResult describes the response of
`_smartico.api.playMiniGame(template_id)`.

## Properties

### err\_code

> **err\_code**: [`SAWSpinErrorCode`](../enumerations/SAWSpinErrorCode.md)

Error code. `0` = success ([SAWSpinErrorCode.SAW\_OK](../enumerations/SAWSpinErrorCode.md#saw_ok)).
See `playMiniGame` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional server-side error message. Present only on non-zero
`err_code`; may be empty even then.

***

### prize\_id

> **prize\_id**: `number`

ID of the won prize. Look up in `template.prizes` to interpret
(including `prize_type === 'no-prize'` for a configured loss
slot). Always populated, even when `err_code !== 0`.

***

### request\_id

> **request\_id**: `string`

Correlation id of this spin. Pass it to
`miniGameWinAcknowledgeRequest` to finalise the win when
playing with `acknowledge: false` — no need to look it up via
`getMiniGamesHistory`.
