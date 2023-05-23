$(".modal").on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
})

function closeModal(id){
	$(id).modal("hide")
}

function inputValidation(array){
	for(item of array){
		if (item === "" || item === undefined){
			return false
		}
	}
	return true
}

// 管理員
//管理員登入
function adminLogin () {
	const account = document.getElementById("adminAccount").value;
	const password = document.getElementById("adminPassword").value;

	if(!inputValidation([account,password])){
		alert("Invalid input")
		return
	};

	fetch("/admin", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            password: password
        })
    })
	.then(response => response.json())
	.then(data => {
		if (data.error === "Error"){
			alert("錯誤的帳號或密碼")
		} else if(data.error === "Server error"){
			alert("未知的錯誤，請稍後再試")	
		} else if (data === "Login"){
			const adminDashboard = document.getElementById("adminDashboard");
			const userDashboard = document.getElementById("userDashboard");
			adminDashboard.style.display = "contents";
			userDashboard.style.display = "none";
			document.getElementById("adminHistory").style.display = "none";
			closeModal("#adminLoginModal")
		}
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

//管理員新增帳號
function createNewAccount() {
	const account = document.getElementById("newAccount").value;
	const password = document.getElementById("newPassword").value;
	
	if(!inputValidation([account,password])){
		alert("Invalid input")
		return
	};

	fetch("/admin/createAccount", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            password: password
        })
    })
	.then(response => response.json())
	.then(data => {
		if (data.error){
			if(data.error === "Account already exists"){
				alert("此帳號已存在")
			} else if(data.error === "Server error"){
				alert("未知的錯誤，請稍後再試")	
			}
		} else if (data === "Success"){
			alert("成功新增帳號");
			closeModal("#createAccountModal")
		}
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

//管理員新增帳號存款
function addDeposit() {
	const account = document.getElementById("depositAccount").value;
	const deposit = document.getElementById("depositValue").value;

	if(!inputValidation([account])){
		alert("Invalid input")
		return
	};

	if (isNaN(Number(deposit))){
		alert("請輸入正確的金額")
		return
	}

	fetch("/admin/addDepositToAccount", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            value: deposit
        })
    })
	.then(response => response.json())
	.then(data => {
		if (data.error){
			if(data.error === "Account not found"){
				alert("查無此帳號")
			} else if(data.error === "Server error"){
				alert("未知的錯誤，請稍後再試")	
			}
		} else if (data === "Success"){
			alert("成功新增存款");
			closeModal("#depositModal")
		}
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

//管理員重置帳號
function resetAccount() {
	const account = document.getElementById("resetAccount").value;
	const password = document.getElementById("resetPassword").value;
	
	if(!inputValidation([account,password])){
		alert("Invalid input")
		return
	};

	fetch("/admin/resetAccount", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            password: password
        })
    })
	.then(response => response.json())
	.then(data => {
		if (data.error){
			if(data.error === "Account not found"){
				alert("此帳號不存在")
			} else if(data.error === "Unqualified"){
				alert("連續輸入密碼錯誤次數未超過3次，不可重設密碼")	
			} else if(data.error === "Server error"){
				alert("未知的錯誤，請稍後再試")	
			}
		} else if (data === "Success"){
			alert("成功重置密碼");
			closeModal("#resetAccountModal")
		}
	})
	.catch(err => {
    	console.log('login error', err)
    })
}


//管理員查詢歷史紀錄
function adminHistory(){
	const adminHistoryDiv = document.getElementById("adminHistory")

	if (adminHistoryDiv.style.display === "contents"){
		adminHistoryDiv.style.display = "none";
		return
	}

	const adminHistoryTableBody = document.getElementById("adminHistoryBody");
	adminHistoryDiv.style.display = "contents";
	adminHistoryTableBody.innerHTML = "";

	fetch("/admin/adminHistory")
	.then(results => results.json())
	.then(array => {
		if (array.error === "Server error"){
			alert("未知的錯誤，請稍後再試")
		} else {
			let th = document.createElement('th');			
			for (let item of array) {
				let tr = document.createElement('tr');			
				let tdEvent = document.createElement('td');
				let tdTime = document.createElement('td');
				tdEvent.textContent = item.event;
				tdTime.textContent = item.timestamp;
				tr.appendChild(tdEvent);
				tr.appendChild(tdTime);
				adminHistoryTableBody.appendChild(tr)
			}
		}
	})
}


