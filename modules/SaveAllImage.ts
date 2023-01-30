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

import { CreateCommand } from '../app.js';
import JSZip from 'jszip';
import {
	APIEmbed,
	ApplicationCommandType,
	AttachmentPayload,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import sharp from 'sharp';
import { CommandLocalizations, Translate } from '../utils/translate.js';
import { GetColor, GetConfig } from '../utils/database.js';

await CreateCommand<MessageContextMenuCommandInteraction>(
	{
		name: 'Save all image',
		type: ApplicationCommandType.Message,
		nameLocalizations: CommandLocalizations('SaveAllImage'),
	},
	async (interaction, defer) => {
		await defer();
		const msg = interaction.targetMessage;
		const zip = new JSZip();
		const attachments = Array.from(msg.attachments.values());
		for (let index = 0; index < attachments.length; index++) {
			const Attachment = attachments[index];
			if (!Attachment.contentType?.startsWith('image')) continue;
			const res = await fetch(Attachment.url);
			let resimage = Buffer.from(await res.arrayBuffer());
			const isntwebporjpeg =
				Attachment.contentType != 'image/webp' &&
				Attachment.contentType != 'image/jpeg';
			if (
				isntwebporjpeg &&
				(await GetConfig(interaction.user.id, 'SavaAllImage', 'convert'))
			) {
				resimage = await sharp(resimage, { animated: true })
					.webp({
						quality: 82,
					})
					.toBuffer();
			}
			const spiltedfilename = Attachment.name?.split('.');
			const filename = isntwebporjpeg
				? Attachment.name?.replaceAll(spiltedfilename?.pop()!, 'webp')
				: Attachment.name;
			zip.file(`${index + 1}.${filename}`, resimage, {
				binary: true,
				compression: 'DEFLATE',
			});
		}
		const zipData = await zip.generateAsync({ type: 'nodebuffer' });
		if (zipData.byteLength > 8388608) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'SaveAllImage.error.toolarge'),
			};
			await interaction.editReply({ embeds: [errembed] });
			return;
		}
		const zipAttachment: AttachmentPayload = {
			name: `${new Date().toJSON()}.${msg.id}.zip`,
			attachment: zipData,
		};
		const size = (zipData.byteLength * 0.000001).toFixed(4);
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'SaveAllImage.title'),
			description: Translate(interaction.locale, 'SaveAllImage.desc', {
				size: size,
			}),
			footer: {
				text: Translate(interaction.locale, 'SaveAllImage.footer'),
			},
			color: await GetColor(interaction.user.id),
		};
		await interaction.editReply({ embeds: [embed], files: [zipAttachment] });
	},
);
