/*
    Copyleft 2022~2023
    Licensed under AGPL 3.0 License
    
    * https://github.com/momu54/me/
*/

import { exec } from 'child_process';
import { CreateCommand } from '../app.js';
import { APIEmbed, codeBlock } from 'discord.js';

await CreateCommand(
	{
		name: 'pull',
		description: 'Pull the code from Github',
	},
	async (interaction, defer) => {
		await defer();

		const embed: APIEmbed = {
			title: 'Pull',
		};

		const output = await AsyncExec('git pull').catch((stderr) => {
			embed.color = 0xff0000;
			return stderr as string;
		});
		embed.color ||= 0x00ff00;
		embed.description = codeBlock(output);
		await interaction.editReply({ embeds: [embed] });
	},
	true,
);

function AsyncExec(command: string) {
	return new Promise<string>((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) reject(stderr);
			else resolve(stdout);
		});
	});
}