// 使用者
// 使用者登入
function userLogin () {
	const account = document.getElementById("userAccount").value;
	const password = document.getElementById("userPassword").value;

	if(!inputValidation([account,password])){
		alert("Invalid input")
		return
	};

	fetch("/users", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            password: password
        })
    })
	.then(response => response.json())
	.then(data => {
		if (data.error){
			if(data.error === "Account not found"){
				alert("查無此帳號")
			} else if(data.error === "Exceed password retry entry limit"){
				alert("帳號已被鎖住，請聯絡管理者")	
			} else if(data.error === "Wrong password"){
				alert(`連續密碼輸入錯誤次數${data.loginError}次，連續三次輸入密碼錯誤將鎖住帳號`)	
			} else if(data.error === "Server error"){
				alert("未知的錯誤，請稍後再試")	
			}
		} else if (data === "Login"){
			const adminDashboard = document.getElementById("adminDashboard");
			const userDashboard = document.getElementById("userDashboard");
			adminDashboard.style.display = "none";
			userDashboard.style.display = "contents";
			userDashboard.setAttribute("value", account);
			document.getElementById("userHistory").style.display = "none";
			closeModal("#userLoginModal")
		}
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

// 使用者查詢存款
function lookupDeposit() {
	const account = userDashboard.getAttribute("value");
	fetch(`/users/lookupDeposit/${account}`)
	.then(response => response.json())
	.then(data => {
		if(data.error === "Account not found"){
			alert("查無此帳號")
		} else if(data.error === "Server error"){
			alert("未知的錯誤，請稍後再試")	
		} else {
			document.getElementById("accountDeposit").innerHTML = data;
		}		
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

// 使用者轉帳
function transfer(){
	const accountWithdraw = userDashboard.getAttribute("value");
	const accountTransfer = document.getElementById("transferAccount").value;
	const value = document.getElementById("transferValue").value;

	if(!inputValidation([accountTransfer])){
		alert("Invalid input")
		return
	};

	if (isNaN(Number(value))){
		alert("請輸入正確的金額")
		return
	}

	fetch("/users/transfer", {
		method: "post",
		headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            accountWithdraw: accountWithdraw,
            accountTransfer: accountTransfer,
            value: value
        })
	})
	.then(response => response.json())
	.then(data => {
		if(data.error === "Account not found"){
			alert("查無對方帳號，轉帳失敗");
		} else if(data.error === "Bad Request"){
			alert("帳號金額不足，轉帳失敗");
		} else if(data.error === "Server error"){
			alert("未知的錯誤，請稍後再試");	
		} else if(data === "done"){
			alert("轉帳成功");
			closeModal("#transferModal")
		}		
	})
	.catch(err => {
    	console.log('login error', err)
    })
}

// 使用者查詢歷史紀錄
function userHistory(){
	const userHistoryDiv = document.getElementById("userHistory");

	if (userHistoryDiv.style.display === "contents"){
		userHistoryDiv.style.display = "none";
		return
	}

	const account = userDashboard.getAttribute("value");
	const userHistoryTableBody = document.getElementById("userHistoryBody");
	userHistoryDiv.style.display = "contents";
	userHistoryTableBody.innerHTML = "";
	
	fetch(`/users/userHistory/${account}`)
	.then(results => results.json())
	.then(array => {
		if (array.error === "Server error"){
			alert("未知的錯誤，請稍後再試")
		} else {
			let th = document.createElement('th');			
			for (let item of array) {
				let tr = document.createElement('tr');			
				let tdEvent = document.createElement('td');
				let tdTime = document.createElement('td');
				tdEvent.textContent = item.event;
				tdTime.textContent = item.timestamp;
				tr.appendChild(tdEvent);
				tr.appendChild(tdTime);
				userHistoryTableBody.appendChild(tr)
			}
		}
	})
}


