const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const PREFIX = "-"; 
let connection;
let player;

client.on('ready', () => {
    console.log(`${client.user.tag} جاهز!`);
});

client.on('messageCreate', async message => {
    if(!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'join') {
        const channel = message.member.voice.channel;
        if(!channel) return message.reply('دخل لقناة صوتية أولا!');
        connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        player = createAudioPlayer();
        connection.subscribe(player);
        message.reply('انا دخلت للقناة الصوتية ✅');
    }

    if(command === 'play') {
        const url = args[0];
        if(!url) return message.reply('جبلي رابط يوتيوب!');
        if(!connection) return message.reply('أنا مش موجود في قناة صوتية! استخدم -join');

        const stream = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        player.play(resource);
        message.reply(`تشغيل: ${url}`);
    }

    if(command === 'pause') {
        if(!player) return message.reply('ما فيش شي شغال!');
        player.pause();
        message.reply('تم الإيقاف مؤقت ✅');
    }

    if(command === 'resume') {
        if(!player) return message.reply('ما فيش شي شغال!');
        player.unpause();
        message.reply('تم التشغيل من جديد ✅');
    }

    if(command === 'leave') {
        if(!connection) return message.reply('انا مش موجود في قناة صوتية!');
        connection.destroy();
        connection = null;
        player = null;
        message.reply('خرجت من القناة ✅');
    }
});

client.login(process.env.DISCORD_TOKEN);
