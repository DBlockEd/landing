"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Faucet = () => {
    const [verification, setVerification] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [txHash, setTxHash] = useState(null);

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
        if (response.ok && result.message === 'Address is verified') {
            setVerification(true);
            toast.update(toastId.current, {
                render: "Address is verified 🥳",
                isLoading: false,
                autoClose: 5000,
                type: "success",
            });
        } else {
            toast.update(toastId.current, {
                render: "Address is not verified 😢",
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

    return (
        <div className="flex flex-col flex-grow justify-center items-center w-full p-4">
            <Card className="shadow-lg w-full max-w-3xl">
                <CardContent className="flex flex-col justify-between items-center p-6 bg-[#F5F5F5] text-black rounded-[3rem]">
                    <p className="text-center mb-4">Enter your address to receive free Funds</p>
                    <button
                        onClick={checkEligibility}
                        className={`font-semibold py-2 px-4 rounded-lg ${verification ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed`}
                    >
                        {!verification ? 'Verify Eligibility' : 'Verified ✅'}
                    </button>
                    <div className="flex flex-col w-full mt-4">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                            <input
                                type="text"
                                className="border-2 border-black rounded-lg p-2 w-full min-w-[245px]"
                                placeholder="Enter address"
                                value={userAddress}
                                onChange={(e) => setUserAddress(e.target.value)}
                            />
                            <button
                                onClick={sendFunds}
                                disabled={!verification}
                                className={`font-semibold py-2 px-4 rounded-lg ${verification ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'} ${verification ? 'hover:bg-green-600' : ''}`}
                            >
                                Get Funds
                            </button>
                        </div>
                        {txHash && (
                            <p className="text-center mt-4 break-words">
                                Follow your transaction at <a href={`https://holesky.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Etherscan 🚀</a>
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
