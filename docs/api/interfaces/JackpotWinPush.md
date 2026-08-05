# Interface: JackpotWinPush

Live jackpot-win notification. Delivered both to the winner and to other players
taking part in the same jackpot — use `winners[].is_me` to tell the two apart;
the copy sent to other players has its `public_username` masked.

Surfaced to consumers through the `jackpot_win` callback
(`_smartico.on('jackpot_win', …)`).

The explosion time is `jackpot.pot.explode_date_ts` (epoch milliseconds).

## Extends

- `ProtocolMessage`

## Properties

### cid

> **cid**: `number`

#### Inherited from

`ProtocolMessage.cid`

***

### ts?

> `optional` **ts?**: `number`

#### Inherited from

`ProtocolMessage.ts`

***

### uuid?

> `optional` **uuid?**: `string`

#### Inherited from

`ProtocolMessage.uuid`

***

### jackpot

> **jackpot**: [`JackpotDetails`](JackpotDetails.md)

The jackpot that exploded, including its live `pot` snapshot

***

### winners

> **winners**: [`JackPotWinPushWinner`](JackPotWinPushWinner.md)[]

Winner entries; currently always a single entry
