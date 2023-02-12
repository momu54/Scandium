/*
    Copyleft 2022~2023
    Licensed under AGPL 3.0 License
    
    * https://github.com/momu54/me/
*/

export const AsyncFunction = async function () {}.constructor as (
	...args: string[]
) => () => Promise<any>;
