import React from "react";
import { useState } from "react";
import httpRequest from "../axios/baseURL"; // axios request
import SpinnerSvg from "../assets/spinnerSvg"; // Processing SVG

function SendEthForm({ accountId, accBalance }) {
  const [receiverAddress, setReceiverAddress] = useState(""); // Getting receiver address from user
  const [ethValue, setEthValue] = useState(0); // Amount by user
  const [transactionDetails, setTransactionDetails] = useState({}); // Transaction details by ETH RPC API call
  const [viewTransaction, setViewTransaction] = useState(false); // To switch between transactionDetails/form
  const [error, setError] = useState(false); // for displaying error message
  const [isProcessing, setIsProcessing] = useState(false); // processing state
  const { ethereum } = window;

  let ethToWei = ethValue * 1000000000000000000; // Converting ETH value to Wei
  let weiInHexa = ethToWei.toString(16); // wei to Hexadecimal
  //   console.log(weiInHexa);
  //   console.log(accBalance);

  // For formatting wei values retrieved from RPC api calls. Eth value base is 18, in case if value is less than 18, then adds 0.0s before value, if greater than 18, moves decimal point from left to right.
  function formatBalance(input) {
    let inputStr = input.toString();

    if (inputStr.length === 18) {
      inputStr = "0." + inputStr; // adding 0. before string.
      return parseFloat(inputStr).toFixed(4); // converting to number to apply fixed values after decimal
    } else if (inputStr.length < 18) {
      let length = 18 - inputStr.length;
      // console.log(inputStr.length);
      let str = "";
      for (let i = 0; i < length; i++) {
        str += "0";
      }
      inputStr = "0." + str + inputStr; // adding 0s as per length difference
      return parseFloat(inputStr).toFixed(length + 2); // adding fixed position to start from end, if value has 0.000000s from start.
    } else {
      let index = inputStr.length - 18;
      let arr = inputStr.split(""); // sending str chars into array
      arr.splice(index, 0, "."); // adding decimal point "." on length
      console.log(arr);
      inputStr = arr.join(""); // concatinate arr elements back to string
      return parseFloat(inputStr).toFixed(4); // converting to number to apply to fixed
    }
  }

  // Function to perform eth transaction
  async function sendEth(e) {
    e.preventDefault();

    try {
      setError(false);
      setIsProcessing(true);

      // Requests metamask transaction.
      const requestTransaction = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accountId,
            to: receiverAddress,
            value: weiInHexa,
          },
        ],
      });
      if (requestTransaction) {
        setIsProcessing(false); // If user accepted transaction
        // console.log("requestTransaction", requestTransaction);
        const requestObj = {
          id: 66,
          method: "eth_getTransactionByHash",
          params: [requestTransaction.toString()],
        };
        // ETH RPC call to get transaction details.
        let getTransactionDetails = await httpRequest.post("/", requestObj);
        setTransactionDetails(getTransactionDetails.data.result);
        setViewTransaction(true); // Disabling Form and Viewing transaction details.
        // console.log(getTransactionDetails);
      }
    } catch (error) {
      setError(error.message); // display error message
      setIsProcessing(false); // processing state to false if error appears
      if (error.code === 4001) setError("User rejected the transaction");
      else if (error.code === -32602) setError("Invalid Receiver Address");
    }
  }
  // console.log(transactionDetails)
  return (
    <div className=" w-full max-w-2xl">
      <p className=" text-center rounded-lg max-w-lg bg-violet-50 text-violet-500 font-semibold text-sm p-2 border border-violet-200 my-2 mx-auto">
        {accountId}
      </p>

      {viewTransaction
        ? (
            <div className="border border-zinc-300 p-4 w-full bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Transaction hash:
                </p>
                <p className="text-xs text-zinc-500 w-9/12 break-all">
                  {transactionDetails.hash}
                </p>
              </div>

              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Sender:
                </p>
                <p className="text-xs text-zinc-500 w-9/12 break-all">
                  {transactionDetails.from}
                </p>
              </div>
              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Receiver:
                </p>
                <p className="text-xs text-zinc-500 w-9/12 break-all">
                  {transactionDetails.to}
                </p>
              </div>

              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Amount:
                </p>
                <p className="text-xs text-zinc-500 w-9/12 break-all">
                  {ethValue} Eth
                </p>
              </div>

              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Gas Price:
                </p>
                <p className="text-xs text-zinc-500 w-9/12 break-all">
                  {(
                    formatBalance(parseInt(transactionDetails.gasPrice, 16)) *
                    1000000000
                  ).toFixed(2)}
                  Gwei
                </p>
              </div>

              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  Status:
                </p>
                <div className="text-xs text-zinc-500 w-9/12">
                  <p className="bg-green-50 border border-green-200 text-green-500 font-semibold inline p-2 rounded-lg">
                    Success
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between space-x-4 mb-2">
                <p className="text-zinc-400 text-sm font-semibold w-3/12">
                  View on Eth Explorer:
                </p>
                <a
                  className="text-xs  w-9/12 break-all text-blue-500 hover:text-blue-400"
                  href={`https://goerli.etherscan.io/tx/${transactionDetails.hash}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View transaction on Eth Explorer
                </a>
              </div>
              <button
                onClick={() => {
                  setViewTransaction(false);
                }}
                className="bg-violet-500 border w-full text-sm p-2 text-white font-semibold hover:bg-violet-400 duration-200"
              >
                Perform another transaction?
              </button>
            </div>
          )
        : (
            <form
              onSubmit={sendEth}
              className=" border border-zinc-300 rounded-lg p-6 w-full max-w-lg mx-auto shadow-md"
            >
              <label
                className="text-zinc-400 text-sm font-semibold"
                htmlFor="recAddress"
              >
                Receiver's Address
              </label>
              <input
                id="recAddress"
                className="p-2 w-full my-2 border-2 focus-within:border-violet-500 text-xs focus:outline-none rounded-lg placeholder:text-xs invalid:border-red-500"
                placeholder="Enter Receiver Address"
                onChange={(e) => {
                  setReceiverAddress(e.target.value);
                }}
              />
              <label
                className="text-zinc-400 text-sm font-semibold"
                htmlFor="ethValue"
              >
                Amount
              </label>
              <input
                type="number"
                step="any"
                id="ethValue"
                className="p-2 w-full my-2 border-2 focus-within:border-violet-500 text-xs focus:outline-none rounded-lg placeholder:text-xs"
                placeholder="Enter eth amount"
                onChange={(e) => {
                  setEthValue(e.target.value);
                }}
                required
              />
              <p className="w-52 rounded-lg text-green-500 font-semibold text-sm  mb-2">
                Balance: {formatBalance(accBalance)} Eth
              </p>
              <p
                className={`text-rose-600 text-xs inline font-medium ${
                  error ? "block" : "hidden"
                }`}
              >
                {error}
              </p>
              <button
                onSubmit={sendEth}
                className="w-full mt-4 rounded-md bg-violet-500 p-2 text-white font-semibold hover:bg-violet-400 duration-200"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <p>Processing</p>
                    <SpinnerSvg />
                  </div>
                ) : (
                  "Send Balance"
                )}
              </button>
            </form>
          )}
    </div>
  );
}

export default SendEthForm;
