/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import chalk from 'chalk';

export class Logger {
	constructor(module: string) {
		this.module = module;
	}

	public info(message: unknown, ...params: unknown[]) {
		console.log(`[${this.module}/info] ${message}`, ...params);
	}

	public warn(message: unknown, ...params: unknown[]) {
		console.log(chalk.yellow(`[${this.module}/warn] ${message}`), ...params);
	}

	public error(errormessage: string | Error, ...params: unknown[]) {
		if (typeof errormessage === 'string') {
			console.error(chalk.red(`[${this.module}/error] ${errormessage}`), ...params);
			return;
		}
		console.error(
			chalk.red(`[${this.module}/error] ${errormessage.stack}`),
			...params
		);
	}

	private module: string;
}
