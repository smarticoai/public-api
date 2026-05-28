# Interface: TTournamentRegistrationResult

Result of `_smartico.api.registerInTournament(tournament_id)`.

## Properties

### err\_code

> **err\_code**: [`TournamentRegistrationError`](../enumerations/TournamentRegistrationError.md)

Error code. `0` = success. See `registerInTournament` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
