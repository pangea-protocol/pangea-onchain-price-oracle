// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;


interface IPairReserve {

    function WKLAY() external view returns (address);

    function getReserve(address token0, address token1) external view returns (uint256 reserve0, uint256 reserve1);

}
