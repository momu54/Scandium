import { JSDOM } from 'jsdom';
import { Anime, Animes } from '../typing.js';

export function ParseAnimes(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = [...doc.querySelectorAll('.newanime-date-area')].filter(
		(_, index) => index < 50,
	);
	const parsedanimes = animeblocks.map((animeblock) => {
		const date = (animeblock.querySelector(
			'.anime-date-info',
		) as HTMLSpanElement)!.innerHTML
			.split('</svg>')[1]
			.split(' ')[0]
			.trim();
		const name = (
			animeblock.querySelector('.anime-name > :first-child') as HTMLParagraphElement
		).innerHTML;
		const thumbnail = (
			animeblock.querySelector('.anime-blocker > img') as HTMLImageElement
		).dataset.src!;
		const url = (animeblock.querySelector('.anime-card-block') as HTMLLinkElement)
			.href;
		const agelimit = !!animeblock.querySelector('.anime-label-block > .color-R18');
		return {
			date,
			name,
			thumbnail,
			url,
			agelimit,
		};
	});
	return parsedanimes;
}

export function ParseAnime(html: string) {
	const { document: doc } = new JSDOM(html).window;

	const episodes = [...doc.querySelectorAll('.season > ul a')] as HTMLLinkElement[];
	const rating = (doc.querySelector('.rating > img') as HTMLImageElement).src;
	const [type, , staffs, agent, studio] = [
		...doc.querySelectorAll('.data_type > li'),
	].map((infomation) => infomation.innerHTML.split('</span>')[1].trim());
	const parsedanimes: Anime = {
		episodes: episodes.map((episode) => episode.href.replace('?sn=', '')),
		rating,
		staffs,
		agent,
		studio,
		type,
	};
	return parsedanimes;
}
