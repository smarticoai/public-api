/* eslint-disable */
// Unit test of SAWHistoryTransform (src/MiniGames/SAWWinningHistoryResponse.ts) on the built package:
//
//   npm run build && node --test test/history-legacy-template.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const sdk = process.env.SDK_BUILD === 'cjs' ? createRequire(import.meta.url)('../dist/index.js') : await import('../dist/index.modern.mjs');
const { SAWHistoryTransform } = sdk;

const prize = { saw_prize_id: 7, saw_prize_ui_definition: { name: 'Gift' } };
const v2Row = { saw_template_id: 3, saw_prize_id: 7, saw_game_type_id: 8, saw_template_name: 'Advent', saw_template_thumbnail: 't.png', prize };

test('v2 row: v1-style reads still find the won prize and the game', () => {
	const [r] = SAWHistoryTransform([v2Row]);
	assert.equal(r.template.prizesMap, undefined);
	assert.equal(r.template.prizes.find((p) => p.saw_prize_id === r.saw_prize_id), prize);
	assert.equal(r.template.saw_template_ui_definition.name, 'Advent');
	assert.equal(r.template.saw_game_type_id, 8);
	assert.equal(r.prize, prize);
});

test('v2 row without a prize: empty lists, no crash', () => {
	const [r] = SAWHistoryTransform([{ ...v2Row, prize: null }]);
	assert.deepEqual(r.template.prizes, []);
});

test('v1 row: the server template is kept and fills the flat fields', () => {
	const template = { saw_template_id: 3, saw_game_type_id: 7, saw_template_ui_definition: { name: 'Box' }, prizes: [prize, { saw_prize_id: 8 }] };
	const [r] = SAWHistoryTransform([{ saw_template_id: 3, saw_prize_id: 7, template }]);
	assert.equal(r.template, template);
	assert.equal(r.prize, prize);
	assert.equal(r.saw_template_name, 'Box');
});
