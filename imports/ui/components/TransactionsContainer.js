import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import ValidatorTransactions from './Transactions.jsx';

export default TransactionsContainer = withTracker((props) => {
    let transactionsHandle, transactions, transactionsExist;
    let loading = true;

    if (Meteor.isClient){
        transactionsHandle = Meteor.subscribe('transactions.validator', props.validator, props.delegator, props.limit);
        loading = !transactionsHandle.ready();
    }

    if (Meteor.isServer || !loading){
        transactions = Transactions.find({}, {sort:{height:-1}});

        if (Meteor.isServer){
            console.log('Meteor.isServer === true')
            loading = false;
            transactionsExist = !!transactions;
        }
        else{
            console.log('Meteor.isServer === false')
            transactionsExist = !loading && !!transactions;
        }
    }

    console.log({transactionsExist})
    let transferTxs = Transactions.find({
        $or: [
            {"tx.value.msg.type":"cosmos-sdk/MsgSend"},
            {"tx.value.msg.type":"cosmos-sdk/MsgMultiSend"}
        ]
    }).fetch()
    async function foo() {
        console.log({Transactions})
        console.log(await transferTxs)
    }
    foo()
    return {
        loading,
        transactionsExist,
        transferTxs: transactionsExist ? transferTxs : {},
        stakingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/MsgCreateValidator"},
                {"tx.value.msg.type":"cosmos-sdk/MsgEditValidator"},
                {"tx.value.msg.type":"cosmos-sdk/MsgDelegate"},
                {"tx.value.msg.type":"cosmos-sdk/MsgUndelegate"},
                {"tx.value.msg.type":"cosmos-sdk/MsgBeginRedelegate"}
            ]
        }).fetch() : {},
        distributionTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/MsgWithdrawValidatorCommission"},
                {"tx.value.msg.type":"cosmos-sdk/MsgWithdrawDelegationReward"},
                {"tx.value.msg.type":"cosmos-sdk/MsgModifyWithdrawAddress"}
            ]
        }).fetch() : {},
        governanceTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/MsgSubmitProposal"},
                {"tx.value.msg.type":"cosmos-sdk/MsgDeposit"},
                {"tx.value.msg.type":"cosmos-sdk/MsgVote"}
            ]
        }).fetch() : {},
        slashingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/MsgUnjail"}
            ]
        }).fetch() : {},
        IBCTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/IBCTransferMsg"},
                {"tx.value.msg.type":"cosmos-sdk/IBCReceiveMsg"}
            ]
        }).fetch() : {},
        updateQuoteTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"microtick/UpdateQuote"}
            ]
        }).fetch() : {},
        settleTradeTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"microtick/SettleTrade"}
            ]
        }).fetch() : {}
    };
})(ValidatorTransactions);
