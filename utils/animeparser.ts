/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { JSDOM } from 'jsdom';
import { Anime, Animes, AnimesType } from '../typing.ts';

export function ParseAnimes(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;
	const animeblocks = [
		...doc.querySelectorAll<HTMLDivElement>('.newanime-date-area'),
	].slice(0, 50);
	const parsedanimes: Animes = animeblocks.map((animeblock) => {
		const name = animeblock.querySelector<HTMLParagraphElement>(
			'.anime-name > :first-child'
		)!.innerHTML;
		const url = animeblock.querySelector<HTMLLinkElement>('.anime-card-block')!.href;
		const agelimit = !!animeblock.querySelector<HTMLSpanElement>(
			'.anime-label-block > .color-R18'
		);
		return {
			name,
			url,
			agelimit,
			type: AnimesType.Normal,
		};
	});
	return parsedanimes;
}

export function ParseAnime(html: string): Anime {
	const { document: doc } = new JSDOM(html).window;

	const episodes = [...doc.querySelectorAll<HTMLLinkElement>('.season > ul a')];
	const rating = doc.querySelector<HTMLImageElement>('.rating > img')!.src;
	const [, staffs, agent, studio] = [
		...doc.querySelectorAll<HTMLParagraphElement>('.type-list .content'),
	].map((infomation) => infomation.innerHTML.trim());
	const [director, supervisor] = staffs.split('、');
	const type = [...doc.querySelectorAll('.type-list .tag')]
		.map((tag) => tag.innerHTML.trim())
		.join('\n');
	const date = doc
		.querySelector<HTMLParagraphElement>('.anime_info_detail > p')!
		.textContent!.split('：')[1];
	const description = doc
		.querySelector<HTMLParagraphElement>('.data-intro > p')!
		.textContent!.trim()
		.split('\n')[0];
	const thumbnail = doc
		.querySelector<HTMLScriptElement>('body > script:last-child')!
		.innerHTML.split("'")[1];
	const name = doc
		.querySelector<HTMLMetaElement>('.anime_name > h1')!
		.textContent!.replace(/\s\[[^\]]\]/, '');

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
		name,
	};
	return parsedanimes;
}

export function ParseSearchResults(html: string): Animes {
	const { document: doc } = new JSDOM(html).window;

	const animeblocks = [
		...doc.querySelectorAll<HTMLLinkElement>('.theme-list-main'),
	].slice(0, 50);
	if (animeblocks.length === 0) return [];
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
			type: AnimesType.Normal,
		};
	});
	return parsedanimes;
}
