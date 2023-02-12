/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { ExportReturnType, generateFromMessages } from 'discord-html-transcripts';
import { AttachmentBuilder, Channel, Message } from 'discord.js';

export function GetMessageHtml(
	message: Message,
	channel: Channel,
	ReturnType: ExportReturnType.Attachment,
): Promise<AttachmentBuilder>;
export function GetMessageHtml(
	message: Message,
	channel: Channel,
	ReturnType: ExportReturnType.String,
): Promise<string>;
export async function GetMessageHtml(
	message: Message,
	channel: Channel,
	ReturnType: ExportReturnType,
): Promise<string | AttachmentBuilder | Buffer> {
	return await generateFromMessages([message], channel, {
		returnType: ReturnType,
		filename: `${new Date().toJSON()}.${message.id}.html`,
		poweredBy: false,
	});
}
