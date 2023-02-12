/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { setTimeout } from 'timers/promises';

export class CacheStorer<CacheType> {
	constructor(alivetime: number) {
		this.alivetime = alivetime;
	}

	private async StartTimer() {
		await setTimeout(this.alivetime);
		this.alive = false;
		delete this.data;
	}

	private alivetime: number;
	data?: CacheType;
	alive: boolean = false;

	public Update(data: CacheType) {
		this.data = data;
		this.alive = true;
		this.StartTimer();
	}
}
