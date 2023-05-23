const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require("../database.json");

const saveToDatabase = (db) => {
	fs.writeFileSync('./database.json', JSON.stringify(db, null, 2), {
		encoding: 'utf-8'
	});
};

const saveToAdminHistory = (event) => {
	const record = {
		"event": event,
		"timestamp": new Date().toLocaleString()
	}
	db.history["admin"].push(record);
	saveToDatabase(db);
} 

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
		if (account === db.users[0].account && password === db.users[0].password){
			saveToAdminHistory("login")
			res.status(200).json("Login")
		} else {
			saveToAdminHistory("login: Error (Wrong account or password)")
			res.status(404).json({error: "Error"})
		}
	} catch(err) {
		console.log(err);
		saveToAdminHistory("login: Error (Server error)")
		res.status(500).json({error: "Server error"})
	}	
})

router.post("/createAccount", (req, res)=>{
	try {
		const newAccount = req.body.account;
		const newPassword = req.body.password;
		const accountArray = db.users.map(user => {return user.account});
		if (accountArray.includes(newAccount)){
			saveToAdminHistory("createAccount: Error (Account already exists)");
			res.status(400).json({error:"Account already exists"})
		} else {
			const newUser = {
				"account": newAccount,
			    "password": newPassword,
			    "deposit": 0,
			    "loginError": 0
			}
			db.users.push(newUser);
			saveToDatabase(db);
			saveToAdminHistory(`createAccount: Create new accoount ${newAccount}`);
			res.status(200).json("Success")
		}
	} catch (err){
		console.log(err);
		saveToAdminHistory("createAccount: Error (Server error)");
		res.status(500).json({error:"Server error"})
	}
})

router.post("/addDepositToAccount", (req, res)=>{
	try {
		const account = req.body.account;
		const value = Number(req.body.value);
		const accountArray = db.users.map(user => {return user.account});
		const accountIndex = accountArray.indexOf(account);
		if (accountIndex === -1){
			saveToAdminHistory("addDepositToAccount: Error (Account not found)");
			res.status(404).json({error:"Account not found"})
		} else {
			let deposit = db.users[accountIndex].deposit;
			deposit += value
			db.users[accountIndex].deposit = deposit;
			saveToDatabase(db);
			saveToAdminHistory(`addDepositToAccount: Add deposit ${value} to account ${account}`);
			saveToUserHistory(account, `deposit: Received ${value} from admin`);
			res.status(200).json("Success")
		}
	} catch (err){
		console.log(err);
		saveToAdminHistory("addDepositToAccount: Error (Server error)");
		res.status(500).json({error:"Server error"})
	}
})

router.post("/resetAccount", (req, res)=>{
	try {
		const {account, password} = req.body;
		const accountArray = db.users.map(user => {return user.account});
		const accountIndex = accountArray.indexOf(account);
		if (accountIndex === -1){
			saveToAdminHistory("resetAccount: Error (Account not found)");
			res.status(404).json({error:"Account not found"})
		} else {
			let loginError = db.users[accountIndex].loginError;
			if(loginError < 3){
				saveToAdminHistory(`resetAccount: Error (Account ${account}:Password wrong entries less than 3 times)`)
				res.status(400).json({error:"Unqualified"})
			} else if (loginError >= 3){
				db.users[accountIndex].password = password;
				db.users[accountIndex].loginError = 0;
				saveToDatabase(db);
				saveToAdminHistory(`resetAccount: Reset password for account ${account}`)
				saveToUserHistory(account, `resetAccount: Reset password by admin`);
				res.status(200).json("Success")
			}
		}
	} catch (err){
		console.log(err);
		saveToAdminHistory("resetAccount: Error (Server error)");
		res.status(500).json({error:"Server error"})
	}
})

router.get("/adminHistory", (req, res) => {
	try{
		saveToAdminHistory("lookupHistory");
		const adminHistroyArray = db.history["admin"];
		res.status(200).json(adminHistroyArray);
	} catch (err) {
		console.log(err);
		saveToAdminHistory("lookupHistory: Error (Server error)");
		res.status(500).json({error:"Server error"})
	}
})

module.exports = router;