# getTranslations — API (TGetTranslations)

> Returns the full set of operator-defined translation key/value pairs for the label, merged across the requested language and the English baseline.
> Import: `import { TGetTranslations } from '@smartico/public-api'`
> Search terms: getTranslations, general, TGetTranslations, translations

## Signature
```ts
_smartico.api.getTranslations(lang_code: string): Promise<TGetTranslations>
```

## Parameters
- `lang_code` — ISO language code (e.g. `"EN"`, `"FR"`). Defaults to `"EN"` server-side if empty.

## Returns — `Promise<TGetTranslations>`
- `translations` (object) — Flat dictionary of operator-defined translation key → translated string.

## Behavioral contract
**Preconditions**
- No prerequisite calls.
- `lang_code` is the ISO language code the operator uses in the BO
  (e.g. `"EN"`, `"FR"`, `"ES"`). Case is not normalised — match what the
  operator configured.

**EN fallback**
The SDK issues an English-baseline fetch first, then overlays the
`lang_code` translations on top. Any key the operator has only defined in
English (i.e. missing in the requested language) is returned with the
English value. Keys missing in both are absent from the map — the consumer
must handle missing keys (the default Smartico UI returns the key string
itself as the fallback text).

**What's included**
The SDK passes an empty `areas` filter to the server, which returns ALL
translation namespaces configured for the label (Gamification, Casino,
Trading, Affiliation, etc. — whichever are populated). For a Gamification-
only widget, the consumer can ignore unused namespaces — keys are flat
strings, not nested.

**Refresh**
- Cached internally per `(lang_code, label, brand)` for ~30 seconds.
- No push subscription. Operators editing translations in the BO will see
  the change after the cache window expires.

**Visitor mode**: supported. Translations are label-scoped, not user-
scoped — `lang_code` is the sole language selector and is independent of
the `vapi(lang)` argument used elsewhere.

## Example
```ts
const r = await window._smartico.api.getTranslations('FR');

// Defensive lookup: fall back to the key itself if the operator hasn't
// defined the string.
const t = (k: string) => r.translations[k] ?? k;

console.log('[smartico] localized label "missions_title" →', t('missions_title'));
```

### Example response (REAL shape)
```json
{
  "translations": {
    "transaction-type-20": "Casino bet",
    "cancel": "Cancel",
    "currency_symbol_EUR": "€",
    "transaction-type-21": "Casino win",
    "err_11000": "Not enough points to purchase this item.",
    "transaction-type-25": "Withdrawal Cancelled",
    "year": "Year",
    "transaction-type-22": "Comp points exchange",
    "transaction-type-23": "Pending withdrawal",
    "err_11004": "Failed to buy shop item because of item purchase condition",
    "transaction-type-26": "Withdrawal Declined",
    "err_11003": "Failed to buy store item because of item condition.",
    "currency_symbol_TRY": "₺",
    "err_11008": "You’ve reached the maximum number of bonuses allowed.",
    "err_11006": "You've reached the maximum number of items you can buy.",
    "sawAttemptsAvailableShort": "{value} attempts",
    "inbx_MarkAllReadHint": "Mark all messages as read",
    "totalPool": "total pool",
    "placesPaid": "Places paid",
    "sawSpinCostSpins": "{value} spins available",
    "…": "(+804 more keys)"
  }
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `TGetTranslations`
