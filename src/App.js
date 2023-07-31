import fox from "./assets/MetaMask_Fox.svg.png"
import { useState, useEffect } from "react";
import SendEthForm from "./components/sendEthForm"; //  Transaction Form
import httpRequest from "./axios/baseURL"; // Axios Request
import SpinnerSvg from "./assets/spinnerSvg";

function App() {
  const { ethereum } = window;
  // console.log(ethereum)
  const [checkMetaMaskInstalled, setCheckMetaMaskInstalled] = useState(false); // For checking if metamask is installed in browser
  const [accounthash, setAccountHash] = useState(""); // retreiving account hash from metamask
  const [isChainIdgoreli, setisChainIdgoreli] = useState(false); // Checking network ID of metamask
  const [currentAccBal, setCurrentAccBal] = useState(null); // retreiving account balance from metamask
  const [error, setError] = useState(false); // For displaying errors
  const [isProcessing, setIsProcessing] = useState(false); // for displaying processing state

  // Function for checking if metamask is installed in browser
  function checkIfMetamaskInstalled() {
    ethereum
      ? setCheckMetaMaskInstalled(true)
      : setCheckMetaMaskInstalled(false);
  }

  // Function to perform Ethereum RPC calls on window reload
  async function checkMetaMaskConnection() {
    try {
      // Checks if app is connected to metamask account. returns account hash.
      const getAccountHash = await ethereum.request({
        method: "eth_accounts",
      });
      // Checks chain network of metamask
      const getchainId = await ethereum.chainId;

      // Peroforming an ETH RPC call to get balance of metamask account
      const getAccountBalance = await httpRequest.post("/", {
        method: "eth_getBalance",
        params: [getAccountHash[0].toString(), "latest"],
        id: 66,
      });
      console.log(getAccountBalance.data.result)
      console.log(parseInt(getAccountBalance.data.result,16))
      setAccountHash(getAccountHash[0]);

      // Checks if chain id is goreli, otherwise throws error.
      getchainId === "0x5"
        ? setisChainIdgoreli(true)
        : setisChainIdgoreli(false);

      setCurrentAccBal(parseInt(getAccountBalance.data.result, 16)); // Converting Hexadecimal to decimal.
    } catch (error) {
      if (error.code === 4001) setError(error.message); // user rejected request
      else if (error.code === -32002)
        // pending approval of connection
        setError(
          "Connection to Metamask is waiting for user approval. Please open Metamask window and approve connection."
        );
    }
  }

  useEffect(() => {
    // Running these two functions on window load.
    checkIfMetamaskInstalled();
    checkMetaMaskConnection();
  }, [accounthash.length]);

  async function connectToMetaMask() {
    try {
      setIsProcessing(true); // set processing state to true on button click
      // checks if app connected to metamask. Opens window of metamask to request account access. Returns acc hash.
      const getAccountHash = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountHash(getAccountHash);
    } catch (error) {
      setIsProcessing(false);

      if (error.code === 4001) setError(error.message); // user rejected
      else if (error.code === -32002)
        // connection approval pending on metamask.
        setError(
          "Connection to Metamask is waiting for user approval. Please open Metamask window and approve connection."
        );
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="w-full max-w-3xl p-6 border rounded-lg bg-white shadow-xl">
        {/* Image */}
        <img src={fox} className="w-32 h-32 mx-auto" alt="Logo" />
        <p className="text-center text-2xl font-bold mb-2">Welcome</p>
        {/* Body */}
        {accounthash ? (
          <div className="mx-4">
            {isChainIdgoreli
              ? (
                  <SendEthForm
                    accountId={accounthash}
                    accBalance={currentAccBal}
                  />
                )
              : (
                  <p className="text-rose-600 text-xs text-center bg-rose-50 border rounded-lg border-rose-200 p-2 font-medium">
                    Metamask is not connected to Goreli network. Please open
                    metamask and connect to Goreli network.
                  </p>
                )}
          </div>
        ) : (
          (
            <div>
              <p
                className={`text-rose-600 text-xs text-center bg-rose-50 border rounded-lg border-rose-200 p-2 font-medium ${
                  error ? "block" : "hidden"
                }`}
              >
                {error}
              </p>
              {/* Button */}
              {checkMetaMaskInstalled ? (
                <button
                  onClick={connectToMetaMask}
                  className="w-full mt-4 rounded-md bg-violet-500 p-2 py-4 text-white font-semibold hover:bg-violet-400 duration-200"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <p>Processing</p>
                      <SpinnerSvg />
                    </div>
                  ) : (
                    "Connect To MetaMask"
                  )}
                </button>
              ) : (
                (
                  <p className="text-medium font-semibold text-zinc-500 text-center">
                    MetaMask Extension is not installed. Please install it via
                    this
                    <a
                      className="text-orange-500"
                      href="https://metamask.io/download/"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {" "}
                      Link.
                    </a>
                  </p>
                )
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
