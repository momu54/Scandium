import { JSDOM } from 'jsdom';

export function ParseAnime(html: string) {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = [...doc.querySelectorAll('.newanime-date-area')].filter(
		(_, index) => index < 50,
	);
	const parsedanimes = [];
	for (const animeblock of animeblocks) {
		const date = (animeblock.querySelector(
			'.anime-date-info',
		) as HTMLSpanElement)!.innerHTML
			.split('</svg>')[1]
			.split(' ')[0]
			.trim();
		const name = (
			animeblock.querySelector(
				'.anime-content-block > .anime-block > .anime-card-block > .anime-name-block > .anime-name > :first-child',
			) as HTMLParagraphElement
		).innerHTML;
		const thumbnail = (
			animeblock.querySelector(
				'.anime-content-block > .anime-block > .anime-card-block > .anime-pic-block > .anime-blocker > img',
			) as HTMLImageElement
		).dataset.src!;
		const url = (
			animeblock.querySelector(
				'.anime-content-block > .anime-block > .anime-card-block',
			) as HTMLLinkElement
		).href;
		parsedanimes.push({
			date,
			name,
			thumbnail,
			url,
		});
	}
	return parsedanimes;
}
