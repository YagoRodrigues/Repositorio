console.log('Loading function');

const https = require('https');
const url = require('url');
const slack_url = 'Colocar Url';
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
                        if(key != 'AWSAccountId' && key != 'Region' && key != 'Trigger'){
                            if(key == 'StateChangeTime'){
                                msg_data.push(key + ': ' + parsed[key]   );
                            } else {
                                msg_data.push(key + ': ' + parsed[key]);
                            }
                                
                        }
                }
                text_msg = msg_data.join("\n");
            } catch (e) {
                console.log(e);
            }

                var color;
                var state;
                for (var key2 in parsed) {
                    if(key2 == "NewStateValue"){
                        state = parsed[key2];
                        if(state == "OK"){
                          color = "#007700";  
                        } else if(state == "ALARM"){
                          color = "#D00000";
                        }
                    }
                    msg_data.push(key + ': ' + parsed[key]);
                }    

            var params;
            console.log(parsed['Trigger']);
            console.log(parsed['Trigger'].Dimensions[0].value);
            params = {
                attachments: [{
                    fallback: text_msg,
                    pretext: rec.Sns.Subject,
                    color: color,
                    fields: [
                    {
                        "title": 'Instance Id',
                        "value": parsed['Trigger'].Dimensions[1].value,
                        "short": false
                    },
                    {
                        "title": 'Alarm Name',
                        "value": parsed['AlarmName'],
                        "short": false
                    },
                    {
                        "title": 'Alarm Description',
                        "value": parsed['AlarmDescription']+" em "+parsed['Trigger'].Dimensions[0].value,
                        "short": false
                    },
                    {
                        "title": 'State',
                        "value": parsed['NewStateValue'],
                        "short": false
                    },
                    {
                        "title": 'Reason',
                        "value": parsed['NewStateReason'],
                        "short": false
                    },
                    {
                        "title": 'Time',
                        "value": parsed['StateChangeTime'].replace(/T/, ' ').replace(/\..+/, ''),
                        "short": false
                    },
                    {
                        "title": 'Last State',
                        "value": parsed['OldStateValue'],
                        "short": false
                    }
                    ]
                    
                }]
            };
            
            if(parsed['NewStateValue'] == 'OK' && parsed['OldStateValue'] != "ALARM"){
                req.abort();
            }

            req.write(JSON.stringify(params));

            req.end();
        }
    });
};
