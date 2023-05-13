/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

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
import { ERROR_EMOJI_STRING, QUESTION_EMOJI } from './emoji.ts';
import { captureException } from '@sentry/node';
import { Logger } from './logger.ts';
import { database } from './database.ts';
const logger = new Logger('error');

export async function ErrorHandler(interaction: Interaction, error: Error) {
	logger.error(error);
	const id = captureException(error);
	if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
	const stacklines = error.stack?.split('\n')!;
	let length = error.stack!.length;
	const stacklinesinmessage = error.stack!.split('\n');
	while (length > 1024) {
		length -= stacklinesinmessage.pop()?.length || -1 + 1;
	}
	const embed: APIEmbed = {
		title: `${ERROR_EMOJI_STRING} ${Translate(interaction.locale, 'error.title')}`,
		fields: [
			{
				name: Translate(interaction.locale, 'error.stack.name'),
				value: codeBlock('ts', stacklinesinmessage.join('\n')),
			},
			{
				name: Translate(interaction.locale, 'error.report.name'),
				value: Translate(interaction.locale, 'error.report.value'),
			},
			{
				name: Translate(interaction.locale, 'error.EventId.name'),
				value: codeBlock(id),
			},
		],
		color: await database.GetColor(interaction.user.id),
	};

	const ErrorPos = stacklines
		.find(
			(line) =>
				line.includes('Scandium/modules/') || line.includes('Scandium/utils/')
		)
		?.split('Scandium/')
		?.at(-1)
		?.split(':');
	const rows: ActionRowBuilder<ButtonBuilder>[] = [];
	if (ErrorPos && process.env.environment === 'production') {
		rows.push(
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel(Translate(interaction.locale, 'error.PossibleLocation'))
					.setEmoji(QUESTION_EMOJI)
					.setStyle(ButtonStyle.Link)
					.setURL(
						`https://github.com/momu54/Scandium/blob/main/${ErrorPos[0]}#L${ErrorPos[1]}`
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
