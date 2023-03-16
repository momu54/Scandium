/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { CreateCommand, CreateComponentHandler } from '../app.ts';
import {
	ApplicationCommandOptionType,
	ButtonInteraction,
	ChatInputCommandInteraction,
} from 'discord.js';
import { AuthHandler, LoginHandler, LogoutHandler } from './github.sm/auth.ts';

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
	async (interaction, defer) => {
		const submodule =
			interaction.options.getSubcommandGroup() ||
			interaction.options.getSubcommand();
		switch (submodule) {
			case 'auth':
				await AuthHandler(interaction, defer);
				break;

			// No Default
		}
	}
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
