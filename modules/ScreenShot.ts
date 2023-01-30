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
	ApplicationCommandType,
	AttachmentBuilder,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { CreateCommand } from '../app.js';
import { CommandLocalizations, Translate } from '../utils/translate.js';
import { ExportReturnType } from 'discord-html-transcripts';
import { GetMessageHtml } from '../utils/getmessagehtml.js';
import { launch } from 'puppeteer';
import { GetColor, GetConfig } from '../utils/database.js';

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
		const format = await GetConfig<string>(
			interaction.user.id,
			'Screenshot',
			'format',
		);
		const img = (await messageinhtml!.screenshot({
			quality: format != 'png' ? 100 : undefined,
			type: format as 'png' | 'webp' | 'jpeg',
			encoding: 'binary',
		})) as Buffer;

		await browser.close();

		const attachment = new AttachmentBuilder(img, { name: 'message.webp' });
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'Screenshot.title'),
			description: Translate(interaction.locale, 'Screenshot.desc', {
				size: (img.byteLength * 0.000001).toFixed(4),
				format: format,
			}),
			image: {
				url: 'attachment://message.webp',
			},
			footer: {
				text: Translate(interaction.locale, 'Screenshot.footer'),
			},
			color: await GetColor(interaction.user.id),
		};
		await interaction.editReply({ files: [attachment], embeds: [embed] });
	},
);
