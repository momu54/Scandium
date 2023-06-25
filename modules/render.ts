/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	APIEmbed,
	ApplicationCommandType,
	AttachmentBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { ScandiumCommand } from '../utils/register.js';
import { CommandLocalizations, Translate } from '../utils/translate.js';
import { ExportReturnType } from 'discord-html-transcripts';
import { GetMessageHtml } from '../utils/getmessagehtml.js';
import { launch } from 'puppeteer';
import { database } from '../utils/database.js';

new ScandiumCommand<MessageContextMenuCommandInteraction>(
	{
		name: 'Render Message',
		type: ApplicationCommandType.Message,
		nameLocalizations: CommandLocalizations('render'),
	},
	async (interaction, defer) => {
		await defer();
		const html = await GetMessageHtml(
			interaction.targetMessage,
			interaction.channel!,
			ExportReturnType.String
		);

		const browser = await launch({
			defaultViewport: {
				width: 600,
				height: 1000,
			},
			args: ['--no-sandbox'],
			headless: 'new',
			waitForInitialPage: false,
		});

		const page = await browser.newPage();
		await page.setContent(html);

		await page.waitForSelector('.discord-message-inner');
		await page.waitForNetworkIdle();
		const messageinhtml = await page.$('.discord-message-inner');
		const format = await database.GetConfig<string>(
			interaction.user.id,
			'render',
			'format'
		);
		const img = (await messageinhtml!.screenshot({
			quality: format !== 'png' ? 100 : undefined,
			type: format as 'png' | 'webp' | 'jpeg',
			encoding: 'binary',
		})) as Buffer;

		await browser.close();

		const attachment = new AttachmentBuilder(img, { name: `message.${format}` });
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'render.title'),
			description: Translate(interaction.locale, 'render.desc', {
				size: (img.byteLength * 0.000001).toFixed(4),
				format,
			}),
			image: {
				url: `attachment://message.${format}`,
			},
			footer: {
				text: Translate(interaction.locale, 'render.footer'),
			},
			color: await database.GetColor(interaction.user.id),
		};
		await interaction.editReply({ files: [attachment], embeds: [embed] });
	}
);
