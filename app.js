const Discord = require(`discord.js`);
const forever = require('forever');
const chalk = require('chalk');
const sql = require('sqlite');
const config = require('./config.json');
const client = new Discord.Client();
sql.open('./music.sqlite');

const music = {
    'playnonstop': (message) => {
    sql.get(`SELECT * FROM playing WHERE guildID = "${message.guild.id}"`).then(row => {
        if(!row) {
            sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "Yes"]);

            message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw.`);
        } else {
            const voiceChannel = message.member.voiceChannel;
    if(!voiceChannel || voiceChannel.type !== "voice") {
        const embedErrorVCNF = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Je moet in een spraakkanaal zitten om dit te doen!`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            message.channel.send(embedErrorVCNF);
    } else if (row.isReady === "Yes") {
    voiceChannel.join().then(connection => {
        const dispatcher = connection.playStream(`http://streaming.radionomy.com/CMFM-?lang=nl-NL%2cnl%3bq%3d0.9%2cen-US%3bq%3d0.8%2cen%3bq%3d0.7.mp3`);
        const embed = new Discord.RichEmbed()
        .setTitle(`Live Radio`)
        .setDescription(`Je luistert nu naar CMFM! Nonstop!`)
        .setFooter(`© CMFM!`)
        .setColor(0xFF0040);

        message.channel.send({embed});

        sql.run(`UPDATE playing SET isReady = "No" WHERE guildID = "${message.guild.id}"`);

        console.log(`Ik ben in een spraakkanaal geroepen voor CMFM! Nonstop!`);

        dispatcher.on("end", end => {
            sql.run(`UPDATE playing SET isReady = "Yes" WHERE guildID = "${message.guild.id}"`);
        });
    }).catch(err => console.log(err));
    } else if(row.isReady === "No") {
        const embedAlreadyPlaying = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Ik speel al muziek af!`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            message.channel.send(embedAlreadyPlaying);
    }
        }
    }).catch(() => {
        sql.run(`CREATE TABLE IF NOT EXISTS playing (guildID TEXT, isReady TEXT)`).then(() => {
            sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "Yes"]);

            message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw!`);
        });
    });
    },
    'playlive': (message) => {
        sql.get(`SELECT * FROM playing WHERE guildID = "${message.guild.id}"`).then(row => {
            if(!row) {
                sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "Yes"]);

                message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw.`);
            } else {
                const voiceChannel = message.member.voiceChannel;
    if(!voiceChannel || voiceChannel.type !== "voice") {
        const embedErrorVCNF = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Je moet in een spraakkanaal zitten om dit te doen!`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            message.channel.send(embedErrorVCNF);
    } else if (row.isReady === "Yes") {
    voiceChannel.join().then(connection => {
        const dispatcher = connection.playStream(`http://nrf1.newradio.it:9942/live`);
        const embed = new Discord.RichEmbed()
        .setTitle(`Live Radio`)
        .setDescription(`Je luistert nu naar CMFM! Live!`)
        .setFooter(`© CMFM!`)
        .setColor(0xFF0040);

        sql.run(`UPDATE playing SET isReady = "No" WHERE guildID = "${message.guild.id}"`);

        message.channel.send({embed});

        console.log(`Ik ben in een spraakkanaal geroepen voor CMFM! Live!`);

        dispatcher.on("end", end => {
            sql.run(`UPDATE playing SET isReady = "Yes" WHERE guildID = "${message.guild.id}"`);
        });
    }).catch(err => console.log(err));
    } else if(row.isReady === "No") {
        const embedAlreadyPlaying = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Ik speel al muziek af!`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            message.channel.send(embedAlreadyPlaying);
    }
            }
        }).catch(() => {
            sql.run(`CREATE TABLE IF NOT EXISTS playing (guildID TEXT, isReady TEXT)`).then(() => {
                sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "Yes"]);
    
                message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw!`);
            });
        });
    },
    'leave': (message) => {
        sql.get(`SELECT * FROM playing WHERE guildID = "${message.guild.id}"`).then(row => {
            if(!row) {
                sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "No"]);

                message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw!`);
            } else {
                const voiceChannel = message.member.voiceChannel;
        if(row.isReady === "No") {
            voiceChannel.leave();
            const embedDisconnect = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Succesvol Losgekoppeld!`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            sql.run(`UPDATE playing SET isReady = "Yes" WHERE guildID = "${message.guild.id}"`);

            message.channel.send(embedDisconnect);

            console.log(`Ik ben uit een spraakkanaal gegaan!`);
            
        } else {
            const embedErrorNoVC = new Discord.RichEmbed()
            .setTitle(`CMFM! Notificaties`)
            .setDescription(`Ik ben niet verbonden met een spraakkanaal...`)
            .setFooter(`© CMFM!`)
            .setColor(0xFF0040);

            message.channel.send(embedErrorNoVC);
        }
            }
        }).catch(() => {
            sql.run(`CREATE TABLE IF NOT EXISTS playing (guildID TEXT, isReady TEXT)`).then(() => {
                sql.run(`INSERT INTO playing (guildID, isReady) VALUES (?, ?)`, [message.guild.id, "Yes"]);
    
                message.channel.send(`Ik heb deze server aan mijn database toegevoegd! Probeer het alstublieft opnieuw!`);
            });
        });
    },
    'help': (message) => {
        const embed2 = new Discord.RichEmbed()
        .setTitle(`Welkom bij CMFM!`)
        .setDescription(`Hey! Ik ben de CMFM! Radio bot! Ik ben gemaakt om live muziek af te spelen in jouw spraakkanaal!\n\nHier zijn mijn commando's:\n\`\`\`\ncmfm help -> Stuurt dit lijstje\ncmfm invite -> Voeg me toe aan je server!\ncmfm playnonstop -> Speel de Nonstop radio af in jouw spraakkanaal!\ncmfm playlive -> Luister live naar CMFM!\ncmfm leave -> Stopt met het spelen van muziek en verlaat jouw spraakkanaal.\n\`\`\``)
        .setColor(0xFF0040)
        .setFooter(`© CMFM!`);

        message.channel.send(embed2);
    },
    'invite': (message) => {
        const embed3 = new Discord.RichEmbed()
        .setTitle(`Nodig me uit!`)
        .setDescription(`Je kan me [hier](https://discordapp.com/api/oauth2/authorize?client_id=502091715864428546&permissions=8&scope=bot) uitnodigen! Bedankt!`)
        .setColor(0xFF0040)
        .setFooter(`© CMFM!`)

        message.channel.send(embed3);
    }
}

client.on('ready', () => {
    console.info(`Ik ben er klaar voor!`);

    client.user.setActivity(`Nu in ${client.guilds.size} servers! | cmfm help`);
});

client.on('guildCreate', guild => {
    console.log(`${chalk.cyanBright(`[DISCORD]`)} ${chalk.yellowBright(`Ik ben toegevoegd aan`)} ${chalk.greenBright(`${guild.name}`)} ${chalk.yellowBright(`met ID`)} ${chalk.greenBright(`${guild.id}`)}`);

    client.user.setActivity(`Nu in ${client.guilds.size} servers! | cmfm help`);
});

client.on('guildDelete', guild => {
    console.log(`${chalk.cyanBright(`[DISCORD]`)} ${chalk.yellowBright(`Ik ben verwijderd uit`)} ${chalk.greenBright(`${guild.name}`)} ${chalk.yellowBright(`met ID`)} ${chalk.greenBright(`${guild.id}`)}`);

    client.user.setActivity(`Nu in ${client.guilds.size} servers! | cmfm help`);
});

client.on("message", message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    if (music.hasOwnProperty(message.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) music[message.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](message);
});

client.login(config.token);