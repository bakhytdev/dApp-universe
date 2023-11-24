//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract T57_3 {
    event Receive(address indexed sender, uint256 indexed value);
    event SetData(uint256 indexed number, string str, uint256[] data);

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    function setData(uint256 _number, string memory _str, uint256[] memory _data) public {
        emit SetData(_number, _str, _data);
    }
}