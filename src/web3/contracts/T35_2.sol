//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

struct St{
    uint256 number;
    string str;
}

contract T35_2_Main {

    uint256 public x;
    uint256 public y;
    string public str;
    
    uint256[] data;

    mapping(address => St) public map;

    constructor(uint256 _x, uint256 _y, string memory _str){
        x = _x;
        y = _y;
        str = _str;
    }

    function setXY(uint256 _x, uint256 _y)public returns(uint256){
        x = _x;
        y = _y;
        return _x + _y;
    }

    function setStr(string memory _str)public{
        str = _str;
    }

    function init(uint256 _count)public returns(uint256[] memory){
        for(uint256 i = 0; i < _count; i++){
            data.push(i * i);
        }
        return data;
    }

    function addToMap(address _adr, St memory _st) public {
        map[_adr] = _st;
    }
}

interface T35_2_Interface {
    function x() external view returns (uint256);
    function y() external view returns (uint256);
    function str() external view returns (string memory);
    function data(uint256) external view returns (uint256[] memory);
    function map(address) external view returns (St memory);

    function setXY(uint256, uint256) external returns (uint256);
    function setStr(string memory) external;
    function init(uint256) external returns(uint256[] memory);
    function addToMap(address, St memory) external;
}

contract T35_2_Caller {
    T35_2_Interface mainContract;

    constructor(address _adr) {
        mainContract = T35_2_Interface(_adr);
    }

    function x() external view returns (uint256) {
        return mainContract.x();
    }

    function y() external view returns (uint256) {
        return mainContract.y();
    }

    function str() external view returns (string memory) {
        return mainContract.str();
    }

    function data(uint256 _index) external view returns (uint256[] memory) {
        return mainContract.data(_index);
    }

    function map(address _adr) external view returns (St memory) {
        return mainContract.map(_adr);
    }

    function setXY(uint256 _x, uint256 _y)public returns(uint256){
        bytes memory _payload = abi.encodeWithSignature(
            "setXY(uint256,uint256)",
            _x,
            _y
        );
        (bool success, bytes memory returnData) = address(mainContract).call(_payload);
        require(success);
        (uint256 _value) = abi.decode(returnData, (uint256));
        return _value;
    }

    function setStr(string memory _str)public{
        bytes memory _payload = abi.encodeWithSignature(
            "setStr(string)",
            _str
        );
        (bool success,) = address(mainContract).call(_payload);
        require(success);
    }

    function init(uint256 _count) external returns(uint256[] memory) {
        bytes memory _payload = abi.encodeWithSignature(
            "init(uint256)",
            _count
        );
        (bool success, bytes memory returnData) = address(mainContract).call(_payload);
        require(success);
        (uint256[] memory _data) = abi.decode(returnData, (uint256[]));
        return _data;
    }

    function addToMap(address _adr, St memory _st) public {
        bytes memory _payload = abi.encodeWithSignature(
            "addToMap(address, St)",
            _adr,
            _st
        );
        (bool success,) = address(mainContract).call(_payload);
        require(success);
    }
}