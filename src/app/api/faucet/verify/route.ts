import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { abi, address } from '../../../../lib/constants';
require("dotenv").config();

let provider: ethers.providers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

function initializeContract() {
    if (!provider || !signer || !contract) {
        const privateKey = process.env.PRIVATE_KEY;
        const rpcUrl = process.env.SEPOLIA_RPC_URL;

        if (!privateKey || !rpcUrl) {
            throw new Error('Missing environment variables: PRIVATE_KEY or SEPOLIA_RPC_URL');
        }

        provider = new ethers.providers.JsonRpcProvider({
            url: rpcUrl,
            skipFetchSetup: true,
        });
        signer = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(address, abi, signer);
    }
}

async function verify(userAddress: string) {
    try {
        initializeContract();

        const [canWithdrawResult, reason, lastWithdrawalTime] = await contract!.canWithdraw(userAddress);
        const withdrawalDelay = await contract!.withdrawalDelay();

        if (canWithdrawResult) {
            return NextResponse.json({ message: 'Address is allowed to withdraw', lastWithdrawalTime, withdrawalDelay });
        } else {
            return NextResponse.json({ message: reason, lastWithdrawalTime, withdrawalDelay });
        }
    } catch (error) {
        console.error('Error during verification:', error);
        return NextResponse.json({ message: 'Failed to verify address' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userAddress = body.address;

        return await verify(userAddress);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
}
