/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import {
	APIEmbed,
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalBuilder,
	ModalMessageModalSubmitInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { CreateCommand, CreateComponentHandler, CreateModalHandler } from '../app.ts';
import { GetColor, GetConfigs, SetConfig, ALLOWED_TYPES } from '../utils/database.ts';
import { Translate } from '../utils/translate.ts';
import { StringObject } from '../typing.ts';

const ALLOWED_VALUE: Readonly<
	StringObject<StringObject<Readonly<string[]> | undefined>>
> = {
	SaveAllImage: {
		convert: ALLOWED_TYPES.boolean,
	},
	Screenshot: {
		format: ['png', 'jpeg', 'webp'],
	},
};

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'settings',
		description: 'Change the settings.',
	},
	async (interaction) => {
		const { userconfig, keys, modules } = await GetParsedConfigs(interaction.user.id);
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'settings.title'),
			description: Translate(interaction.locale, 'settings.desc'),
			fields: [],
			color: await GetColor(interaction.user.id),
			footer: {
				text: Translate(interaction.locale, 'settings.footer'),
			},
		};
		let options: StringSelectMenuOptionBuilder[] = [];
		for (const module of modules) {
			const thismodulekeys = keys.filter((key) => key.includes(module));
			const value = thismodulekeys
				.map((key) => {
					let value: string | number | boolean = userconfig![key];
					const valuekey = key.split('_')[1];
					const allowedlist = ALLOWED_VALUE[module]?.[valuekey];
					if (allowedlist?.includes('true') && allowedlist?.includes('false')) {
						value = userconfig![key] === 1;
					}
					return `${Translate(
						interaction.locale,
						`${module}.settings.${valuekey}`
					)}**:** ${value}`;
				})
				.join('\n');
			embed.fields?.push({
				name: Translate(interaction.locale, `${module}.title`),
				value: value,
			});
			options.push(
				new StringSelectMenuOptionBuilder()
					.setLabel(Translate(interaction.locale, `${module}.title`))
					.setValue(module)
			);
		}

		const menu = new StringSelectMenuBuilder()
			.setPlaceholder(Translate(interaction.locale, 'settings.menu'))
			.setCustomId(
				JSON.stringify({
					module: interaction.commandName,
					action: 'keys',
				})
			)
			.addOptions(options);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
		await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });
	}
);

CreateComponentHandler<StringSelectMenuInteraction>(
	'settings',
	async (interaction, _, componentdata) => {
		const module = interaction.values[0];
		const { userconfig, keys } = await GetParsedConfigs(interaction.user.id);
		const thismodulekeys = keys.filter((key) => key.includes(module));
		const value = thismodulekeys
			.map((key) => {
				let value: string | number | boolean = userconfig![key];
				const valuekey = key.split('_')[1];
				if (IsBooleanType({}, module, valuekey)) {
					value = userconfig![key] === 1;
				}
				return `${Translate(
					interaction.locale,
					`${module}.settings.${valuekey}`
				)}**:** ${value}`;
			})
			.join('\n');
		switch (componentdata.action) {
			case 'keys': {
				const embed: APIEmbed = {
					title: Translate(interaction.locale, 'settings.title'),
					description: Translate(interaction.locale, 'settings.desc'),
					fields: [
						{
							name: Translate(interaction.locale, `${module}.title`),
							value: value,
						},
					],
					color: await GetColor(interaction.user.id),
					footer: {
						text: Translate(interaction.locale, 'settings.footer'),
					},
				};

				const options = thismodulekeys.map((key) => {
					const keyinmodule = key.split('_')[1];
					return new StringSelectMenuOptionBuilder()
						.setLabel(
							Translate(
								interaction.locale,
								`${module}.settings.${keyinmodule}`
							)
						)
						.setValue(keyinmodule);
				});

				const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder(Translate(interaction.locale, 'settings.menu'))
						.setCustomId(
							JSON.stringify({
								module: 'settings',
								action: 'set',
								settingmodule: module,
							})
						)
						.addOptions(options)
				);

				await interaction.update({ embeds: [embed], components: [row] });
				break;
			}
			case 'set': {
				const key = interaction.values[0];

				const allowedlist = ALLOWED_VALUE[componentdata.settingmodule]?.[key];

				const modal = new ModalBuilder()
					.setTitle('Settings')
					.setCustomId(
						JSON.stringify({
							module: 'settings',
							settingmodule: componentdata.settingmodule,
							key,
						})
					)
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(
									`${Translate(
										interaction.locale,
										`${componentdata.settingmodule}.title`
									)} => ${Translate(
										interaction.locale,
										`${componentdata.settingmodule}.settings.${key}`
									)}${
										allowedlist ? ` (${allowedlist.join(', ')})` : ''
									}`
								)
								.setCustomId(
									JSON.stringify({
										module: 'settings',
									})
								)
								.setStyle(TextInputStyle.Short)
								.setRequired(true)
								.setValue(
									IsBooleanType(componentdata, undefined, key)
										? userconfig![
												`${componentdata.settingmodule}_${key}`
										  ] === 1
											? 'true'
											: 'false'
										: userconfig![
												`${componentdata.settingmodule}_${key}`
										  ].toString()
								)
						)
					);

				await interaction.showModal(modal);
				break;
			}
		}
	}
);

async function GetParsedConfigs(user: string) {
	const userconfig = await GetConfigs(user);
	const keys = Object.keys(userconfig!).filter((key) => key !== 'user');
	const modules = [...new Set(keys.map((key) => key.split('_')[0]))];
	return {
		userconfig,
		keys,
		modules,
	};
}

CreateModalHandler<ModalMessageModalSubmitInteraction>(
	'settings',
	async (interaction, _, componentdata) => {
		let value: string = interaction.fields.getTextInputValue(
			JSON.stringify({
				module: 'settings',
			})
		);
		if (componentdata.settingmodule === 'global' && componentdata.key === 'color') {
			if (!CheckColor(value)) return;
		}

		if (ALLOWED_VALUE[componentdata.settingmodule]?.[componentdata.key]) {
			if (
				!ALLOWED_VALUE[componentdata.settingmodule][componentdata.key]?.includes(
					value
				)
			) {
				return;
			}
		}

		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'settings.title'),
			description: Translate(interaction.locale, 'settings.desc'),
			fields: [
				{
					name: Translate(
						interaction.locale,
						`${componentdata.settingmodule}.title`
					),
					value: `${Translate(
						interaction.locale,
						`${componentdata.settingmodule}.settings.${componentdata.key}`
					)}**:** ${value}`,
				},
			],
			color: await GetColor(interaction.user.id),
			footer: {
				text: Translate(interaction.locale, 'settings.footer'),
			},
		};

		await SetConfig(
			interaction.user.id,
			componentdata.settingmodule,
			componentdata.key,
			IsBooleanType(componentdata) ? value === 'true' : value
		);

		await interaction.update({ embeds: [embed], components: [] });
	}
);

function CheckColor(color: string) {
	return (
		color.length === 7 &&
		color.startsWith('#') &&
		!isNaN(parseInt(color.replace('#', ''), 16))
	);
}

function IsBooleanType(
	componentdata: StringObject<string>,
	module?: string,
	key?: string
) {
	const dataALLOWED_VALUE =
		ALLOWED_VALUE[module ? module : componentdata.settingmodule]?.[
			key ? key : componentdata.key
		];
	return !!dataALLOWED_VALUE?.includes('true') && dataALLOWED_VALUE?.includes('false');
}
