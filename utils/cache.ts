import { setTimeout } from 'timers/promises';

export class CacheStorer<CacheType> {
	constructor(alivetime: number) {
		this.alivetime = alivetime;
		this.StartTimer();
	}

	private async StartTimer() {
		await setTimeout(this.alivetime);
		this.alive = false;
		delete this.data;
	}

	set data(data: CacheType | undefined) {
		this.cachedata = data;
	}

	get data() {
		return this.cachedata;
	}

	private alivetime: number;
	private cachedata?: CacheType;
	alive: boolean = false;

	public Update(data: CacheType) {
		this.cachedata = data;
		this.alive = true;
		this.StartTimer();
	}
}
