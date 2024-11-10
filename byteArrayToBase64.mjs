const { Object } = globalThis;

//----------------------------------------------------------------------------------------------------------------------

/**
 * Character sets used for Base64 encoding.
 *
 * **`base64`**:
 * RFC 4648, Default. Contains 64 ASCII characters in order/range:
 *  - letters uppercase `65-90`
 *  - letters lowercase `97-122`
 *  - digits `48-57`
 *  - plus `43`
 *  - slash `47`
 *
 * **`base64Url`**:
 * URL-safe variant of Base64: replaces
 *  - `+` with `-`
 *  - `/` with `_`.
 *
 * @type {{
 *   base64Url: string;
 *   base64: string;
 * }}
 */
const charsets = {};
{
	const ascii_AzDigits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	// see: Uint8Array/toBase64
	Object.defineProperties(charsets, {
		base64url: {
			value: ascii_AzDigits + '-_'
		},
		base64: {
			value: ascii_AzDigits + '+/'
		}
	});
}

/**
 * Encodes a byte array into a Base64 string.
 *
 * @param {Uint8Array} input
 * The byte array to encode.
 *
 * @param {{ alphabet?: 'base64' | 'base64url'; omitPadding?: boolean }} [options]
 * Optional encoding options:
 *  - `alphabet`: The character set to use. Default: 'base64'.
 *  - `omitPadding`: Whether to omit padding characters ('='). Default: false.
 *
 * @returns {string}
 * The Base64-encoded string.
 *
 * @note
 * decimal 63 - hex 0x3F - masks 6 bits: 0b111111
 */
// prettier-ignore
export const byteArrayToBase64 = (input, options) => {
	options ||= {};
	if (options.checkInputType) {
		const inputTag = input && Object.prototype.toString.call(input), uint8Tag = '[object Uint8Array]';
		if (inputTag !== uint8Tag) {
			throw new TypeError(`expected “${uint8Tag}”, got “${inputTag}”`);
		}
	}
	const m = [];
	if (input) {
		const len = input.length;
		if (len) {
			const n = len % 3, trip = n ? len - n : len, chars = charsets[options.alphabet || 'base64'];
			let i = 0;
			while (i < trip) {
				const e = (input[i] << 16) | (input[++i] << 8) | input[++i];
				m.push(
					chars[(e >> 18) & 63],
					chars[(e >> 12) & 63],
					chars[(e >> 6) & 63],
					chars[e & 63]
				);
				++i;
			}
			if (n) {
				const pad = options.omitPadding ? '' : '=', doublePad = pad && pad + pad;
				if (1 === n) {
					const e = input[trip];
					m.push(chars[e >> 2], chars[(e << 4) & 63], doublePad);
				} else if (2 === n) {
					const e = (input[trip] << 8) | input[trip + 1];
					m.push(
						chars[e >> 10],
						chars[(e >> 4) & 63],
						chars[(e << 2) & 63],
						pad
					);
				}
			}
		}
	}
	return m.join('');
};
