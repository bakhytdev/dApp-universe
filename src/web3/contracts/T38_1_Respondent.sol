//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract T38_1_Respondent {

    event TargetEvent(uint256 indexed x);

    function target(uint256 x) public {
        emit TargetEvent(x);
    }
}