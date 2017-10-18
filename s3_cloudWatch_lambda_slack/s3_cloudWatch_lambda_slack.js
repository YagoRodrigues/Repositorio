console.log('Loading function');



const https = require('https');

const url = require('url');

const slack_url = 'Colocar Url'

const slack_req_opts = url.parse(slack_url);

slack_req_opts.method = 'POST';

slack_req_opts.headers = {

    'Content-Type': 'application/json'

};



exports.handler = function(event, context) {

    (event.Records || []).forEach(function(rec) {

        if (rec.Sns) {

            var req = https.request(slack_req_opts, function(res) {

                if (res.statusCode === 200) {

                    context.succeed('posted to slack');

                } else {

                    context.fail('status code: ' + res.statusCode);

                }

            });



            req.on('error', function(e) {

                console.log('problem with request: ' + e.message);

                context.fail(e.message);

            });



            var text_msg = JSON.stringify(rec.Sns.Message, null, '  ');

            var parsed;

            try {

                var msg_data = [];

                parsed = JSON.parse(rec.Sns.Message);

                for (var key in parsed) {

                    console.log(parsed[key]);

                    msg_data.push(key + ': ' + parsed[key]);

                }

                text_msg = msg_data.join("\n");

            } catch (e) {

                console.log(e);

            }

               parsed = parsed["Records"];

               console.log(JSON.parse(rec.Sns.Message));

               var local = parsed[0].s3.bucket.name+"/"+parsed[0].s3.object.key.substring(0,parsed[0].s3.object.key.lastIndexOf('/'));

            var params = {

                attachments: [{

                    fallback: text_msg,

                    pretext: rec.Sns.Subject,

                    color: "#007700",

                    fields: [{

                        "title": 'Local',

                        "value": local,

                        "short": false

                    },

                    {

                        "title": 'Event Name',

                        "value": parsed[0].eventName,

                        "short": false

                    },

                    {

                        "title": 'Event Time',

                        "value": parsed[0].eventTime.replace(/T/, ' ').replace(/\..+/, ''),

                        "short": false

                    }]

                }]

            };

            req.write(JSON.stringify(params));



            req.end();

        }

    });

};
