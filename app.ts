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
import { CheckUser, AddUser } from './utils/database.js';
import {
	Client,
	Events,
	InteractionType,
	APIEmbed,
	ApplicationCommandData,
	ApplicationCommandType,
	Partials,
	IntentsBitField,
	CommandInteraction,
} from 'discord.js';
import { AnyInteraction, CommandCallback, Commands } from './typing.js';
import { CommandLocalizations, Translate } from './utils/translate.js';
import { readdir } from 'fs/promises';
import 'dotenv/config';

export const client = new Client({
	intents: [IntentsBitField.Flags.Guilds],
	partials: [Partials.Channel],
});

const commands: Commands<AnyInteraction> = {};

client.on(Events.ClientReady, () => {
	console.log('[main/info] Ready!');
	console.log(`[main/info] Logined with ${client.user!.tag} (${client.user!.id})`);
});

client.on(Events.Debug, (debugmsg) => {
	if (debugmsg.includes('Clearing the heartbeat interval.')) {
		process.exit(0);
	}
	console.log(`[discord.js/info] ${debugmsg}`);
});

client.on(Events.Error, console.log);

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		if (!(await CheckUser(interaction.user.id))) await AddUser(interaction.user.id);
		console.log(`[main/info] command executed(${interaction.commandName})`);
		await commands[interaction.commandName].callback(interaction, async () => {
			const embed: APIEmbed = {
				title: Translate(interaction.locale, 'processing.title'),
				description: Translate(interaction.locale, 'processing.desc'),
			};

			await interaction.reply({ embeds: [embed], ephemeral: true });
		});
	}
});

export async function CreateCommand<InteractionType extends CommandInteraction>(
	command: ApplicationCommandData,
	callback: CommandCallback<InteractionType>,
	isadmincommand: boolean = false,
) {
	if (!isadmincommand) command.nameLocalizations ||= CommandLocalizations(command.name);
	await client.application?.commands.create(command, process.env.supportguild);
	commands[command.name] = {
		callback,
		type: command.type || ApplicationCommandType.ChatInput,
	};
}

async function LoadModules() {
	const files = await readdir('./modules/');

	for (const file of files) {
		if (!file.endsWith('.ts')) continue;
		await import(`./modules/${file}`);
		console.log(`[main/info] Success loading file ./modules/${file}`);
	}
}

LoadModules();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

await client.login(process.env.token);
