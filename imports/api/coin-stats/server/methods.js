import { Meteor } from 'meteor/meteor';
import { CoinStats } from '../coin-stats.js';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'coinStats.getCoinStats': function(){
        this.unblock();
        let coinId = Meteor.settings.public.coingeckoId;
        if (coinId){
            let url
            try{
                let now = new Date();
                now.setMinutes(0);
                url = "https://api.coingecko.com/api/v3/simple/price?ids="+coinId+"&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";
                let response = HTTP.get(url);
                if (response.statusCode == 200){
                    // console.log(JSON.parse(response.content));
                    let data = JSON.parse(response.content);
                    data = data[coinId] || {"fox":{"usd":0,"usd_market_cap":0,"usd_24h_vol":0,"usd_24h_change":0,"last_updated_at":9999999999}};

                    return CoinStats.upsert({last_updated_at:data.last_updated_at}, {$set:data});
                }
            }
            catch(e){
                console.log(`Failed to query ${url}`)
                console.log(e);
            }
        }
        else{
            return "No coingecko Id provided."
        }
    },
    'coinStats.getStats': function(){
        this.unblock();
        let coinId = Meteor.settings.public.coingeckoId;
        if (coinId){
            return (CoinStats.findOne({},{sort:{last_updated_at:-1}}));
        }
        else{
            return "No coingecko Id provided.";
        }

    }
})