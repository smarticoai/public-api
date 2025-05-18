# Smartico API documentation

## Enumerations

- [JackpotContributionType](enums/JackpotContributionType.md)
- [JackpotType](enums/JackpotType.md)
- [LeaderBoardPeriodType](enums/LeaderBoardPeriodType.md)
- [SAWBuyInTypeName](enums/SAWBuyInTypeName.md)
- [SAWGameTypeName](enums/SAWGameTypeName.md)
- [MiniGamePrizeTypeName](enums/MiniGamePrizeTypeName.md)
- [SAWSpinErrorCode](enums/SAWSpinErrorCode.md)
- [AchievementAvailabilityStatus](enums/AchievementAvailabilityStatus.md)
- [RaffleDrawInstanceState](enums/RaffleDrawInstanceState.md)
- [RaffleDrawTypeExecution](enums/RaffleDrawTypeExecution.md)
- [BuyStoreItemErrorCode](enums/BuyStoreItemErrorCode.md)
- [TournamentRegistrationError](enums/TournamentRegistrationError.md)
- [TournamentRegistrationStatusName](enums/TournamentRegistrationStatusName.md)

## Interfaces

- [AchRelatedGame](interfaces/AchRelatedGame.md)
- [GetJackpotEligibleGamesRequest](interfaces/GetJackpotEligibleGamesRequest.md)
- [GetJackpotEligibleGamesResponse](interfaces/GetJackpotEligibleGamesResponse.md)
- [TGetJackpotEligibleGamesResponse](interfaces/TGetJackpotEligibleGamesResponse.md)
- [JackpotEligibleGame](interfaces/JackpotEligibleGame.md)
- [GetJackpotWinnersRequest](interfaces/GetJackpotWinnersRequest.md)
- [GetJackpotWinnersResponse](interfaces/GetJackpotWinnersResponse.md)
- [JackpotWinnerHistory](interfaces/JackpotWinnerHistory.md)
- [GetJackpotsPotsRequest](interfaces/GetJackpotsPotsRequest.md)
- [GetJackpotsPotsResponse](interfaces/GetJackpotsPotsResponse.md)
- [GetJackpotsRequest](interfaces/GetJackpotsRequest.md)
- [GetJackpotsResponse](interfaces/GetJackpotsResponse.md)
- [JackPotWinner](interfaces/JackPotWinner.md)
- [JackpotDetails](interfaces/JackpotDetails.md)
- [JackpotHtmlTemplate](interfaces/JackpotHtmlTemplate.md)
- [JackpotPot](interfaces/JackpotPot.md)
- [JackpotPublicMeta](interfaces/JackpotPublicMeta.md)
- [JackpotWinPush](interfaces/JackpotWinPush.md)
- [JackpotsOptinRequest](interfaces/JackpotsOptinRequest.md)
- [JackpotsOptinResponse](interfaces/JackpotsOptinResponse.md)
- [JackpotsOptoutRequest](interfaces/JackpotsOptoutRequest.md)
- [JackpotsOptoutResponse](interfaces/JackpotsOptoutResponse.md)
- [GetDrawRunRequest](interfaces/GetDrawRunRequest.md)
- [GetDrawRunResponse](interfaces/GetDrawRunResponse.md)
- [GetRaffleDrawRunsHistoryRequest](interfaces/GetRaffleDrawRunsHistoryRequest.md)
- [GetRaffleDrawRunsHistoryResponse](interfaces/GetRaffleDrawRunsHistoryResponse.md)
- [GetRafflesRequest](interfaces/GetRafflesRequest.md)
- [GetRafflesResponse](interfaces/GetRafflesResponse.md)
- [Raffle](interfaces/Raffle.md)
- [RaffleClaimPrizeRequest](interfaces/RaffleClaimPrizeRequest.md)
- [RaffleClaimPrizeResponse](interfaces/RaffleClaimPrizeResponse.md)
- [RaffleDraw](interfaces/RaffleDraw.md)
- [RaffleDrawRun](interfaces/RaffleDrawRun.md)
- [RafflePrize](interfaces/RafflePrize.md)
- [RafflePrizeWinner](interfaces/RafflePrizeWinner.md)
- [RaffleTicket](interfaces/RaffleTicket.md)
- [TMiniGamePrize](interfaces/TMiniGamePrize.md)
- [TMiniGamePlayResult](interfaces/TMiniGamePlayResult.md)
- [TMiniGamePlayBatchResult](interfaces/TMiniGamePlayBatchResult.md)
- [TMiniGameTemplate](interfaces/TMiniGameTemplate.md)
- [TUserProfile](interfaces/TUserProfile.md)
- [TLevel](interfaces/TLevel.md)
- [TTournament](interfaces/TTournament.md)
- [TTournamentDetailed](interfaces/TTournamentDetailed.md)
- [TStoreCategory](interfaces/TStoreCategory.md)
- [TStoreItem](interfaces/TStoreItem.md)
- [TAchCategory](interfaces/TAchCategory.md)
- [TMissionOrBadge](interfaces/TMissionOrBadge.md)
- [AchRelatedGame](interfaces/AchRelatedGame-1.md)
- [TMissionOrBadgeTask](interfaces/TMissionOrBadgeTask.md)
- [TMissionOptInResult](interfaces/TMissionOptInResult.md)
- [TMissionClaimRewardResult](interfaces/TMissionClaimRewardResult.md)
- [TTournamentRegistrationResult](interfaces/TTournamentRegistrationResult.md)
- [TBuyStoreItemResult](interfaces/TBuyStoreItemResult.md)
- [TGetTranslations](interfaces/TGetTranslations.md)
- [TInboxMessage](interfaces/TInboxMessage.md)
- [TInboxMessageBody](interfaces/TInboxMessageBody.md)
- [InboxMarkMessageAction](interfaces/InboxMarkMessageAction.md)
- [LeaderBoardDetailsT](interfaces/LeaderBoardDetailsT.md)
- [LeaderBoardsRewardsT](interfaces/LeaderBoardsRewardsT.md)
- [LeaderBoardUserT](interfaces/LeaderBoardUserT.md)
- [UserLevelExtraCountersT](interfaces/UserLevelExtraCountersT.md)
- [TSegmentCheckResult](interfaces/TSegmentCheckResult.md)
- [TUICustomSection](interfaces/TUICustomSection.md)
- [TBonus](interfaces/TBonus.md)
- [TClaimBonusResult](interfaces/TClaimBonusResult.md)
- [TSawHistory](interfaces/TSawHistory.md)
- [TRaffle](interfaces/TRaffle.md)
- [TRaffleTicket](interfaces/TRaffleTicket.md)
- [TRafflePrize](interfaces/TRafflePrize.md)
- [TRafflePrizeWinner](interfaces/TRafflePrizeWinner.md)
- [TRaffleDraw](interfaces/TRaffleDraw.md)
- [TRaffleDrawRun](interfaces/TRaffleDrawRun.md)
- [TransformedRaffleClaimPrizeResponse](interfaces/TransformedRaffleClaimPrizeResponse.md)

