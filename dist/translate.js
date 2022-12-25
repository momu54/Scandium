import zh_tw from './lang/zh_tw.json' assert { type: 'json' };
import en_us from './lang/en_us.json' assert { type: 'json' };
import _ from 'lodash';
export function Translate(interaction, key, variables) {
    let rawtext;
    switch (interaction.locale) {
        case 'zh-TW':
            rawtext = _.get(zh_tw, key);
            break;
        default:
            rawtext = _.get(en_us, key);
            break;
    }
    if (!variables)
        return rawtext;
    return ReplaceVariables(rawtext, variables);
}
function ReplaceVariables(text, variables) {
    while (true) {
        const firstbracket = text.indexOf('{');
        if (firstbracket == -1)
            break;
        const lastbracket = text.indexOf('}');
        const variableinrawtext = text.slice(firstbracket, lastbracket + 1);
        const variablename = variableinrawtext.replace('{', '').replace('}', '');
        text = text.replace(variableinrawtext, variables[variablename]);
    }
    return text;
}
