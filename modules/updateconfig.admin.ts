import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { CreateCommand, SetConfig, config } from '../app.js';
import { SetDefault } from '../utils/defaultconfig.js';
import _ from 'lodash';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'updateconfig',
		description: "Add new value to all user's settings",
	},
	true,
	async (interaction) => {
		for (const user in config) {
			const oldconfig = _.cloneDeep(config[user]);
			SetDefault(user);
			const newuserconfig = config[user];
			for (const module in newuserconfig) {
				if (oldconfig[module]) {
					const newmoduleconfig = newuserconfig[module];
					for (const key in newmoduleconfig) {
						if (oldconfig[module][key]) {
							SetConfig(user, module, key, oldconfig[module][key]);
						}
					}
				}
			}
		}

		const embed: APIEmbed = {
			title: 'updateconfig',
			description: 'done!',
		};

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
);