## General API

- [WSAPI](classes/WSAPI.md)

## Type Aliases

### TournamentRegistrationTypeName

Ƭ **TournamentRegistrationTypeName**: ``"AUTO"`` \| ``"OPT_IN"`` \| ``"BUY_IN_POINTS"`` \| ``"MANUAL_APPROVAL"`` \| ``"REQUIRES_QUALIFICATION"`` \| ``"BUY_IN_GEMS"`` \| ``"BUY_IN_DIAMONDS"`` \| ``"UNKNOWN"``

## Functions

### drawRunTransform

▸ **drawRunTransform**(`res`): [`TRaffleDraw`](interfaces/TRaffleDraw.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`GetDrawRunResponse`](interfaces/GetDrawRunResponse.md) |

#### Returns

[`TRaffleDraw`](interfaces/TRaffleDraw.md)

___

### drawRunHistoryTransform

▸ **drawRunHistoryTransform**(`res`): [`TRaffleDrawRun`](interfaces/TRaffleDrawRun.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`GetRaffleDrawRunsHistoryResponse`](interfaces/GetRaffleDrawRunsHistoryResponse.md) |

#### Returns

[`TRaffleDrawRun`](interfaces/TRaffleDrawRun.md)[]

___

### ticketsTransform

▸ **ticketsTransform**(`items`): [`TRaffleTicket`](interfaces/TRaffleTicket.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`RaffleTicket`](interfaces/RaffleTicket.md)[] |

#### Returns

[`TRaffleTicket`](interfaces/TRaffleTicket.md)[]

___

### winnersTransform

▸ **winnersTransform**(`items`): [`TRafflePrizeWinner`](interfaces/TRafflePrizeWinner.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`RafflePrizeWinner`](interfaces/RafflePrizeWinner.md)[] |

#### Returns

[`TRafflePrizeWinner`](interfaces/TRafflePrizeWinner.md)[]

___

### prizeTransform

▸ **prizeTransform**(`items`): [`TRafflePrize`](interfaces/TRafflePrize.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`RafflePrize`](interfaces/RafflePrize.md)[] |

#### Returns

[`TRafflePrize`](interfaces/TRafflePrize.md)[]

___

### drawTransform

▸ **drawTransform**(`items`): [`TRaffleDraw`](interfaces/TRaffleDraw.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`RaffleDraw`](interfaces/RaffleDraw.md)[] |

#### Returns

[`TRaffleDraw`](interfaces/TRaffleDraw.md)[]

___

### raffleTransform

▸ **raffleTransform**(`items`): [`TRaffle`](interfaces/TRaffle.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`Raffle`](interfaces/Raffle.md)[] |

#### Returns

[`TRaffle`](interfaces/TRaffle.md)[]

___

### raffleClaimPrizeResponseTransform

▸ **raffleClaimPrizeResponseTransform**(`info`): [`TransformedRaffleClaimPrizeResponse`](interfaces/TransformedRaffleClaimPrizeResponse.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`RaffleClaimPrizeResponse`](interfaces/RaffleClaimPrizeResponse.md) |

#### Returns

[`TransformedRaffleClaimPrizeResponse`](interfaces/TransformedRaffleClaimPrizeResponse.md)
