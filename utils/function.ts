/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

export const AsyncFunction = async function () {}.constructor as (
	...args: string[]
) => () => Promise<any>;
