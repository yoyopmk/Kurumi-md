require('./config')
require('./brain.js')
const { default: arusConnect, useSingleFileAuthState, DisconnectReason, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@adiwajshing/baileys")
const pino = require('pino')
const fs = require('fs')
const chalk = require('chalk')
const qrcode = require("qrcode");
const express = require("express");
const CFonts = require('cfonts')
const FileType = require('file-type')
const moment = require('moment-timezone')
const mongoose = require('mongoose');
const { Pool } = require("pg");
main().catch(err => console.log(err));
const proConfig = {
    connectionString: pgdb,
    ssl: {
        rejectUnauthorized: false,
    },
};

const pool = new Pool(proConfig);

async function main() {
    await mongoose.connect(mongodb);
}

try {
    fs.unlinkSync(`./${sessionName}.json`);
} catch (err) {
    console.log("Auth File Already Deleted");
}
const { state, saveState } = useSingleFileAuthState(`./${sessionName}.json`)

//--------------------------------AUTH-FETCH------------------------------------//
let cred, auth_row_count;
async function fetchauth() {
    try {
        auth_result = await pool.query("select * from auth;"); //checking auth table
        console.log("Fetching login data...");
        auth_row_count = await auth_result.rowCount;
        let data = auth_result.rows[0];
        // console.log("data ",data);
        if (auth_row_count == 0) {
            console.log("No login data found!");
        } else {
            console.log("Login data found!");
            cred = {
                creds: {
                    noiseKey: JSON.parse(data.noisekey),
                    signedIdentityKey: JSON.parse(data.signedidentitykey),
                    signedPreKey: JSON.parse(data.signedprekey),
                    registrationId: Number(data.registrationid),
                    advSecretKey: data.advsecretkey,
                    nextPreKeyId: Number(data.nextprekeyid),
                    firstUnuploadedPreKeyId: Number(data.firstunuploadedprekeyid),
                    serverHasPreKeys: Boolean(data.serverhasprekeys),
                    account: JSON.parse(data.account),
                    me: JSON.parse(data.me),
                    signalIdentities: JSON.parse(data.signalidentities),
                    lastAccountSyncTimestamp: 0, // To allow bot to read the messages
                    // lastAccountSyncTimestamp: Number(data.lastaccountsynctimestampb),
                    myAppStateKeyId: data.myappstatekeyid,
                },
                keys: state.keys,
            };
            cred.creds.noiseKey.private = Buffer.from(cred.creds.noiseKey.private);
            cred.creds.noiseKey.public = Buffer.from(cred.creds.noiseKey.public);
            cred.creds.signedIdentityKey.private = Buffer.from(
                cred.creds.signedIdentityKey.private
            );
            cred.creds.signedIdentityKey.public = Buffer.from(
                cred.creds.signedIdentityKey.public
            );
            cred.creds.signedPreKey.keyPair.private = Buffer.from(
                cred.creds.signedPreKey.keyPair.private
            );
            cred.creds.signedPreKey.keyPair.public = Buffer.from(
                cred.creds.signedPreKey.keyPair.public
            );
            cred.creds.signedPreKey.signature = Buffer.from(
                cred.creds.signedPreKey.signature
            );
            cred.creds.signalIdentities[0].identifierKey = Buffer.from(
                cred.creds.signalIdentities[0].identifierKey
            );
        }
    } catch (err) {
        console.log(err);
        console.log("Creating database..."); //if login fail create a db
        await pool.query(
            "CREATE TABLE auth(noiseKey text, signedIdentityKey text, signedPreKey text, registrationId text, advSecretKey text, nextPreKeyId text, firstUnuploadedPreKeyId text, serverHasPreKeys text, account text, me text, signalIdentities text, lastAccountSyncTimestamp text, myAppStateKeyId text);"
        );

        await fetchauth();
    }
}


const user = require("./models/user")
const group = require("./models/group")
//const usere = JSON.parse(fs.readFileSync('./lib/user.json'))
const { smsg, formatp, formatDate, getTime, isUrl, clockString, runtime, fetchJson, getBuffer, jsonformat, format, parseMention, GIFBufferToVideoBuffer, getRandom, await, sleep, getSizeMedia, generateMessageTag } = require('./lib/myfunc')
const Canvas = require('discord-canvas')
const path = require('path');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

const getVersionWaweb = () => {
    let version
    try {
        let a = fetchJson('https://web.whatsapp.com/check-update?version=1&platform=web')
        version = [a.currentVersion.replace(/[.]/g, ', ')]
    } catch {
        version = [2, 2204, 13]
    }
    return version
}
const PORT = port
const app = express();
let QR_GENERATE = "invalid";
async function startArus() {
    await fetchauth();
    if (auth_row_count != 0) {
        state.creds = cred.creds;
    }
    CFonts.say('Kurumi\nBY\nARUS\n&AKU', {
        font: 'block',
        align: 'center',
        gradient: ['blue', 'magenta']
    })
    const arus = arusConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Kurumi', 'Safari', '1.0.0'],
        auth: state,
        version: getVersionWaweb() || [2, 2204, 13]
    })

    store.bind(arus.ev)

    arus.ws.on('CB:call', async (json) => {
        const callerId = json.content[0].attrs['call-creator']
        if (json.content[0].tag == 'offer') {
            let pa7rick = await arus.sendContact(callerId, global.owner)
            arus.sendMessage(callerId, { text: `Automatic system block!\nDon't call bot!\nPlease contact owner to open it !` }, { quoted: pa7rick })
            await sleep(8000)
            await arus.updateBlockStatus(callerId, "block")
        }
    })

    arus.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!arus.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            m = smsg(arus, mek, store)
            require("./brain.js")(arus, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

    arus.ev.on('group-participants.update', async (grp) => {
        try {

            let metadata = await arus.groupMetadata(grp.id)
            let participants = grp.participants
            let mem = grp.participants[0]
            const groupName = metadata.subject || ''
            const groupAdmins = await participants.filter(v => v.admin !== null).map(v => v.id) || ''

            for (let num of participants) {
                // Get Profile Picture User
                try {
                    ppuser = await arus.profilePictureUrl(num, 'image')
                } catch {
                    ppuser = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                }

                // Get Profile Picture Group
                try {
                    ppgroup = await arus.profilePictureUrl(grp.id, 'image')
                } catch {
                    ppgroup = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                }

                let Igroup = await group.findOne({ id: grp.id })
                if (Igroup) {
                    let hh = Igroup.events || "false"

                    if (grp.action == 'add' && hh == "true") {
                        let name = arus.getName(num)

                        const des = `*━━━━『🍀WELCOME🍀』━━━━*\n\n*🎐Name:* ${groupName}\n\n*🔩ID Group:* ${grp.id}\n\n*🍀Made:* ${moment(`${metadata.creation}` * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss')}\n\n*🔍Number Of Admins:* ${groupAdmins.length}\n\n*🎍Number Of Participants:* ${participants.length}\n\n*🔍Desc:* \n\n${metadata.desc}\n\n*`
                        arus.sendMessage(grp.id, { image: { url: ppgroup }, contextInfo: { mentionedJid: [num] }, caption: des })
                    }
                    if (grp.action == 'remove' && hh == "true") {
                        arus.sendMessage(grp.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `@${num.split("@")[0]} left from ${metadata.subject}` })
                    }
                }
            }
        } catch (err) {
            console.log(err)
        }
    })

    // Setting
    arus.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    arus.ev.on('contacts.update', async update => {
        for (let contact of update) {
            let id = arus.decodeJid(contact.id)
            user.findOne({ id: id }).then((usr) => {
                if (!usr) {
                    new user({ id: id, name: contact.notify }).save()
                    console.log("user added")
                } else {
                    user.updateOne({ id: id }, { name: contact.notify })
                    console.log("user updated")

                }
            })
        }
    })

    arus.getName = (jid, withoutContact = false) => {
        id = arus.decodeJid(jid)
        withoutContact = arus.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = arus.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === arus.decodeJid(arus.user.id) ?
            arus.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    arus.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: await arus.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await arus.getName(i + '@s.whatsapp.net')}\nFN:${await arus.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Phone\nitem2.EMAIL;type=INTERNET:arusbots@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/riki_4932\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;India;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        arus.sendMessage(jid, { contacts: { displayName: `${list.length} contact`, contacts: list }, ...opts }, { quoted })
    }

    arus.public = true

    arus.serializeM = (m) => smsg(arus, m, store)

    arus.ev.on('connection.update', async (update) => {
        const { lastDisconnect, connection, qr } = update
        if (connection === 'close') {
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? startArus() : console.log('Conneting...')
        }
        if (qr) {
            QR_GENERATE = qr;
        }
        console.log('Connection...', update)
    })

    arus.ev.on('creds.update', () => {
        saveState();
        try {
            let noiseKey = JSON.stringify(state.creds.noiseKey);
            let signedIdentityKey = JSON.stringify(state.creds.signedIdentityKey);
            let signedPreKey = JSON.stringify(state.creds.signedPreKey);
            let registrationId = state.creds.registrationId;
            let advSecretKey = state.creds.advSecretKey;
            let nextPreKeyId = state.creds.nextPreKeyId;
            let firstUnuploadedPreKeyId = state.creds.firstUnuploadedPreKeyId;
            let serverHasPreKeys = state.creds.serverHasPreKeys;
            let account = JSON.stringify(state.creds.account);
            let me = JSON.stringify(state.creds.me);
            let signalIdentities = JSON.stringify(state.creds.signalIdentities);
            let lastAccountSyncTimestamp = state.creds.lastAccountSyncTimestamp;
            // let lastAccountSyncTimestamp = 0;
            let myAppStateKeyId = state.creds.myAppStateKeyId; //?

            // INSERT / UPDATE LOGIN DATA
            if (auth_row_count == 0) {
                console.log("Inserting login data...");
                pool.query(
                    "INSERT INTO auth VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);",
                    [
                        noiseKey,
                        signedIdentityKey,
                        signedPreKey,
                        registrationId,
                        advSecretKey,
                        nextPreKeyId,
                        firstUnuploadedPreKeyId,
                        serverHasPreKeys,
                        account,
                        me,
                        signalIdentities,
                        lastAccountSyncTimestamp,
                        myAppStateKeyId,
                    ]
                );
                pool.query("commit;");
                console.log("New login data inserted!");
            } else {
                // console.log("Updating login data....");
                pool.query(
                    "UPDATE auth SET noiseKey = $1, signedIdentityKey = $2, signedPreKey = $3, registrationId = $4, advSecretKey = $5, nextPreKeyId = $6, firstUnuploadedPreKeyId = $7, serverHasPreKeys = $8, account = $9, me = $10, signalIdentities = $11, lastAccountSyncTimestamp = $12, myAppStateKeyId = $13;",
                    [
                        noiseKey,
                        signedIdentityKey,
                        signedPreKey,
                        registrationId,
                        advSecretKey,
                        nextPreKeyId,
                        firstUnuploadedPreKeyId,
                        serverHasPreKeys,
                        account,
                        me,
                        signalIdentities,
                        lastAccountSyncTimestamp,
                        myAppStateKeyId,
                    ]
                );
                pool.query("commit;");
                console.log("Login data updated!");
            }
        } catch (err) {
            console.log(err);
        }
    })

    // Add Other
    /** Send Button 5 Image
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    arus.send5ButImg = async (jid, text = '', footer = '', img, but = [], options = {}) => {
        let message = await prepareWAMessageMedia({ image: img }, { upload: arus.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options)
        arus.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    arus.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        }
        arus.sendMessage(jid, buttonMessage, { quoted, ...options })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendText = (jid, text, quoted = '', options) => arus.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await arus.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await arus.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    arus.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await arus.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendTextWithMentions = async (jid, text, quoted, options = {}) => arus.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await arus.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await arus.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    arus.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    arus.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    arus.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await arus.getFile(path, true)
        let { mime, ext, res, data, filename } = types
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
        }
        let type = '', mimetype = mime, pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./lib/exif')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        }
        else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await arus.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
        return fs.promises.unlink(pathFile)
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    arus.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = {
                ...message.message.viewOnceMessage.message
            }
        }

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await arus.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }

    arus.cMod = (jid, copy, text = '', sender = arus.user.id, options = {}) => {
        //let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === arus.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }


    /**
     * 
     * @param {*} path 
     * @returns 
     */
    arus.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    return arus
}

startArus()

app.use(async (req, res) => {
    res.setHeader("content-type", "image/png");
    res.end(await qrcode.toBuffer(QR_GENERATE));
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
