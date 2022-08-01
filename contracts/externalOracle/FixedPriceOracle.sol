// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "../interfaces/IExternalOracle.sol";

// Mocking Price Oracle
contract FixedPriceOracle is IExternalOracle {
    function consultPrice(address token) external view returns (uint256 price) {
        return 10 ** 6;
    }
}
