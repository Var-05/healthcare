let web3;
let contract;
let userAccount;

const contractAddress = "0x47bf0d8e591D83Dc9C439c51d1BFB167E2C18F2d";
const contractABI =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "AccountCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "doctorName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "hospital",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "wardType",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "appointmentTime",
				"type": "uint256"
			}
		],
		"name": "AppointmentBooked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_doctorName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_hospital",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_department",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_wardType",
				"type": "string"
			}
		],
		"name": "bookAppointment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "createAccount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyAppointment",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "doctorName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "hospital",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "department",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "wardType",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "hasAppointment",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_newUsername",
				"type": "string"
			}
		],
		"name": "updateUsername",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Connect MetaMask and contract
async function connectBlockchain() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("Connected to MetaMask:", userAccount);
  } else {
    alert("Please install MetaMask to use this feature.");
  }
}

// Create patient account (used in index.html)
async function createAccount() {
  const username = document.getElementById("newUsername").value;
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  await connectBlockchain();
  const isRegistered = await contract.methods.isRegistered(userAccount).call();

  if (!isRegistered) {
    await contract.methods.createAccount(username).send({ from: userAccount });
    alert("Account created successfully!");
  } else {
    alert("Account already exists.");
  }

  showLogin(); // Show login form (function in index.js)
}

// Redirect to appointment.html from dashboard
function redirectToAppointment(name, experience, hospital, department) {
  window.location.href = `appointment.html?doctor=${name}&hospital=${hospital}&department=${department}&experience=${experience}`;
}

// Show doctors for a department (used in dashboard.html)
function showDoctors(dept) {
  const doctorsList = document.getElementById("doctorsList");
  doctorsList.innerHTML = "";

  departments[dept].forEach(doc => {
    const card = `
      <div class='card bg-light text-dark p-3 m-2' onclick='redirectToAppointment("${doc.name}", "${doc.experience}", "${doc.hospital}", "${dept}")'>
        <h5 class='text-danger'>${doc.name}</h5>
        <p><strong>Experience:</strong> ${doc.experience}</p>
        <p><strong>Hospital:</strong> ${doc.hospital}</p>
      </div>`;
    doctorsList.innerHTML += card;
  });
}

// Book appointment (used in appointment.html)
async function bookBed(doctorName, hospital, department, wardType) {
  await connectBlockchain();
  const isRegistered = await contract.methods.isRegistered(userAccount).call();

  if (!isRegistered) {
    throw new Error("User not registered.");
  }

  await contract.methods.bookAppointment(doctorName, hospital, department, wardType).send({ from: userAccount });
  console.log("Appointment booked.");
}

// Fetch appointment data (used in patient-details.html)
async function getMyAppointment() {
  await connectBlockchain();
  const appointment = await contract.methods.getMyAppointment().call({ from: userAccount });

  if (!appointment || !appointment.hasAppointment) {
    document.getElementById("appointmentDetails").innerHTML = "<p>No appointment found.</p>";
    return;
  }

  document.getElementById("appointmentDetails").innerHTML = `
    <h3>Patient Appointment Summary</h3>
    <p><strong>Username:</strong> ${appointment.username}</p>
    <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
    <p><strong>Hospital:</strong> ${appointment.hospital}</p>
    <p><strong>Department:</strong> ${appointment.department}</p>
    <p><strong>Ward Type:</strong> ${appointment.wardType}</p>
    <p><strong>Status:</strong> ${appointment.hasAppointment ? "Confirmed" : "Not Booked"}</p>
  `;
}
