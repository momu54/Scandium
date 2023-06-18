/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import { AnimesFromTodo, AnimesType, StringObject, TodoAnime } from '../typing.ts';
import { SQL } from 'sql-template-strings';

class ScandiumDatabase extends Database {
	constructor() {
		super({
			filename: './database/data.db',
			driver: sqlite3.Database,
		});

		super.open();
	}

	public async GetConfig<ConfigType extends number | string>(
		user: string,
		module: string,
		key: string
	) {
		const dbres = await super.get<StringObject<ConfigType>>(
			`SELECT ${module}_${key} FROM config WHERE user = $user`,
			{
				$user: user,
			}
		);

		return dbres![`${module}_${key}`];
	}

	public SetConfig(
		user: string,
		module: string,
		key: string,
		value: number | string | boolean
	) {
		return super.run(`UPDATE config SET ${module}_${key}=$value WHERE user = $user`, {
			$value: value,
			$user: user,
		});
	}

	public AddConfigUser(user: string) {
		return super.run(SQL`INSERT INTO config(user) VALUES (${user})`);
	}

	public async CheckUser(user: string) {
		return !!(await super.get(SQL`SELECT user FROM config WHERE user = ${user}`));
	}

	public GetConfigs(user: string) {
		return super.get<StringObject<number | string>>(
			SQL`SELECT * FROM config WHERE user = ${user}`
		)!;
	}

	public async GetColor(user: string) {
		return parseInt(
			(await this.GetConfig<string>(user, 'global', 'color')).replace('#', ''),
			16
		);
	}

	public async GetAnimeTodoList(user: string): Promise<AnimesFromTodo> {
		const animes = await super.all<TodoAnime[]>(
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

	public AddAnimeTodo(user: string, name: string, sn: string, episode: string) {
		return super.run(
			SQL`INSERT INTO AnimeTodo(user, name, sn, episode) VALUES (${user}, ${name}, ${sn}, ${episode})`
		);
	}

	public RemoveAnimeTodo(user: string, sn: string) {
		return super.run(SQL`DELETE FROM AnimeTodo WHERE user = ${user} AND sn = ${sn}`);
	}

	public async CheckAnimeTodo(user: string, sn: string) {
		return !!(await super.get(
			SQL`SELECT * FROM AnimeTodo WHERE user = ${user} AND sn = ${sn}`
		));
	}

	public ClearAnimeTodo(user: string) {
		return super.run(SQL`DELETE FROM AnimeTodo WHERE user = ${user}`);
	}

	public async GetGithubToken(user: string) {
		const dbres = await super.get<StringObject<string>>(
			SQL`SELECT token FROM GithubToken WHERE user = ${user}`
		);

		return dbres?.token;
	}

	public SetGithubToken(user: string, token: string) {
		return super.run(
			SQL`INSERT INTO GithubToken(user, token, timestamp) VALUES (${user}, ${token}, ${new Date().toJSON()})`
		);
	}

	public RemoveGithubToken(user: string) {
		return super.run(SQL`DELETE FROM GithubToken WHERE user = ${user}`);
	}
}

export const database = new ScandiumDatabase();

export const ALLOWED_TYPES = {
	boolean: ['true', 'false'],
} as const;
