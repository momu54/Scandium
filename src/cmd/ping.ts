import {
	ApplicationCommandFlags,
	Embed,
} from 'https://deno.land/x/discordeno@17.0.1/mod.ts';
import { CreateCommand } from '../../mod.ts';
import { Translate } from '../translate.ts';
import { snowflakeToTimestamp } from '../utils/index.ts';

await CreateCommand(
	{
		name: 'ping',
		description: 'Get bot ping',
	},
	async (_bot, interaction, reply) => {
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);
		const embed: Embed = {
			title: Translate(interaction, 'ping.title'),
			description: Translate(interaction, 'ping.desc', {
				ping: ping.toString(),
			}),
		};

		await reply.edit({
			embeds: [embed],
			flags: ApplicationCommandFlags.Ephemeral,
		});
	}
);
