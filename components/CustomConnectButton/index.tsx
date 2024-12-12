"use client";
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CustomOpenModal from './customOpenModal';

export const CustomConnectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div className="flex flex-col items-center gap-2.5">
            {!connected && (
              <button
                onClick={openConnectModal}
                className="px-5 py-2.5 text-lg bg-green-600 text-white border-none rounded-lg cursor-pointer"
              >
                Connect Wallet
              </button>
            )}

            {connected && chain.unsupported && (
              <button
                onClick={openChainModal}
                className="px-5 py-2.5 text-lg bg-red-600 text-white border-none rounded-lg cursor-pointer"
              >
                Wrong Network
              </button>
            )}

            {connected && !chain.unsupported && (
              <div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 text-lg bg-blue-600 text-white border-none rounded-lg cursor-pointer"
                >
                  {account.displayName}
                </button>
                {isModalOpen && (
                  <CustomOpenModal
                    account={account}
                    openChainModal={openChainModal}
                    setIsModalOpen={setIsModalOpen}
                  />
                )}
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
