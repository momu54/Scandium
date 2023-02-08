import { JSDOM } from 'jsdom';
import { Anime, Animes } from '../typing.js';

export function ParseAnimes(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = [...doc.querySelectorAll('.newanime-date-area')].filter(
		(_, index) => index < 50,
	);
	const parsedanimes: Animes = animeblocks.map((animeblock) => {
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
			name,
			thumbnail,
			url,
			agelimit,
		};
	});
	return parsedanimes;
}

export function ParseAnime(html: string): Anime {
	const { document: doc } = new JSDOM(html).window;

	const episodes = [...doc.querySelectorAll('.season > ul a')] as HTMLLinkElement[];
	const rating = (doc.querySelector('.rating > img') as HTMLImageElement).src
		.replace('gif', 'png')
		.replace('acg', 'anime');
	const [type, , staffs, agent, studio] = [
		...doc.querySelectorAll('.data_type > li'),
	].map((infomation) => infomation.innerHTML.split('</span>')[1].trim());
	const [director, supervisor] = staffs.split('、');
	const date = (
		doc.querySelector('.anime_info_detail > p') as HTMLParagraphElement
	).textContent!.split('：')[1];
	const description = (doc.querySelector('.data_intro > p') as HTMLParagraphElement)
		.textContent!.trim()
		.split('\n')[0];

	const parsedanimes: Anime = {
		episodes: episodes.map((episode) => episode.href.replace('?sn=', '')),
		rating,
		agent,
		studio,
		type,
		director,
		supervisor: supervisor || director,
		date,
		description,
	};
	return parsedanimes;
}

export function ParseSearchResults(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;

	const animeblocks = [...doc.querySelectorAll('.theme-list-main')].filter(
		(_, index) => index < 50,
	);
	if (animeblocks.length == 0) return [];
	const parsedanimes: Animes = animeblocks.map((animeblock) => {
		const name = (animeblock.querySelector('.theme-name') as HTMLParagraphElement)
			.textContent!;
		const thumbnail = (animeblock.querySelector('.theme-img') as HTMLImageElement)
			.dataset.src!;
		const url = (animeblock as HTMLLinkElement).href;
		const agelimit = !!animeblock.querySelector('.anime-label-block > .color-R18');
		return {
			name,
			thumbnail,
			url,
			agelimit,
		};
	});
	return parsedanimes;
}
