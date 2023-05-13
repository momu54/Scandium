import { readdir } from 'fs/promises';
import { Logger } from './logger.ts';
const logger = new Logger('modules');

async function GetModulesPath(directory = 'modules') {
	const paths = (await readdir(directory)).map((path) => `${directory}/${path}`);

	const resultpaths: string[] = [];

	for (const path of paths) {
		if (path.endsWith('.sm')) {
			logger.info(`Finded submodule ${path}`);
			resultpaths.push(...(await GetModulesPath(path)));
			continue;
		}
		if (!path.endsWith('.ts')) {
			logger.warn(`${path} isn't typescript file, skipped`);
			continue;
		}
		logger.info(`Finded typescript file ${path}`);
		resultpaths.push(path);
	}

	return resultpaths;
}

async function LoadModules() {
	const paths = await GetModulesPath();
	const importtasks = paths.map(async (path) => {
		logger.info(`Start loading file ${path}`);
		await import(`../${path}`);
		logger.info(`Success loading file ${path}`);
	});

	await Promise.allSettled(importtasks);
}

LoadModules();
