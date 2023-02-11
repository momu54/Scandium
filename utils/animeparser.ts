import { JSDOM } from 'jsdom';
import { Anime, Animes } from '../typing.js';

export function ParseAnimes(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = [
		...doc.querySelectorAll<HTMLDivElement>('.newanime-date-area'),
	].slice(0, 50);
	const parsedanimes: Animes = animeblocks.map((animeblock) => {
		const name = animeblock.querySelector<HTMLParagraphElement>(
			'.anime-name > :first-child',
		)!.innerHTML;
		const thumbnail =
			animeblock.querySelector<HTMLImageElement>('.anime-blocker > img')!.dataset
				.src!;
		const url = animeblock.querySelector<HTMLLinkElement>('.anime-card-block')!.href;
		const agelimit = !!animeblock.querySelector<HTMLSpanElement>(
			'.anime-label-block > .color-R18',
		);
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

	const episodes = [...doc.querySelectorAll<HTMLLinkElement>('.season > ul a')];
	const rating = doc.querySelector<HTMLImageElement>('.rating > img')!.src;
	const [type, , staffs, agent, studio] = [
		...doc.querySelectorAll<HTMLLIElement>('.data_type > li'),
	].map((infomation) => infomation.innerHTML.split('</span>')[1].trim());
	const [director, supervisor] = staffs.split('、');
	const date = doc
		.querySelector<HTMLParagraphElement>('.anime_info_detail > p')!
		.textContent!.split('：')[1];
	const description = doc
		.querySelector<HTMLParagraphElement>('.data_intro > p')!
		.textContent!.trim()
		.split('\n')[0];
	const thumbnail = doc.querySelector<HTMLMetaElement>(
		'[property="og:image"]',
	)!.content;

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
		thumbnail,
	};
	return parsedanimes;
}

export function ParseSearchResults(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;

	const animeblocks = [
		...doc.querySelectorAll<HTMLLinkElement>('.theme-list-main'),
	].slice(0, 50);
	if (animeblocks.length == 0) return [];
	const parsedanimes: Animes = animeblocks.map((animeblock) => {
		const name =
			animeblock.querySelector<HTMLParagraphElement>('.theme-name')!.textContent!;
		const thumbnail =
			animeblock.querySelector<HTMLImageElement>('.theme-img')!.dataset.src!;
		const url = animeblock.href;
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
