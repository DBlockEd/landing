"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BigNumber, ethers } from 'ethers';

const Faucet = () => {
    const [verification, setVerification] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [lastWithdrawalTime, setLastWithdrawalTime] = useState<BigNumber | null>(null);
    const [withdrawalDelay, setWithdrawalDelay] = useState<BigNumber | null>(null);

    const toastId = React.useRef<string | number | null>(null);

    const checkEligibility = async () => {
        toastId.current = toast.loading("Verifying Address...");
        const response = await fetch('/api/faucet/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: userAddress })
        });
        const result = await response.json();
        if (response.ok && result.message === 'Address is allowed to withdraw') {
            setVerification(true);
            setLastWithdrawalTime(BigNumber.from(result.lastWithdrawalTime));
            setWithdrawalDelay(BigNumber.from(result.withdrawalDelay));
            toast.update(toastId.current, {
                render: "Address is verified 🥳",
                isLoading: false,
                autoClose: 5000,
                type: "success",
            });
        } else if (response.ok && result.message === 'Withdrawal delay not met') {
            setVerification(false);
            setLastWithdrawalTime(BigNumber.from(result.lastWithdrawalTime));
            setWithdrawalDelay(BigNumber.from(result.withdrawalDelay));
            toast.update(toastId.current, {
                render: "Withdrawal delay not met 🕒",
                isLoading: false,
                autoClose: 5000,
                type: "error",
            });
        } else {
            setVerification(false);
            setLastWithdrawalTime(null);
            setWithdrawalDelay(null);
            toast.update(toastId.current, {
                render: result.message || "Address is not verified 😢",
                isLoading: false,
                autoClose: 5000,
                type: "error",
            });
        }
    }

    const sendFunds = async () => {
        toastId.current = toast.loading("Sending Funds...");
        const response = await fetch('/api/faucet/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: userAddress })
        });

        if (response.ok) {
            const data = await response.json();
            const txHash = data.txHash;
            setTxHash(txHash);
            setVerification(false); 
            toast.update(toastId.current, {
                render: "Funds Sent Successfully! 🎉",
                isLoading: false,
                autoClose: 5000,
                type: "success",
            });
        } else {
            toast.update(toastId.current, {
                render: "Failed to send Funds",
                isLoading: false,
                autoClose: 5000,
                type: "error",
            });
        }
    }

    const formatDate = (timestamp: BigNumber | string) => {
        let numericTimestamp: number;

        if (typeof timestamp === 'string') {
            numericTimestamp = parseInt(timestamp, 16);
        }
        else if (BigNumber.isBigNumber(timestamp)) {
            numericTimestamp = timestamp.toNumber();
        } else {
            throw new Error('Invalid timestamp format');
        }
        if (numericTimestamp === 0) return "Never";

        const date = new Date(numericTimestamp * 1000);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
    };

    const getNextWithdrawalTime = () => {
        if (lastWithdrawalTime && withdrawalDelay) {
            const nextTime = lastWithdrawalTime.add(withdrawalDelay);
            return formatDate(nextTime);
        }
        return "Invalid date";
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value;
        setUserAddress(address);
        setIsValidAddress(ethers.utils.isAddress(address));
        setVerification(false); 
        setLastWithdrawalTime(null);
        setWithdrawalDelay(null);
    }

    return (
        <div className="flex flex-col flex-grow justify-center items-center w-full p-4">
            <Card className="shadow-lg w-full max-w-3xl">
                <CardContent className="flex flex-col justify-between items-center p-6 bg-[#F5F5F5] text-black rounded-[3rem]">
                    <p className="text-center mb-4">Enter your address to receive free Funds</p>
                    <button
                        onClick={checkEligibility}
                        className={`font-semibold py-2 px-4 rounded-lg ${verification ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed`}
                        disabled={!isValidAddress || verification}
                    >
                        {!verification ? 'Verify Eligibility' : 'Verified ✅'}
                    </button>
                    <div className="flex flex-col w-full mt-4">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                            <input
                                type="text"
                                className={`border-2 rounded-lg p-2 w-full min-w-[245px] ${isValidAddress ? 'border-black' : 'border-red-500'}`}
                                placeholder="Enter address"
                                value={userAddress}
                                onChange={handleAddressChange}
                            />
                            <button
                                onClick={sendFunds}
                                disabled={!verification}
                                className={`font-semibold py-2 px-4 rounded-lg ${verification ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'} ${verification ? 'hover:bg-green-600' : ''}`}
                            >
                                Get Funds
                            </button>
                        </div>
                        {!isValidAddress && (
                            <p className="text-red-500 text-center mt-2">Invalid Ethereum address</p>
                        )}
                        {txHash && (
                            <p className="text-center mt-4 break-words">
                                Follow your transaction at <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Etherscan 🚀</a>
                            </p>
                        )}
                        {lastWithdrawalTime !== null && (
                            <p className="text-center mt-4">
                                Last withdrawal time: {formatDate(lastWithdrawalTime)}
                            </p>
                        )}
                        {lastWithdrawalTime !== null && withdrawalDelay !== null && !verification && (
                            <p className="text-center mt-4">
                                Next possible withdrawal time: {getNextWithdrawalTime()}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <ToastContainer />
        </div>
    );
}

export default Faucet;
