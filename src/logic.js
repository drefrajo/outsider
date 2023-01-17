let provider;
const outsiderABI = [
  "function isEOA(address) view returns (bool)",
  "function proofEOA(address _subject, bytes _sig)",
  "event ProofOfEOA(address subject)"
]
let outsiderContract;

let signer;
let sig;

document.addEventListener('alpine:init', () => {
  let initialState = "unknown";
  let initialProgress = 0;
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    outsiderContract = new ethers.Contract("0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81", outsiderABI, provider);
  } catch (e) {
    initialState = "unsupported";
    initialProgress = 3;
  }

  Alpine.data('interactive', () => ({
    progress: initialProgress,
    state: initialState,
    readable: "Connect your wallet to check your EOA status.",

    setStates(newVal) {
      this.state = newVal;

      switch(newVal) {
        case "true":
          this.readable = "This account is registered as an EOA.";
          break;
        case "false":
          this.readable = "This account is not registered as an EOA";
          break;
        case "unsupported":
          this.readable = "Outsider does not yet support this chain.";
          break;
        case "waiting":
          this.readable = "Your request is currently being processed."
          break;
      }
    },

    async connect() {
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();

      if(signer) {
        let isEOA;
        try {
          isEOA = await outsiderContract.isEOA(await signer.getAddress());
        } catch(e) {
          alert("Outsider is not yet deployed on this chain.");
          this.setStates("unsupported");
          this.progress = 3;
          return;
        }

        if(isEOA) {
          this.setStates("true");
          this.progress = 2;
        } else {
          this.setStates("false");
          this.progress = 1;
        }
      }
    },

    async sign() {
      sig = await signer.signMessage(
        ethers.utils.arrayify(
          ethers.utils.solidityKeccak256(
            ["string"],
            ["I am worthy."]
          )
        )
      );

      if(sig) {
        this.progress = 2;
      }
    },

    async submit() {
      const outsiderWithSigner = outsiderContract.connect(signer);
      this.progress = 3;
      try {
        const tx = await outsiderWithSigner.proofEOA(await signer.getAddress(), sig);
        console.log(tx.hash)
        this.setStates("waiting");
        const receipt = await tx.wait();
        this.setStates("true");
        console.log(receipt)
      } catch (e) {
        console.log(e)
        this.progress = 2;
      }
    }
  }))
})