import { GenerateMerkleDatastructure } from '@/utils/lib/generateMerkleDataStructure';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const { NEXT_PUBLIC_BACKEND_BASE_URL, CRON_SECRET, PRIVATE_KEY,
    NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_TOKEN_DISTRIBUTOR_ADDRESS } = process.env;


export async function GET(request: Request) {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    // Verify the secret key
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const data = await executeCronJob();
        console.log("Cron job executed successfully in production");
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error executing cron job:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to execute cron job' },
            { status: 500 }
        );
    }
}

async function executeCronJob() {
    try {
        //fetch the token rewards from the database
        const responseTokenRewards = await fetch(`${NEXT_PUBLIC_BACKEND_BASE_URL}/api/games/dontexistyet/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const tokenRewards = await responseTokenRewards.json();

        //generate the merkle tree
        const { serializedLeaves, merkleRoot } = GenerateMerkleDatastructure(tokenRewards);

        const body = {
            "serialized_leaves": serializedLeaves,
            "modified_date": new Date().toISOString()
        }

        const response = await fetch(`${NEXT_PUBLIC_BACKEND_BASE_URL}/api/games/setMerkelDatastructure/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        //send the merkle root to the smart contract
        const contractMerkleRoot = await readMerkleRoot();
        if ( contractMerkleRoot === merkleRoot ){
            console.log("not sending transaction: merklerook are the same")
            return "no-transaction-sent"
        }
        const txnHash = await sendMerkleRootTransaction(merkleRoot)
        return txnHash;
    } catch (error) {
        console.error('Error in executeCronJob:', error);
        throw error;
    }
}

async function sendMerkleRootTransaction(merkleRoot: string) {
    try {
        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
        // Contract ABI - only including the function we need
        const contractABI = [
            "function updateMerkleRoot(bytes32 _merkleRoot) external"
        ];
        // Create contract instance
        const contract = new ethers.Contract(NEXT_PUBLIC_TOKEN_DISTRIBUTOR_ADDRESS!, contractABI, wallet);
        const gasPrice = await provider.getFeeData();
        const maxFeePerGas = gasPrice.maxFeePerGas ?
            (gasPrice.maxFeePerGas * BigInt(120)) / BigInt(100) : BigInt(100_000_000_000);
        const maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas ?
            (gasPrice.maxPriorityFeePerGas * BigInt(120)) / BigInt(100) : undefined;
        const gasLimit = await contract.updateMerkleRoot.estimateGas(merkleRoot);
        const gasLimitWithBuffer = (gasLimit * BigInt(120)) / BigInt(100); // Add 20% buffer

        const tx = await contract.updateMerkleRoot(merkleRoot, {
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasLimit: gasLimitWithBuffer
        });

        const receipt = await Promise.race([
            tx.wait(2), // Wait for 2 confirmations
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Transaction timeout')), 180000) // 3 minute timeout
            )
        ]);

        if (!receipt) {
            throw new Error('Transaction failed to confirm');
        }

        if (receipt.status === 0) {
            throw new Error('Transaction reverted on chain');
        }

        console.log('Transaction successful:', {
            hash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice.toString()
        });

        return receipt.hash;
    } catch (error) {
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
            // Handle specific error cases
            if (errorMessage.includes('insufficient funds')) {
                errorMessage = 'Wallet has insufficient funds for transaction';
            } else if (errorMessage.includes('nonce')) {
                errorMessage = 'Nonce mismatch - transaction may be pending';
            } else if (errorMessage.includes('timeout')) {
                errorMessage = 'Transaction timed out waiting for confirmation';
            }
        }

        console.error('Transaction failed:', {
            error: errorMessage,
            merkleRoot
        });
        throw new Error(`Failed to send transaction: ${errorMessage}`);
    }
}


async function readMerkleRoot() {
    try {
        // Create provider
        const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_RPC_URL);
        // Contract ABI - including the view function
        const contractABI = [
            "function merkleRoot() external view returns (bytes32)"
        ];
        // Create contract instance - only need provider for reading
        const contract = new ethers.Contract(NEXT_PUBLIC_TOKEN_DISTRIBUTOR_ADDRESS!, contractABI, provider);
        // Call the view function
        const currentMerkleRoot = await contract.merkleRoot();
        console.log('Current merkle root:', currentMerkleRoot);
        return currentMerkleRoot;
    } catch (error) {
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error('Failed to read merkle root:', {
            error: errorMessage
        });

        throw new Error(`Failed to read merkle root: ${errorMessage}`);
    }
}