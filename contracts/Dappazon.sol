// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {

    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }
    
    constructor() {
        owner = msg.sender;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 cost, uint256 stock);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        Item memory item = Item({
            id: _id,
            name: _name,
            category: _category,
            image: _image,
            cost: _cost,
            rating: _rating,
            stock: _stock
        });
        // Save item to blockchain
        items[_id] = item;

        // Trigger event
        emit List(_name, _cost, _stock);
    }

    // Buy product
    function buy(uint256 _id) public payable {
        // Fetch the item
        Item memory item = items[_id];

        // Check it has enough ether to buy the item
        require(msg.value >= item.cost, "Not enough ether to buy the item");    

        // Check if item is available
        require(item.stock > 0, "Item is not available");

        // Create an order
        Order memory order = Order({
            time: block.timestamp,
            item: item
        });
        // save order
        orderCount[msg.sender] += 1;
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Reduce the item stock
        items[_id].stock -= 1;

        // Trigger event
        emit Buy(msg.sender, orderCount[msg.sender], _id);

    }

    // Withdraw funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to withdraw ether"); 
    }

}
