export const AsyncFunction = async function () {}.constructor as (
	...args: string[]
) => () => Promise<any>;
