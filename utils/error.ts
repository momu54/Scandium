import {
	APIEmbed,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Interaction,
	InteractionType,
	codeBlock,
} from 'discord.js';
import { Translate } from './translate.ts';
import { GetColor } from './database.ts';
import { ERROR_EMOJI_STRING, QUESTION_EMOJI } from './emoji.ts';

export async function ErrorHandler(interaction: Interaction, error: Error) {
	console.error(error);
	if (interaction.type == InteractionType.ApplicationCommandAutocomplete) return;
	const embed: APIEmbed = {
		title: `${ERROR_EMOJI_STRING} ${Translate(interaction.locale, 'error.title')}`,
		fields: [
			{
				name: Translate(interaction.locale, 'error.stack.name'),
				value: codeBlock('ts', (error as Error).stack!),
			},
			{
				name: Translate(interaction.locale, 'error.report.name'),
				value: Translate(interaction.locale, 'error.report.value'),
			},
		],
		color: await GetColor(interaction.user.id),
	};

	const ErrorPos = (error as Error).stack
		?.split('\n')
		.find((line) => line.includes('me/modules/') || line.includes('me/utils/'))
		?.split('me/')
		?.at(-1)
		?.split(':');
	const rows: ActionRowBuilder<ButtonBuilder>[] = [];
	if (ErrorPos) {
		rows.push(
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel(Translate(interaction.locale, 'error.PossibleLocation'))
					.setEmoji(QUESTION_EMOJI)
					.setStyle(ButtonStyle.Link)
					.setURL(
						`https://github.com/momu54/me/blob/main/${ErrorPos[0]}#L${ErrorPos[1]}`
					)
			)
		);
	}

	if (interaction.replied) {
		await interaction.editReply({
			embeds: [embed],
			components: rows,
			content: '',
		});
	} else {
		await interaction.reply({ embeds: [embed], components: rows });
	}
}
