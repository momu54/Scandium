import { CreateCommand } from '../app.js';
import JSZip from 'jszip';
import { ApplicationCommandType, } from 'discord.js';
import sharp from 'sharp';
import { Translate } from '../translate.js';
CreateCommand({
    name: 'Save all image',
    type: ApplicationCommandType.Message,
}, async (rawinteraction, defer) => {
    const interaction = rawinteraction;
    await defer();
    const msg = interaction.targetMessage;
    const zip = new JSZip();
    const attachments = Array.from(msg.attachments.values());
    for (let index = 0; index < attachments.length; index++) {
        const Attachment = attachments[index];
        if (!Attachment.contentType?.startsWith('image'))
            continue;
        const res = await fetch(Attachment.url);
        let resimage = Buffer.from(await res.arrayBuffer());
        const isntwebporjpeg = Attachment.contentType != 'image/webp' &&
            Attachment.contentType != 'image/jpeg';
        if (isntwebporjpeg) {
            resimage = await sharp(resimage, { animated: true })
                .webp({
                quality: 82,
            })
                .toBuffer();
        }
        const spiltedfilename = Attachment.name?.split('.');
        const filename = isntwebporjpeg
            ? Attachment.name?.replaceAll(spiltedfilename?.pop(), 'webp')
            : Attachment.name;
        zip.file(`${index + 1}.${filename}`, resimage, {
            binary: true,
            compression: 'DEFLATE',
        });
    }
    const zipData = await zip.generateAsync({ type: 'nodebuffer' });
    if (zipData.byteLength > 8388608) {
        const errembed = {
            title: Translate(interaction, 'error.title'),
            description: Translate(interaction, 'saveallimage.error.toolarge'),
        };
        await interaction.editReply({ embeds: [errembed] });
        return;
    }
    const zipAttachment = {
        name: `${new Date().toJSON()}.${msg.id}.zip`,
        attachment: zipData,
    };
    const size = (zipData.byteLength * 0.000001).toFixed(2);
    const embed = {
        title: Translate(interaction, 'saveallimage.title'),
        description: Translate(interaction, 'saveallimage.desc', {
            size: size,
        }),
    };
    await interaction.editReply({ embeds: [embed], files: [zipAttachment] });
});
