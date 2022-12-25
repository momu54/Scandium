import {
	createBot,
	startBot,
	CreateApplicationCommand,
	InteractionTypes,
	InteractionResponseTypes,
	Embed,
} from 'https://deno.land/x/discordeno@17.0.1/mod.ts';
import config from './config.json' assert { type: 'json' };
import { CommandCallback, Commands } from './typing.ts';
import './src/index.ts';
import { Translate } from './src/translate.ts';

const bot = createBot({
	token: config.token,
});

const commands: Commands = {};

bot.events.ready = (_bot, event) => {
	console.log('Ready!');
	console.log(`Logined with ${event.user.username} (${event.user.id})`);
};

bot.events.debug = console.log;

bot.events.interactionCreate = async (bot, interaction) => {
	if (interaction.type == InteractionTypes.ApplicationCommand) {
		console.log(`[info] command executed(${interaction.data?.name})`);
		await commands[interaction.data!.name](bot, interaction, {
			send: async (response) =>
				await bot.helpers.sendInteractionResponse(
					interaction.id,
					interaction.token,
					{
						type: InteractionResponseTypes.ChannelMessageWithSource,
						data: response,
					}
				),
			edit: async (response) =>
				await bot.helpers.editOriginalInteractionResponse(
					interaction.token,
					response
				),
			defer: async () => {
				const embed: Embed = {
					title: Translate(interaction, 'processing.title'),
					description: Translate(interaction, 'processing.desc'),
				};

				await bot.helpers.sendInteractionResponse(
					interaction.id,
					interaction.token,
					{
						type: InteractionResponseTypes.ChannelMessageWithSource,
						data: {
							embeds: [embed],
						},
					}
				);
			},
		});
	}
};

export async function CreateCommand(
	command: CreateApplicationCommand,
	callback: CommandCallback
) {
	await bot.helpers.createGlobalApplicationCommand(command);
	commands[command.name] = callback;
}

await startBot(bot);
