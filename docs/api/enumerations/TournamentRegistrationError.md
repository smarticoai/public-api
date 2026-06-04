# Enumeration: TournamentRegistrationError

Error codes returned in `err_code` by the `registerInTournament` method.

These are terse value definitions for lookup. The full per-code narrative —
when each fires and how the consumer's UI should react — lives in the
`registerInTournament` method TSDoc, which owns the error table.

Note the numbering break: the gems / diamonds codes are 6-digit
(`300010` / `300011`) while the rest of the tournament block is 5-digit;
they were appended after the original `30001`–`30009` range was occupied.
Branch on the exact numeric value, not on digit count.

## Enumeration Members

### NO\_ERROR

> **NO\_ERROR**: `0`

Success — registration persisted; buy-in (if any) deducted.

***

### TOURNAMENT\_USER\_CANNOT\_JOIN\_WITHOUT\_CLAN

> **TOURNAMENT\_USER\_CANNOT\_JOIN\_WITHOUT\_CLAN**: `1010`

Clan-based tournament and the user does not belong to a clan yet.

***

### TOURNAMENT\_INSTANCE\_NOT\_FOUND

> **TOURNAMENT\_INSTANCE\_NOT\_FOUND**: `30001`

Instance id is invalid or the tournament was deleted.

***

### TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_POINTS

> **TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_POINTS**: `30002`

Insufficient points balance for a points-priced buy-in.

***

### TOURNAMENT\_INSTANCE\_NOT\_IN\_STATE

> **TOURNAMENT\_INSTANCE\_NOT\_IN\_STATE**: `30003`

Tournament is no longer in a registerable state (finished, cancelled, finalizing, or not yet open).

***

### TOURNAMENT\_ALREADY\_REGISTERED

> **TOURNAMENT\_ALREADY\_REGISTERED**: `30004`

User is already registered; treat as an idempotent success.

***

### TOURNAMENT\_USER\_DONT\_MATCH\_CONDITIONS

> **TOURNAMENT\_USER\_DONT\_MATCH\_CONDITIONS**: `30005`

User does not satisfy the tournament's segment / entry conditions.

***

### TOURNAMENT\_USER\_NOT\_REGISTERED

> **TOURNAMENT\_USER\_NOT\_REGISTERED**: `30006`

User is not registered; anomalous on a register call (usually a server-side race).

***

### TOURNAMENT\_CANT\_CHANGE\_REGISTRATION\_STATUS

> **TOURNAMENT\_CANT\_CHANGE\_REGISTRATION\_STATUS**: `30007`

Registration status transition is not allowed (e.g. re-registering a finished tournament).

***

### TOURNAMENT\_MAX\_REGISTRATIONS\_REACHED

> **TOURNAMENT\_MAX\_REGISTRATIONS\_REACHED**: `30008`

Tournament filled up — maximum registrations reached.

***

### TOURNAMENT\_INVALID\_USER\_CURRENCY

> **TOURNAMENT\_INVALID\_USER\_CURRENCY**: `30009`

The user's wallet currency could not be resolved. Emitted server-side
during tournament score processing, NOT during registration — it is
never returned by `registerInTournament`. Included for completeness.

***

### TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_GEMS

> **TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_GEMS**: `300010`

Insufficient gems balance for a gems-priced buy-in.

***

### TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_DIAMONDS

> **TOURNAMENT\_REGISTRATION\_NOT\_ENOUGH\_DIAMONDS**: `300011`

Insufficient diamonds balance for a diamonds-priced buy-in.
