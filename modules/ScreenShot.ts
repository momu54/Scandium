import {
	APIEmbed,
	ApplicationCommandType,
	AttachmentBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { CreateCommand } from '../app.js';
import { CommandLocalizations, Translate } from '../utils/translate.js';
import { ExportReturnType } from 'discord-html-transcripts';
import { GetMessageHtml } from '../utils/getmessagehtml.js';
import { launch } from 'puppeteer';

await CreateCommand<MessageContextMenuCommandInteraction>(
	{
		name: 'Take a screenshot',
		type: ApplicationCommandType.Message,
		nameLocalizations: CommandLocalizations('Screenshot'),
	},
	async (interaction, defer) => {
		await defer();
		const html = await GetMessageHtml(
			interaction.targetMessage,
			interaction.channel!,
			ExportReturnType.String,
		);

		const browser = await launch({
			defaultViewport: {
				width: 600,
				height: 1000,
			},
			args: ['--no-sandbox'],
		});

		const page = await browser.newPage();
		await page.setContent(html);

		await page.waitForSelector('.discord-message-inner');
		await page.waitForNetworkIdle();
		const messageinhtml = await page.$('.discord-message-inner');
		const img = (await messageinhtml!.screenshot({
			quality: 100,
			type: 'webp',
			encoding: 'binary',
		})) as Buffer;

		await browser.close();

		const attachment = new AttachmentBuilder(img, { name: 'message.webp' });
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'Screenshot.title'),
			description: Translate(interaction.locale, 'Screenshot.desc', {
				size: (img.byteLength * 0.000001).toFixed(4),
			}),
			image: {
				url: 'attachment://message.webp',
			},
		};
		await interaction.editReply({ files: [attachment], embeds: [embed] });
	},
);
