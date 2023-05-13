/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { CreateCommand } from '../utils/register.ts';
import JSZip from 'jszip';
import {
	APIEmbed,
	ApplicationCommandType,
	AttachmentPayload,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import sharp from 'sharp';
import { CommandLocalizations, Translate } from '../utils/translate.ts';
import { database } from '../utils/database.ts';

CreateCommand<MessageContextMenuCommandInteraction>(
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
		const convert = await database.GetConfig(
			interaction.user.id,
			'SaveAllImage',
			'convert'
		);
		for (let index = 0; index < attachments.length; index++) {
			const Attachment = attachments[index];
			if (!Attachment.contentType?.startsWith('image')) continue;
			const res = await fetch(Attachment.url);
			let resimage = Buffer.from(await res.arrayBuffer());
			const isntwebporjpeg =
				Attachment.contentType !== 'image/webp' &&
				Attachment.contentType !== 'image/jpeg';
			if (isntwebporjpeg && convert) {
				resimage = await sharp(resimage, { animated: true })
					.webp({
						quality: 82,
					})
					.toBuffer();
			}
			const spiltedfilename = Attachment.name?.split('.');
			const filename =
				isntwebporjpeg && convert
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
				color: await database.GetColor(interaction.user.id),
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
			description: convert
				? Translate(interaction.locale, 'SaveAllImage.desc', {
						size,
				  })
				: Translate(interaction.locale, 'SaveAllImage.DescNoConvert', {
						size,
				  }),
			footer: {
				text: Translate(interaction.locale, 'SaveAllImage.footer'),
			},
			color: await database.GetColor(interaction.user.id),
		};
		await interaction.editReply({ embeds: [embed], files: [zipAttachment] });
	}
);
