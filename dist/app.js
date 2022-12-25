import { Client, Events, InteractionType, ApplicationCommandType, } from 'discord.js';
import config from './config.json' assert { type: 'json' };
import { Translate } from './translate.js';
import { readdir } from 'fs/promises';
export const client = new Client({
    intents: [],
});
const commands = {};
client.on(Events.ClientReady, () => {
    console.log('Ready!');
    console.log(`Logined with ${client.user.tag} (${client.user.id})`);
});
client.on(Events.Debug, (debugmsg) => {
    if (debugmsg.includes('Clearing the heartbeat interval.')) {
        process.exit(0);
    }
});
client.on(Events.Error, console.log);
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.type == InteractionType.ApplicationCommand) {
        console.log(`[info] command executed(${interaction.commandName})`);
        await commands[interaction.commandName].callback(interaction, async () => {
            const embed = {
                title: Translate(interaction, 'processing.title'),
                description: Translate(interaction, 'processing.desc'),
            };
            await interaction.reply({ embeds: [embed] });
        });
    }
});
export async function CreateCommand(command, callback) {
    await client.application?.commands.create(command);
    commands[command.name] = {
        callback,
        type: command.type || ApplicationCommandType.ChatInput,
    };
}
const files = await readdir('./dist/cmd/');
for (const file of files) {
    if (!file.endsWith('.js'))
        continue;
    import(`./cmd/${file}`).then(() => console.log(`[info] Success loading file ./src/cmd/${file}`));
}
await client.login(config.token);
