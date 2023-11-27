//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract T58_1_Caller {
    function call(address _adr, bytes memory payload) public {
        (bool success,) = _adr.call(payload);
        require(success);
    }
}