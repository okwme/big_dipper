import { Meteor } from 'meteor/meteor';
import { Transactions } from '../transactions.js';
import { Blockscon } from '../../blocks/blocks.js';


publishComposite('transactions.list', function(limit = 30){
    return {
        find(){
            return Transactions.find({},{sort:{height:-1}, limit:limit})
        },
        children: [
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
});
// TODO: change these back to events with SDK v0.37.0
publishComposite('transactions.validator', function(validatorAddress, delegatorAddress, limit=100){
    let query = {};
    if (validatorAddress && delegatorAddress){
        query = {$or:[{"tags.value":validatorAddress}, {"tags.value":delegatorAddress}]}
    }

    if (!validatorAddress && delegatorAddress){
        query = {"tags.value":delegatorAddress}
    }

    return {
        find(){
            return Transactions.find(query, {sort:{height:-1}, limit:limit})
        },
        children:[
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})

publishComposite('transactions.findOne', function(hash){
    return {
        find(){
            return Transactions.find({txhash:hash})
        },
        children: [
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})

publishComposite('transactions.height', function(height){
    return {
        find(){
            return Transactions.find({height:height})
        },
        children: [
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})