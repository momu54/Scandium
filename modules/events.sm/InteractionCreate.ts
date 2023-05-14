/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	Events,
	APIEmbed,
	InteractionType,
	ApplicationCommandType,
	ComponentType,
	APIActionRowComponent,
	APIButtonComponent,
	APIButtonComponentWithCustomId,
} from 'discord.js';
import { client } from '../../app.ts';
import { StringObject } from '../../typing.ts';
import { database } from '../../utils/database.ts';
import { LOADING_EMOJI_STRING, LOADING_EMOJI } from '../../utils/emoji.ts';
import { ErrorHandler } from '../../utils/error.ts';
import {
	commands,
	componenthandlers,
	modalhandlers,
	subcommandhandlers,
} from '../../utils/register.ts';
import { Translate } from '../../utils/translate.ts';
import { Logger } from '../../utils/logger.ts';
const logger = new Logger('events:InteractionCreate');

client.on(Events.InteractionCreate, async (interaction) => {
	if (!(await database.CheckUser(interaction.user.id)))
		await database.AddConfigUser(interaction.user.id);
	const embed: APIEmbed = {
		title: `${LOADING_EMOJI_STRING} ${Translate(
			interaction.locale,
			'processing.title'
		)}`,
		description: Translate(interaction.locale, 'processing.desc'),
		color: await database.GetColor(interaction.user.id),
	};
	let data: StringObject<string>;

	try {
		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				logger.info(`Command executed(${interaction.commandName})`);
				const savedcommand = commands[interaction.commandName];
				if (
					savedcommand.isadmincommand &&
					interaction.user.id !== interaction.client.application.owner?.id
				) {
					const errembed: APIEmbed = {
						title: Translate(interaction.locale, 'error.title'),
						description: Translate(
							interaction.locale,
							'global.PremissionDenied'
						),
						color: await database.GetColor(interaction.user.id),
					};
					await interaction.reply({ embeds: [errembed], ephemeral: true });
					return;
				}
				if (
					interaction.commandType === ApplicationCommandType.ChatInput &&
					subcommandhandlers[interaction.commandName]
				) {
					const subcommandgroup = interaction.options.getSubcommandGroup(false);
					const subcommand = interaction.options.getSubcommand(false);
					if (subcommandgroup || subcommand) {
						const savedcommand =
							subcommandhandlers[interaction.commandName][
								subcommandgroup || subcommand!
							][subcommand || '$main'];
						await savedcommand.callback?.(
							interaction,
							async (ephemeral: boolean = true) => {
								await interaction.reply({ embeds: [embed], ephemeral });
							},
							null
						);
						return;
					}
				}
				await savedcommand.callback?.(
					interaction,
					async (ephemeral: boolean = true) => {
						await interaction.reply({ embeds: [embed], ephemeral });
					},
					null
				);
				break;
			}
			case InteractionType.MessageComponent: {
				data = JSON.parse(interaction.customId);
				logger.info(`Component emitted(${data.module})`);
				await componenthandlers[data.module].callback?.(
					interaction,
					async () => {
						if (interaction.componentType === ComponentType.Button) {
							const row: APIActionRowComponent<APIButtonComponent> = {
								components:
									interaction.message.components[0].components.map(
										(component) => ({
											...(component.data as APIButtonComponent),
										})
									),
								type: ComponentType.ActionRow,
							};
							const index = row.components.findIndex(
								(button) =>
									(button as APIButtonComponentWithCustomId)
										.custom_id === interaction.customId
							);
							const button = row.components[index];
							button.disabled = true;
							delete button.label;
							button.emoji = LOADING_EMOJI;

							await interaction.update({ components: [row] });
						} else {
							await interaction.update({ embeds: [embed], components: [] });
						}
					},
					data
				);
				break;
			}
			case InteractionType.ModalSubmit: {
				data = JSON.parse(interaction.customId);
				logger.info(`[main/info] Modal submitted(${data.module})`);
				await modalhandlers[data.module].callback?.(
					interaction,
					async () => {
						await interaction.reply({ embeds: [embed], components: [] });
					},
					data
				);
				break;
			}

			// No Default
		}
	} catch (error) {
		await ErrorHandler(interaction, error as Error);
	}
});
