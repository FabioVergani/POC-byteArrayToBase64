import { byteArrayToBase64 } from './byteArrayToBase64.mjs';
import { uint8ArrayToBase64 } from './tc39.mjs';

describe('Base64 Encoding Tests', () => {
	const testBothFunctions = (arr, expected, options) => {
		expect(byteArrayToBase64(arr, options)).toBe(expected);
		expect(uint8ArrayToBase64(arr, options)).toBe(expected);
	};
	describe('Invalid Input Handling', () => {
		test.each([[null], [undefined], [123], ['string'], [{}], [[]]])(
			'should handle invalid input: %s',
			input => {
				const inputTag = input && Object.prototype.toString.call(input);
				expect(() => byteArrayToBase64(input)).not.toThrow();
				expect(() => byteArrayToBase64(input, { checkInputType: true })).toThrow(
					`expected “[object Uint8Array]”, got “${inputTag}”`
				);
				expect(() => uint8ArrayToBase64(input)).toThrow('not a Uint8Array');
			}
		);
	});
	describe('Empty Input', () => {
		test('should return an empty string for an empty array', () => {
			const arr = new Uint8Array([]);
			testBothFunctions(arr, '');
		});
	});
	describe('Byte Encodings', () => {
		test.each([
			[[0], 'AA=='],
			[[1], 'AQ=='],
			[[255], '/w==']
		])('should encode single byte %s correctly', (input, expected) => {
			testBothFunctions(new Uint8Array(input), expected);
		});
		test.each([
			[[0, 0], 'AAA='],
			[[255, 255], '//8='],
			[[65, 66], 'QUI=']
		])('should encode two bytes %s correctly', (input, expected) => {
			testBothFunctions(new Uint8Array(input), expected);
		});
		test.each([
			[[0, 0, 0], 'AAAA'],
			[[255, 255, 255], '////'],
			[[65, 66, 67], 'QUJD']
		])('should encode three bytes %s correctly', (input, expected) => {
			testBothFunctions(new Uint8Array(input), expected);
		});
	});
	describe('Longer Sequences', () => {
		test.each([
			[[65, 66, 67, 68, 69, 70], 'QUJDREVG'],
			[[255, 255, 255, 255, 255, 255], '////////']
		])('should encode sequences %s correctly', (input, expected) => {
			testBothFunctions(new Uint8Array(input), expected);
		});
	});
	describe('Padding Handling', () => {
		test.each([
			[[65], 'QQ'],
			[[65, 66], 'QUI'],
			[[255, 255], '//8']
		])('should handle omitPadding: true for %s', (input, expected) => {
			const arr = new Uint8Array(input);
			testBothFunctions(arr, expected, { omitPadding: true });
		});
	});
	describe('Base64 URL Encoding', () => {
		test.each([
			[[255, 255, 255], '____'],
			[[251, 239, 254], '--_-']
		])('should encode %s with base64url correctly', (input, expected) => {
			const arr = new Uint8Array(input);
			testBothFunctions(arr, expected, { alphabet: 'base64url' });
		});

		test.each([
			[[255, 255], '__8', { alphabet: 'base64url', omitPadding: true }],
			[[251, 239, 254], '--_-', { alphabet: 'base64url', omitPadding: true }]
		])('should handle combined options correctly for %s', (input, expected, options) => {
			testBothFunctions(new Uint8Array(input), expected, options);
		});
	});
	describe('Cross-Validation', () => {
		test.each([
			[[255, 255, 255, 255], '/////w=='],
			[[255, 240], '//A=']
		])('should produce identical results for %s', (input, expected) => {
			testBothFunctions(new Uint8Array(input), expected);
		});
	});
});
