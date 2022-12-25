import {
	ApplicationCommandTypes,
	UserToggle,
	Embed,
} from 'https://deno.land/x/discordeno@17.0.1/mod.ts';
import { CreateCommand } from '../../mod.ts';

// @deno-types="npm:@types/google-translate-api"
import translate from 'https://esm.sh/google-translate-api?deno-std=0.170.0';
import { TransformLangIso639_1 } from '../utils/index.ts';
import 'https://deno.land/std@0.170.0/node/global.ts';

await CreateCommand(
	{
		name: 'translate',
		type: ApplicationCommandTypes.Message,
		description: 'Translates the message.',
	},
	async (_bot, interaction, reply) => {
		const message = interaction.data?.resolved?.messages?.first()!;
		let embed: Embed;
		if (interaction.user.toggles.contains(UserToggle.bot)) {
			embed = {
				title: 'Error!',
				description: "Can't translate bot's message.",
			};
			await reply.send({ embeds: [embed] });
			return;
		}
		await reply.defer();
		const lang = TransformLangIso639_1(interaction.locale!);
		console.log(lang);
		const result = await translate(message.content, {
			to: lang,
		});
		embed = {
			title: 'Translate',
			description: result.text,
		};
		await reply.send({ embeds: [embed] });
	}
);
