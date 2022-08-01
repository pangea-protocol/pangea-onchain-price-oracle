// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

interface IExternalOracle {

    function consultPrice(address token) external view returns (uint256);

}
