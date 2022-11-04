import { useState } from 'react';
import fire from '../fire'

function WeightExchange()
{
    const usersDB = fire.firestore().collection('users')
    const donator = fire.auth().currentUser.uid;
    const donatorWallet = undefined;
    const receiverWallet = undefined;
    const amount = useState(''); //need user input for this

    function WeightExchange(receiver){
        getDonatorWallet();
        usersDB.where('id', '==', receiver.userID).get()
        .then((snapshot) => {
            receiverWallet = snapshot.docs.map(doc => doc.data().wallet);
            if(snapshot.docs.map(doc => doc.data().purpose) === 'receive' && parseDouble(donatorWallet) > amount)
            {
                usersDB.doc(receiver.userID).update({wallet : (parseDouble(receiverWallet) + amount)})
                usersDB.doc(donator.userID).update({wallet : (parseDouble(donatorWallet) - amount)})
                // console.log(donatorWallet) print each wallet
                // console.log(receiverWallet) to make sure exchange we're correct!
            }
        })
        const getDonatorWallet = async () => {
            donator.doc.get()
            .then((snapshot) => {
                donatorWallet = snapshot.doc.map(doc => doc.data.wallet);
            })
        }
    }

}