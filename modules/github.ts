/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { ScandiumCommand } from '../utils/register.ts';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { OptionLocalizations, SubCommandLocalizations } from '../utils/translate.ts';

new ScandiumCommand<ChatInputCommandInteraction>({
	name: 'github',
	description: 'Github command',
	options: [
		{
			name: 'auth',
			description: 'Login to github',
			type: ApplicationCommandOptionType.Subcommand,
			nameLocalizations: SubCommandLocalizations('github', 'auth'),
		},
		{
			name: 'repo',
			description: 'Github repository',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'list',
					description: 'List your repositories',
					type: ApplicationCommandOptionType.Subcommand,
					nameLocalizations: SubCommandLocalizations('github', 'repo_list'),
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
							nameLocalizations: OptionLocalizations('github', 'query'),
						},
					],
					nameLocalizations: SubCommandLocalizations('github', 'repo_search'),
				},
				{
					name: 'starred',
					description: 'List starred repositories',
					type: ApplicationCommandOptionType.Subcommand,
					nameLocalizations: SubCommandLocalizations('github', 'repo_starred'),
				},
			],
			nameLocalizations: SubCommandLocalizations('github', 'repo'),
		},
	],
});
