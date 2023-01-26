import { JSDOM } from 'jsdom';

export function ParseAnime(html: string) {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = doc.querySelectorAll('.newanime-date-area');
	// const parsedanims = []
	for (const animeblock of animeblocks) {
		(animeblock.querySelector('.anime-date-info') as HTMLDivElement).innerText;
	}
}
