# Outsider
I am not a smart contract.

## Introduction
Especially with the introduction of SBTs (soulbound tokens) it might be necessary to differentiate between EOAs (externally owned accounts) and smart contracts. 
The only reliable way to do this, from what I know, is by requiring to sign a predetermined message. 
The existence of such a signature can therefore proof an account to be externally owned.

## Usage
In your smart contract, you can use something akin to the following:
```
abstract contract IOutsider {
    mapping(address => bool) public isEOA;
    function proofEOA(address _subject, bytes memory _sig) public virtual;
}

contract <YourContract> {
    IOutsider outsider = IOutsider(0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81);

    // check for EOA
    function yourFunction() public {
        require(outsider.isEOA(msg.sender));
        ...
    }

    // register as EOA, to combine with own registration logic (in case there is any)
    function yourRegistrationFunction(bytes memory _sig) public {
        proofEOA(msg.sender, _sig);
        ...
    }
}
```

## How it works
Users proof their accounts to be externally owned by signing `0xe171a8671c07fc3c8903fd80085d685735c5343be5eb544bec23614c63e0dc3a`, the keccak256 of the message `I am worthy.` (Note: When using ethers this hash needs to be arrayified first, I haven't tested web3.js).
This signature, in combination with its corresponding address, is submitted to the outsider protocol, which verifies the data and remembers the address as an EOA.
Any smart contract can then query this data by calling `isEAO(<address>)`.


## Considerations
This contract is located at `0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81` on the following chains: 

| Mainnet | Testnet |
| ------- | ------- |
| Ethereum | Goerli  |
| Polygon | Mumbai  |

While it is easiest for the end user if a dApp automatically performs this registration process, there is a frontend to register manually.

After some informal testing it seems to be a bit (around 1500 gas when using Remix VM (London)) more expensive to use this contract instead of verifying a signature each time an EOA is required. Though, I believe, that in the name of user experience, this is an acceptable tradeoff.

The way this contract is built makes it theoretically possible for one signature to be used accross many EVM compatible chains, without requiring any further activities from users. This is intentional and should not pose a problem, as this system can only be used to enable EOAs to perform actions a smart contract cannot.

Just for clarification: the outsider protocol is opt-in for EOAs, but denied to smart contracts. Thus, developers should not grant any priviledges when `isEOA()` returns false.

The message to sign is predetermined to block one-time-use EOAs.

The OpenZeppelin library is used to ensure security.

If you have any questions, shoot me a DM on [Twitter](https://twitter.com/drefrajo).

If you want to see this contract on more chains (located at the same address), feel free to send some network native tokens to:
0x33Ed4c754221b1ba203eF9790f12B26BeDBED903

Also this contract is not audited (might be a good idea, but out of my reach).

### Dev Notes:
Verify using (might need to clear artifacts):

`npx hardhat verify --network <network> 0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81`

Also make sure that the first tx of the deployment account on any new network is the deployment tx (as the nonce needs to be 0 to produce the same contract address).