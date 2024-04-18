
/**
 * @typedef {import('micromark-util-types').Code} Code
 * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Previous} Previous
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Construct} Construct
 */
import { codes } from 'micromark-util-symbol';

/** @type {Construct} */
export const LinkConstruct = {
    name: 'jwObsidianLink',
    tokenize: jwObsidianLinkTokenize,
    partial: true
};

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 */
export function jwObsidianLinkTokenize(effects, ok, nok) {
    let bracket_cnt = 0;
    return start;

    /** @type {State} */
    function start(code) {
        effects.enter('jwObsidian');
        effects.enter('jwObsidianLinkMarker');
        return LSB;
    }

    /** @type {State} */
    function LSB(code) {
        if (code === codes.leftSquareBracket) {
            bracket_cnt++;
            effects.consume(code);
        } else return nok(code);
        if (bracket_cnt == 2) {
            effects.exit('jwObsidianLinkMarker');
            effects.enter('jwObsidianLinkString');
            // effects.enter('chunkString', {contentType: 'string'});
            return inside;
        } else return LSB;
    }

    /** @type {State} */
    function inside(code) {
        if (code === -5 || code === -4 || code === -3 || code === null) {
            return nok(code);
        }
        if (code === 92) {
            effects.consume(code);
            return insideEscape;
        }

        /** @type {State} */
        function insideEscape(code) {
            if (code === 92 || code === 125) {
                effects.consume(code);
                return inside;
            }
            return inside(code);
        }
        if (code === 93) {
            // effects.exit('chunkString');
            effects.exit('jwObsidianLinkString');
            effects.enter('jwObsidianLinkMarker');
            return RSB;
        }
        effects.consume(code);
        return inside;
    }

    /** @type {State} */
    function RSB(code) {
        if (code === codes.rightSquareBracket) {
            bracket_cnt--;
            effects.consume(code);
        } else return nok(code);

        if (bracket_cnt == 0) {
            effects.exit('jwObsidianLinkMarker');
            effects.exit('jwObsidian');
            return ok(code);
        } else return RSB;
    }
}
