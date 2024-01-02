import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

// ABIs
import Dappazon from "./abis/Dappazon.json";

// Config
import config from "./config.json";

function App() {
  const [dappazon, setDappazon] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);

  const [item, setItem] = useState({});
  const [toggle, setToggle] = useState(false);

  const togglePop = (item) => {
    setItem(item);
    toggle ? setToggle(false) : setToggle(true);
  };

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      // Connect to blockchain
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(_provider);
      const _network = await _provider.getNetwork();
      console.log({ _network });

      // Connect to smart contract
      const _dappazon = new ethers.Contract(
        config[_network.chainId].dappazon.address,
        Dappazon,
        _provider
      );
      setDappazon(_dappazon);

      console.log({ _dappazon, _network });

      // Load products
      const _items = [];
      for (let i = 0; i < 9; i++) {
        const _item = await _dappazon.items(i + 1);
        _items.push(_item);
      }

      const electronics = _items.filter(
        (item) => item.category === "electronics"
      );
      const clothing = _items.filter((item) => item.category === "clothing");
      const toys = _items.filter((item) => item.category === "toys");

      setElectronics(electronics);
      setClothing(clothing);
      setToys(toys);
    } else {
      alert("Please install MetaMask.");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Dappazon Best Sellers</h2>
      {electronics && clothing && toys && (
        <>
          <Section
            title={"Clothing & Jewelry"}
            items={clothing}
            togglePop={togglePop}
          />
          <Section
            title={"Electronics & Gadgets"}
            items={electronics}
            togglePop={togglePop}
          />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />

          {toggle && (
            <Product
              item={item}
              provider={provider}
              account={account}
              dappazon={dappazon}
              togglePop={togglePop}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
