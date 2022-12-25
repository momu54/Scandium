import { CreateCommand, client } from '../app.js';
import { Translate } from '../translate.js';
await CreateCommand({
    name: 'ping',
    description: 'Get bot ping',
}, async (rawinteraction, _defer) => {
    const interaction = rawinteraction;
    const embed = {
        title: Translate(interaction, 'ping.title'),
        description: Translate(interaction, 'ping.desc', {
            ping: client.ws.ping.toString(),
        }),
    };
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
});
