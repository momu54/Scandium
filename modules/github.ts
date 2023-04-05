/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { CreateCommand } from '../app.ts';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

CreateCommand<ChatInputCommandInteraction>({
	name: 'github',
	description: 'Github command',
	options: [
		{
			name: 'auth',
			description: 'Login to github',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'repo',
			description: 'Github repository',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'list',
					description: 'List repositories',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'search',
					description: 'Search repositories',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'query',
							description: 'Search query',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
					],
				},
			],
		},
	],
});
