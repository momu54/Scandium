import {
	APIEmbed,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	codeBlock,
} from 'discord.js';
import { CreateCommand } from '../app.js';
import { AsyncExec } from '../utils/exec.js';
import { database } from '../utils/database.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'sql',
		description: 'Execute SQL query',
		options: [
			{
				name: 'execute',
				description: 'Execute SQL query',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'query',
						description: 'SQL query',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				name: 'dot',
				description: 'Execute dot command',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'command',
						description: 'dot command',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		],
	},
	async (interaction) => {
		switch (interaction.options.getSubcommand(true)) {
			case 'execute':
				await SQLQueryHandler(interaction);
				break;

			case 'dot':
				await SQLDotHandler(interaction);
				break;
		}
	},
	true,
);

async function SQLDotHandler(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const embed: APIEmbed = {
		title: 'SQL',
	};

	const output = await AsyncExec(
		`sqlite3 data.db "${interaction.options.getString('command', true)}"`,
	).catch((stderr) => {
		embed.color = 0xff0000;
		return stderr as string;
	});
	embed.color ||= 0x00ff00;
	embed.description = codeBlock(output);

	await interaction.editReply({ embeds: [embed] });
}

async function SQLQueryHandler(interaction: ChatInputCommandInteraction) {
	await database.run(interaction.options.getString('query', true));

	const embed: APIEmbed = {
		title: 'SQL',
		color: 0x00ff00,
		description: 'done!',
	};

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
