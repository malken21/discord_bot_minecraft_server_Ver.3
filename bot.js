const { Client, Intents, MessageEmbed, MessageAttachment } = require("discord.js");
const util = require('minecraft-server-util');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const Config = require("./Config.json")
client.login(Config.TOKEN);

client.on('ready', () => {
	const data = [{
		name: "server",
		description: "Minecraftのサーバーのテータスを表示",
		options: [{
			type: "STRING",
			name: "ip",
			description: "サーバーのIP",
			required: true
		},
		{
			type: "NUMBER",
			name: "port",
			description: "サーバーのポート 記入しなかった場合は Java版なら25565 統合版なら19132",
			required: false
		},
		{
			type: "STRING",
			name: "edition",
			description: "サーバーのエディション(Java版か統合版かどうか) 記入しなかった場合はJava版に選択されます",
			required: false,
			choices: [
				{ name: "java", value: "java" },
				{ name: "bedrock", value: "bedrock" }
			]
		}]
	}];
	client.application.commands.set(data, Config.ServerID);
	console.log(`login!!(${client.user.tag})`);
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) {
		return;
	}
	if (interaction.commandName === `server`) {

		await interaction.deferReply()
		const edition = interaction.options.getString(`edition`);

		if (edition === `bedrock`) {
			bedrock_server(interaction);
		} else {
			java_server(interaction);
		}
	}
});

function java_server(interaction) {

	const server = interaction.options.getString(`ip`);

	let port = interaction.options.getNumber(`port`);

	if (port === null || port < 0 || port > 65535) port = 25565;

	util.status(server, port)
		.then((result) => {

			const img_Buffer = new Buffer.from(result.favicon.split(",")[1], "base64");

			const attachment = new MessageAttachment(img_Buffer, `${server}.png`);
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(server)
				.setDescription(`プレイヤー : ${result.players.online}/${result.players.max}`)
				.setThumbnail(`attachment://${server}.png`)
				.addField(`${result.motd.clean}`, `バージョン : ${result.version.name}`, true)
			interaction.editReply({ files: [attachment], embeds: [embed] });
		})
		.catch((error) => {
			console.log(error);
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${server}は見つかりませんでした`)
			interaction.editReply({ embeds: [embed] });
		});
}

function bedrock_server(interaction) {

	const server = interaction.options.getString(`ip`);
	let port = interaction.options.getString(`port`);

	if (port === null || port < 0 || port > 65535) port = 19132;

	util.statusBedrock(server, port)
		.then((result) => {

			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(server)
				.setDescription(`プレイヤー : ${result.players.online}/${result.players.max}`)
				.addField(`${result.motd.clean}`, `バージョン : ${result.version.name}`, true)
			interaction.editReply({ embeds: [embed] });
		})
		.catch((error) => {
			console.log(error);
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${server}は見つかりませんでした`)
			interaction.editReply({ embeds: [embed] });
		});
}