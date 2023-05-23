const express = require("express");
const router = express.Router();
const fs = require('fs');
const db = require("../database.json");

const saveToDatabase = (db) => {
	fs.writeFileSync('./database.json', JSON.stringify(db, null, 2), {
		encoding: 'utf-8'
	});
};

const saveToUserHistory = (user, event) => {
	const record = {
		"event": event,
		"timestamp": new Date().toLocaleString()
	}
	if (db.history[user]){
		db.history[user].push(record);
	} else {
		db.history[user] = [record];
	}
	
	saveToDatabase(db);
}



router.post("/", (req, res) => {
	try {
		const {account, password} = req.body;
		const accountArray = db.users.map(user => {return user.account});
		const accountIndex = accountArray.indexOf(account);
		if (accountIndex === -1){
			res.status(404).json({error:"Account not found"});
		} else {
			let loginError = db.users[accountIndex].loginError;
			if (loginError >= 3){
				saveToUserHistory(account, "login: Error (Exceed password retry entry limit)")
				res.status(403).json({error:"Exceed password retry entry limit"})
			} else {
				if (password === db.users[accountIndex].password){
					saveToUserHistory(account, "login")
					res.status(200).json("Login");
				} else {
					loginError += 1;
					db.users[accountIndex].loginError = loginError;
					saveToDatabase(db);
					saveToUserHistory(account, "login: Error (Wrong password)")
					res.status(404).json({error:"Wrong password", loginError:loginError});
				}
			}			
		}
	} catch(err) {
		console.log(err);
		saveToUserHistory(account, "login: Error (Server error)")
		res.status(500).json({error: "Server error"})
	}	
})


router.get("/lookupDeposit/:account", (req, res) => {
	try{
		const account = req.params.account;
		const accountArray = db.users.map(user => {return user.account});
		const accountIndex = accountArray.indexOf(account);
		if (accountIndex === -1){
			saveToUserHistory(account, "lookupDeposit: Error (Account not found)")
			res.status(404).json({error:"Account not found"})
		} else {
			const deposit = db.users[accountIndex].deposit;
			saveToUserHistory(account, "lookupDeposit");
			res.status(200).json(deposit);
		}	
	} catch (err) {
		console.log(err);
		saveToUserHistory(account, "lookupDeposit: Error (Server error)")
		res.status(500).json({error:"Server error"})
	}
})

router.post("/transfer", (req, res) => {
	try{
		const accountWithdraw = req.body.accountWithdraw;
		const accountTransfer = req.body.accountTransfer;
		const value = Number(req.body.value);

		const accountArray = db.users.map(user => {return user.account});
		const accountWithdrawIndex = accountArray.indexOf(accountWithdraw);
		const accountTransferIndex = accountArray.indexOf(accountTransfer);

		if (accountTransferIndex === -1){
			saveToUserHistory(accountWithdraw, "transfer: Error (Account not found)")
			res.status(404).json({error:"Account not found"})
		} else {
			let userDeposit = db.users[accountWithdrawIndex].deposit
			if (userDeposit < value){
				saveToUserHistory(accountWithdraw, "transfer: Error (Unqualified)")
				res.status(400).json({error:"Bad Request"});
			} else {
				db.users[accountWithdrawIndex].deposit -= value;
				db.users[accountTransferIndex].deposit += value;
				saveToDatabase(db);
				saveToUserHistory(accountWithdraw, `transfer: Transfer ${value} to ${accountTransfer}`)
				saveToUserHistory(accountTransfer, `transfer: Received  ${value} from ${accountWithdraw}`)
				res.status(200).json("done");
			}
		}
	} catch(err) {
		console.log(err);
		saveToUserHistory(account, "transfer: Error (Server error)")
		res.status(500).json({error:"Server error"})
	}
})



router.get("/userHistory/:account", (req, res) => {
	try{
		const account = req.params.account;
		saveToUserHistory(account, "lookupHistory");
		const userHistroyArray = db.history[account];
		res.status(200).json(userHistroyArray);
	} catch (err) {
		console.log(err);
		saveToUserHistory("lookupHistory: Error (Server error)");
		res.status(500).json({error:"Server error"})
	}
})

module.exports = router;