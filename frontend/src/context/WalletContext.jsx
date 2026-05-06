import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);
// null default means any consumer outside the provider will get null

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null); // ethers.Wallet instance  null until loadWallet() succeeds
  const [pendingPassword, setPendingPassword] = useState(null);
  // pendingPassword holds the plaintext password temporarily between login and WalletSetup
  // it is set in LoginPage after login succeeds and consumed + cleared by WalletSetup
  // it lives in memory only  never written to localStorage

  const loadWallet = async (password) => {
    // called right after a successful login API response
    // password is the plaintext the user just typed  same password used to encrypt the keystore at setup
    // it is used here only to decrypt, never stored

    const keystoreJson = localStorage.getItem("trustchain_keystore");
    // check if a keystore exists in this browser
    // if not, this is a first login  store password for WalletSetup to use, then return
    if (!keystoreJson) {
      setPendingPassword(password); // WalletSetup will consume this to encrypt the new keystore
      return;
    }

    // fromEncryptedJson reverses the encryption done at setup:
    //   scrypt(password, salt from keystore) -> derived key -> AES-128-CTR decrypt -> private key
    // this takes 3-5s because scrypt same as encryption
    // if the password is wrong it throws "invalid password"  the caller must catch this
    const decrypted = await ethers.Wallet.fromEncryptedJson(
      keystoreJson,
      password,
    );
    // decrypted is a full ethers.Wallet object with .address and signing capability

    setWallet(decrypted);
    // store in React state  available to all consumers for the rest of the session
    // the private key lives only in this object in memory, never written anywhere
  };

  const clearWallet = () => {
    // called on logout to wipe the wallet and any pending password from memory
    // after this wallet is null and no signing is possible until next login
    setWallet(null);
    setPendingPassword(null);
  };

  return (
    <WalletContext.Provider
      value={{ wallet, loadWallet, clearWallet, pendingPassword }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
// hook for consuming the wallet context in any component
// usage: const { wallet, loadWallet, clearWallet } = useWallet()
