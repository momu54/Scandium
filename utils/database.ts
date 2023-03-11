/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { AnimesFromTodo, AnimesType, StringObject, TodoAnime } from '../typing.ts';
import SQL from 'sql-template-strings';

export const database = await open({
	filename: './data.db',
	driver: sqlite3.Database,
});

export async function GetConfig<ConfigType extends number | string>(
	user: string,
	module: string,
	key: string
) {
	const dbres = await database.get<StringObject<ConfigType>>(
		`SELECT ${module}_${key} FROM config WHERE user = $user`,
		{
			$user: user,
		}
	);

	return dbres![`${module}_${key}`];
}

export function SetConfig(
	user: string,
	module: string,
	key: string,
	value: number | string | boolean
) {
	return database.run(`UPDATE config SET ${module}_${key}=$value WHERE user = $user`, {
		$value: value,
		$user: user,
	});
}

export function AddConfigUser(user: string) {
	return database.run(SQL`INSERT INTO config(user) VALUES (${user})`);
}

export async function CheckUser(user: string) {
	return !!(await database.get(SQL`SELECT user FROM config WHERE user = ${user}`));
}

export function GetConfigs(user: string) {
	return database.get<StringObject<number | string>>(
		SQL`SELECT * FROM config WHERE user = ${user}`
	)!;
}

export async function GetColor(user: string) {
	return parseInt(
		(await GetConfig<string>(user, 'global', 'color')).replace('#', ''),
		16
	);
}

export async function GetAnimeTodoList(user: string): Promise<AnimesFromTodo> {
	const animes = await database.all<TodoAnime[]>(
		SQL`SELECT * FROM AnimeTodo WHERE user = ${user}`
	);

	return animes.map((anime) => {
		const { sn, name, episode } = anime;

		return {
			name,
			url: `https://ani.gamer.com.tw/animeVideo.php?sn=${sn}`,
			agelimit: false,
			episode,
			type: AnimesType.Todo,
		};
	});
}

export function AddAnimeTodo(user: string, name: string, sn: string, episode: string) {
	return database.run(
		SQL`INSERT INTO AnimeTodo(user, name, sn, episode) VALUES (${user}, ${name}, ${sn}, ${episode})`
	);
}

export function RemoveAnimeTodo(user: string, sn: string) {
	return database.run(SQL`DELETE FROM AnimeTodo WHERE user = ${user} AND sn = ${sn}`);
}

export async function CheckAnimeTodo(user: string, sn: string) {
	return !!(await database.get(
		SQL`SELECT * FROM AnimeTodo WHERE user = ${user} AND sn = ${sn}`
	));
}

export function ClearAnimeTodo(user: string) {
	return database.run(SQL`DELETE FROM AnimeTodo WHERE user = ${user}`);
}

export async function GetGithubToken(user: string) {
	const dbres = await database.get<StringObject<string>>(
		SQL`SELECT token FROM GithubToken WHERE user = ${user}`
	);

	return dbres?.token;
}

export function SetGithubToken(user: string, token: string) {
	return database.run(
		SQL`INSERT INTO GithubToken(user, token, timestamp) VALUES (${user}, ${token}, ${new Date().toJSON()})`
	);
}

export function RemoveGithubToken(user: string) {
	return database.run(SQL`DELETE FROM GithubToken WHERE user = ${user}`);
}

export const ALLOWED_TYPES = {
	boolean: ['true', 'false'],
} as const;
