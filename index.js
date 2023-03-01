import { ethers } from "./ethers.js"
import { abi, contracAddress } from "./constant.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const balance = document.getElementById("balance")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

// console.log(ethers)
async function connect() {
    //we can find metamask by this code
    if (typeof window.ethereum !== "undefied") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Install Metamask"
    }
}

//Para gonderilen hesaptaki miktari ogrenmeye yardimci oluyor.
async function getBalance() {
    if (typeof window.ethereum !== "undefied") {
        //providerler sayesinde biz metamaskdaki accaountlara baglanyas
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //hesaptaki parayi gormemizi saglaya
        const sonuc = await provider.getBalance(contracAddress)
        //yazdirmamizi saglaya
        balance.innerHTML = `Your Balance is: ${ethers.utils.formatEther(
            sonuc
        )} eth`
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Eth Amount is : ${ethAmount}`)
    if (typeof window.ethereum !== "undefied") {
        //providerler sayesinde biz metamaskdaki accaountlara baglanyas
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //signer sayesinde wallete  baglanyas.
        const signer = provider.getSigner()

        const contract = new ethers.Contract(contracAddress, abi, signer)

        try {
            // BU KOD bloguyla biz fund me contaractini aktif ediyoruz.
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!!!!!")
        } catch (error) {
            console.error(error)
        }
    }
}

//Bu fonksiyonda biz trasnferin gerceklesdimi onu takip etmeye calisiyoruz
//Onuda provider.once koduyla yapicaz
function listenForTransactionMine(transactionRespenso, provider) {
    console.log(`Mining :${transactionRespenso.hash}......`)
    return new Promise((resolve, reject) => {
        provider.once(transactionRespenso.hash, (transactionReceipt) => {
            console.log(`Completed with : ${transactionReceipt.confirmations}`)
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefied") {
        console.log("Withdrawing..... ")
        //providerler sayesinde biz metamaskdaki accaountlara baglanyas
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contracAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
