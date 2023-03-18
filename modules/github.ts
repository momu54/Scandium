/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { CreateCommand, CreateComponentHandler } from '../app.ts';
import {
	ApplicationCommandOptionType,
	ButtonInteraction,
	ChatInputCommandInteraction,
} from 'discord.js';
import { /* AuthHandler, */ LoginHandler, LogoutHandler } from './github.sm/auth.ts';
import { EMPTY_FUNCTION } from '../utils/function.ts';

CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'github',
		description: 'Github command',
		options: [
			{
				name: 'auth',
				description: 'Login to github',
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	},
	EMPTY_FUNCTION
);

CreateComponentHandler<ButtonInteraction>('github', async (interaction, defer, data) => {
	switch (data!.action) {
		case 'login':
			await LoginHandler(interaction);
			break;
		case 'logout':
			await LogoutHandler(interaction, defer);
			break;

		// No Default
	}
});
