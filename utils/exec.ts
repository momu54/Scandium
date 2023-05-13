/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { exec } from 'child_process';

export function AsyncExec(command: string) {
	return new Promise<string>((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) reject(stderr);
			else resolve(stdout);
		});
	});
}
