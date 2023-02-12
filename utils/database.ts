/*
    Copyleft 2022~2023
    Licensed under AGPL 3.0 License
    
    * https://github.com/momu54/me/
*/

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { StringObject } from '../typing.js';
import SQL from 'sql-template-strings';

const config = await open({
	filename: './data/config.db',
	driver: sqlite3.Database,
});

export async function GetConfig<ConfigType extends number | string>(
	user: string,
	module: string,
	key: string,
) {
	const dbres = await config.get<StringObject<ConfigType>>(
		`SELECT ${module}_${key} FROM config WHERE user = $user`,
		{
			$user: user,
		},
	);

	return dbres![`${module}_${key}`];
}

export function SetConfig(
	user: string,
	module: string,
	key: string,
	value: number | string | boolean,
) {
	return config.run(`UPDATE config SET ${module}_${key}=$value WHERE user = $user`, {
		$value: value,
		$user: user,
	});
}

export function AddUser(user: string) {
	return config.run(SQL`INSERT INTO config(user) VALUES (${user})`);
}

export async function CheckUser(user: string) {
	return !!(await config.get(SQL`SELECT user FROM config WHERE user = ${user}`));
}

export async function GetConfigs(user: string) {
	return config.get<StringObject<number | string>>(
		SQL`SELECT * FROM config WHERE user = ${user}`,
	)!;
}

export async function GetColor(user: string) {
	return parseInt(
		(await GetConfig<string>(user, 'global', 'color')).replace('#', ''),
		16,
	);
}

export const allowedtype = {
	boolean: ['true', 'false'],
} as const;
