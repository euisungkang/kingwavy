const Discord = require('discord.js');
const Meta = require('html-metadata-parser');
const cron = require('node-cron');
const Pornsearch = require('pornsearch')
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

client.login(process.env.BOT_TOKEN);

cron.schedule('00 5 * * *', () => {
    console.log('Running cron');
    postVideo();
})

client.on('message', message => {
    if (message.channel.id = process.env.INPUT_CHANNEL) {

        //console.log(message.channel.id + "      " + message)
        let output_channel = client.channels.get(process.env.GENERAL_CHANNEL);

        if (message.content == '#ping') {
            output_channel.send('pong');
        }
        else if (message.content == '#pong') {
            output_channel.send('ping');
        }
        else if (message.content == '#introduce') {
            output_channel.send('Yo');
        }
        else if (message.content == '#porn') {
            postVideo();
        }

    } else {
        console.log("Not in general")
    }
});

//Call function to post video on given channelID
async function postVideo () {
    let Searcher = new Pornsearch('');

    Searcher.videos().
    then(videos => {
        let total_videos = videos.length - 1
        let video_number = Math.round(Math.random() * (total_videos - 1) + 1)
        let video = videos[video_number]

        Meta.parser(video.url, async (err, result) => {
            //Get output channel and data of video
            let output_channel = await client.channels.get(process.env.OUTPUT_CHANNEL);
            let metadata = await result.og

            console.log(metadata)


            let thumbnail = metadata.image
            //Sending image
            output_channel.send({
                file: thumbnail
            });
            //Sending description
            output_channel.send('\n**' + metadata.title + '**\n```JSON\n"' + metadata.description + '"\n```\n**Video URL:** ' + video.url);
        })
    });
}