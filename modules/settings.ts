/*
                       _oo0oo_
                      o8888888o
                      88" . "88
                      (| -_- |)
                      0\  =  /0
                    ___/`---'\___
                  .' \\|     | '.
                 / \\|||  :  ||| \
                / _||||| -:- |||||- \
               |   | \\\  -  / |   |
               | \_|  ''\---/''  |_/ |
               \  .-\__  '-'  ___/-. /
             ___'. .'  /--.--\  `. .'___
          ."" '<  `.___\_<|>_/___.' >' "".
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
         \  \ `_.   \_ __\ /__ _/   .-` /  /
     =====`-.____`.___ \_____/___.-`___.-'=====
                       `=---='


     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

               佛主保佑         永無BUG
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
import { CreateCommand, CreateComponentHandler, CreateModalHandler } from '../app.js';
import { GetColor, GetConfigs, SetConfig } from '../utils/database.js';
import { Translate } from '../utils/translate.js';
import { StringObject } from '../typing.js';

const allowedvalue: StringObject<StringObject<string[]>> = {
	SaveAllImage: {
		convert: ['0', '1'],
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
		};
		let options: StringSelectMenuOptionBuilder[] = [];
		for (const module of modules) {
			const thismodulekeys = keys.filter((key) => key.includes(module));
			const value = thismodulekeys
				.map(
					(key) =>
						`${Translate(
							interaction.locale,
							`${module}.settings.${key.split('_')[1]}`,
						)}**:** ${userconfig![key]}`,
				)
				.join('\n');
			embed.fields?.push({
				name: Translate(interaction.locale, `${module}.title`),
				value: value,
			});
			options.push(
				new StringSelectMenuOptionBuilder()
					.setLabel(Translate(interaction.locale, `${module}.title`))
					.setValue(module),
			);
		}

		const menu = new StringSelectMenuBuilder()
			.setPlaceholder(Translate(interaction.locale, 'settings.menu'))
			.setCustomId(
				JSON.stringify({
					module: interaction.commandName,
					action: 'keys',
				}),
			)
			.addOptions(options);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
		await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });
	},
);

CreateComponentHandler<StringSelectMenuInteraction>(
	'settings',
	async (interaction, _, data) => {
		switch (data?.action) {
			case 'keys':
				const module = interaction.values[0];
				const { userconfig, keys } = await GetParsedConfigs(interaction.user.id);

				const thismodulekeys = keys.filter((key) => key.includes(module));
				const value = thismodulekeys
					.map(
						(key) =>
							`${Translate(
								interaction.locale,
								`${module}.settings.${key.split('_')[1]}`,
							)}**:** ${userconfig![key]}`,
					)
					.join('\n');

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
				};

				const options = thismodulekeys.map((key) => {
					const keyinmodule = key.split('_')[1];
					return new StringSelectMenuOptionBuilder()
						.setLabel(
							Translate(
								interaction.locale,
								`${module}.settings.${keyinmodule}`,
							),
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
							}),
						)
						.addOptions(options),
				);

				await interaction.update({ embeds: [embed], components: [row] });
				break;

			case 'set':
				const key = interaction.values[0];
				const modal = new ModalBuilder()
					.setTitle('Settings')
					.setCustomId(
						JSON.stringify({
							module: 'settings',
							settingmodule: data.settingmodule,
							key,
						}),
					)
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(
									`${Translate(
										interaction.locale,
										`${data.settingmodule}.title`,
									)} => ${Translate(
										interaction.locale,
										`${data.settingmodule}.settings.${key}`,
									)}`,
								)
								.setCustomId(
									JSON.stringify({
										module: 'settings',
									}),
								)
								.setStyle(TextInputStyle.Short)
								.setRequired(true),
						),
					);

				await interaction.showModal(modal);
				break;
		}
	},
);

async function GetParsedConfigs(user: string) {
	const userconfig = await GetConfigs(user);
	const keys = Object.keys(userconfig!).filter((key) => key != 'user');
	const modules = [...new Set(keys.map((key) => key.split('_')[0]))];
	return {
		userconfig,
		keys,
		modules,
	};
}

CreateModalHandler<ModalMessageModalSubmitInteraction>(
	'settings',
	async (interaction, _, data) => {
		const value = interaction.fields.getTextInputValue(
			JSON.stringify({
				module: 'settings',
			}),
		);
		if (data!.settingmodule == 'global' && data!.key == 'color') {
			if (!CheckColor(value)) return;
		}
		if (allowedvalue[data!.settingmodule]?.[data!.key]) {
			if (!allowedvalue[data!.settingmodule][data!.key].includes(value)) {
				return;
			}
		}

		await SetConfig(interaction.user.id, data!.settingmodule, data!.key, value);

		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'settings.title'),
			description: Translate(interaction.locale, 'settings.desc'),
			fields: [
				{
					name: Translate(interaction.locale, `${data!.settingmodule}.title`),
					value: `${data!.key}**:** ${value}`,
				},
			],
			color: await GetColor(interaction.user.id),
		};

		await interaction.update({ embeds: [embed], components: [] });
	},
);

function CheckColor(color: string) {
	return color.startsWith('#') && !isNaN(parseInt(color.replace('#', ''), 16));
}
