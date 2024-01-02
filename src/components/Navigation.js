import { ethers } from "ethers";

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const _accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const _account = ethers.utils.getAddress(_accounts[0]);
    setAccount(_account);
  };

  return (
    <nav>
      <div className="nav__brand">
        <h1>Dappazon</h1>
      </div>
      <input type="text" placeholder="Search..." className="nav__search" />

      {account ? (
        <button type="button" className="nav__connect">
          {account.slice(0, 6) + "..." + account.slice(-4)}
        </button>
      ) : (
        <button type="button" className="nav__connect" onClick={connectHandler}>
          Connect
        </button>
      )}

      <ul className="nav__links">
        <li>
          <a href="#Clothing & Jewelery">Clothing & Jewelery</a>
        </li>
        <li>
          <a href="#Electronics & Gadgets">Electronics & Gadgets</a>
        </li>
        <li>
          <a href="#Toys and Gaming">Toys & Gaming</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
